import { Daemon } from "./daemon";
import { WalletRPC } from "./wallet-rpc";
import { ipcMain, dialog } from "electron";

const os = require("os");
const fs = require("fs");
const path = require("path");

export class Backend {
    constructor(mainWindow) {
        this.mainWindow = mainWindow
        this.daemon = null
        this.walletd = null
        this.config_dir = null
        this.config_file = null
        this.config_data = {}
    }

    init() {

        if(os.platform() == "win32") {
	    this.config_dir = "C:\\ProgramData\\uplexa";
	    //this.config_dir = path.join(os.homedir(), "uplexa");
        } else {
            this.config_dir = path.join(os.homedir(), ".uplexa");
        }

        if (!fs.existsSync(this.config_dir)) {
            fs.mkdirSync(this.config_dir);
        }

	if (!fs.existsSync(path.join(this.config_dir, "gui"))) {
            fs.mkdirSync(path.join(this.config_dir, "gui"));
        }

        this.config_file = path.join(this.config_dir, "gui", "config.json");

        this.config_data = {

            app: {
                data_dir: this.config_dir,
                ws_bind_port: 21066,
                testnet: false
            },

            appearance: {
                theme: "dark"
            },

            daemon: {
                type: "remote",
                remote_host: "remote.uplexa.com",
                remote_port: 21061,
                p2p_bind_ip: "0.0.0.0",
                p2p_bind_port: 21060,
                rpc_bind_ip: "127.0.0.1",
                rpc_bind_port: 21061,
                zmq_rpc_bind_ip: "127.0.0.1",
                zmq_rpc_bind_port: 21062,
                out_peers: -1,
                in_peers: -1,
                limit_rate_up: -1,
                limit_rate_down: -1,
                log_level: 0
            },

            wallet: {
                rpc_bind_port: 21065,
                log_level: 0
            }
        }

        ipcMain.on("event", (event, data) => {
            this.receive(data)
        })

        this.startup()

    }

    send(event, data={}) {
        let message = {
            event,
            data
        }

        this.mainWindow.webContents.send("event", message)
    }

    receive(data) {
        // route incoming request to either the daemon, wallet, or here
        switch (data.module) {
            case "core":
                this.handle(data);
                break;
            case "daemon":
                if (this.daemon) {
                    this.daemon.handle(data);
                }
                break;
            case "wallet":
                if (this.walletd) {
                    this.walletd.handle(data);
                }
                break;
        }
    }

    handle(data) {

        let params = data.data

        switch (data.method) {
            case "quick_save_config":
                // save only partial config settings
                Object.keys(params).map(key => {
                    this.config_data[key] = Object.assign(this.config_data[key], params[key])
                })
                fs.writeFile(this.config_file, JSON.stringify(this.config_data, null, 4), 'utf8', () => {
                    this.send("set_app_data", {
                        config: params,
                        pending_config: params
                    })
                })
                break

            case "save_config":
                // check if config has changed
                let config_changed = false
                Object.keys(this.config_data).map(i => {
                    if(i == "appearance") return
                    Object.keys(this.config_data[i]).map(j => {
                        if(this.config_data[i][j] !== params[i][j])
                            config_changed = true
                    })
                })
            case "save_config_init":
                Object.keys(params).map(key => {
                    this.config_data[key] = Object.assign(this.config_data[key], params[key])
                });
                fs.writeFile(this.config_file, JSON.stringify(this.config_data, null, 4), 'utf8', () => {

                    if(data.method == "save_config_init") {
                        this.startup();
                    } else {
                        this.send("set_app_data", {
                            config: this.config_data,
                            pending_config: this.config_data,
                        })
                        if(config_changed) {
                            this.send("settings_changed_reboot")
                        }
                    }
                });
                break;

            case "open_explorer":
                if(params.type == "tx") {
                    require("electron").shell.openExternal("https://explorer.uplexa.com/tx/"+params.id)
                }
                break;

            case "open_url":
                require("electron").shell.openExternal(params.url)
                break;

            case "save_png":
                let filename = dialog.showSaveDialog(this.mainWindow, {
                    title: "Save "+params.type,
                    filters: [{name: "PNG", extensions:["png"]}],
                    defaultPath: os.homedir()
                })
                if(filename) {
                    let base64Data = params.img.replace(/^data:image\/png;base64,/,"")
                    let binaryData = new Buffer(base64Data, 'base64').toString("binary")
                    fs.writeFile(filename, binaryData, "binary", (err) => {
                        if(err)
                            this.send("show_notification", {type: "negative", message: "Error saving "+params.type, timeout: 2000})
                        else
                            this.send("show_notification", {message: params.type+" saved to "+filename, timeout: 2000})
                    })
                }
                break;

            default:
        }
    }

    startup() {
        this.send("initialize")
        fs.readFile(this.config_file, "utf8", (err,data) => {
            if (err) {
                this.send("set_app_data", {
                    status: {
                        code: -1 // Config not found
                    },
                    config: this.config_data,
                    pending_config: this.config_data,
                });
                return;
            }

            let disk_config_data = JSON.parse(data);

            // semi-shallow object merge
            Object.keys(disk_config_data).map(key => {
                if(!this.config_data.hasOwnProperty(key))
                    this.config_data[key] = {}
                this.config_data[key] = Object.assign(this.config_data[key], disk_config_data[key])
            });

            // here we may want to check if config data is valid, if not also send code -1
            // i.e. check ports are integers and > 1024, check that data dir path exists, etc

            // save config file back to file, so updated options are stored on disk
            fs.writeFile(this.config_file, JSON.stringify(this.config_data, null, 4), "utf8", () => {});

            this.send("set_app_data", {
                config: this.config_data,
                pending_config: this.config_data,
            });

            // Check to see if data dir exists, if not it may have been on network drive
            // if not exist, send back to config screen with message so user can select
            // new location
            if (!fs.existsSync(this.config_data.app.data_dir)) {
                this.send("show_notification", {type: "negative", message: "Error: data storge path not found", timeout: 2000})
                this.send("set_app_data", {
                    status: {
                        code: -1 // Return to config screen
                    }
                });
                return;
            }

            let lmdb_dir = path.join(this.config_data.app.data_dir, "lmdb02")
            let log_dir = path.join(this.config_data.app.data_dir, "logs")
            let wallet_dir = path.join(this.config_data.app.data_dir, "wallets")

            if(this.config_data.app.testnet) {

                let testnet_dir = path.join(this.config_data.app.data_dir, "testnet")
                if (!fs.existsSync(testnet_dir))
                    fs.mkdirSync(testnet_dir);

                lmdb_dir = path.join(testnet_dir, "lmdb02")
                log_dir = path.join(testnet_dir, "logs")
                wallet_dir = path.join(testnet_dir, "wallets")

            }

            if (!fs.existsSync(lmdb_dir))
                fs.mkdirSync(lmdb_dir);
            if (!fs.existsSync(log_dir))
                fs.mkdirSync(log_dir);
            if (!fs.existsSync(wallet_dir))
                fs.mkdirSync(wallet_dir)

            // Check permissions
            try {
                fs.accessSync(this.config_dir, fs.constants.R_OK | fs.constants.W_OK);
                fs.accessSync(path.join(this.config_dir, "gui"), fs.constants.R_OK | fs.constants.W_OK);
                fs.accessSync(this.config_file, fs.constants.R_OK | fs.constants.W_OK);
                fs.accessSync(lmdb_dir, fs.constants.R_OK | fs.constants.W_OK);
                fs.accessSync(log_dir, fs.constants.R_OK | fs.constants.W_OK);
                fs.accessSync(wallet_dir, fs.constants.R_OK | fs.constants.W_OK);
            } catch (err) {
                this.send("show_notification", {type: "negative", message: "Error: data storge path not writable", timeout: 2000})
                this.send("set_app_data", {
                    status: {
                        code: -1 // Return to config screen
                    }
                });
                return;
            }

            this.daemon = new Daemon(this);
            this.walletd = new WalletRPC(this);

            this.send("set_app_data", {
                status: {
                    code: 3 // Starting daemon
                }
            });

            this.daemon.checkVersion().then((version) => {

                if(version) {
                    this.send("set_app_data", {
                        status: {
                            code: 4,
                            message: version
                        }
                    });
                } else {
                    // daemon not found, probably removed by AV, set to remote node
                    this.config_data.daemon.type = "remote"
                    this.send("set_app_data", {
                        config: this.config_data,
                        pending_config: this.config_data,
                    });
                    this.send("show_notification", {type: "warning", textColor: "black", message: "Warning: uplexad not found, using remote node", timeout: 2000})
                }


                this.daemon.checkRemoteDaemon(this.config_data).then((data) => {

                    if(data.hasOwnProperty("error")) {
                        // error contacting remote daemon

                        if(this.config_data.daemon.type == "local_remote") {
                            // if in local+remote, then switch to local only
                            this.config_data.daemon.type = "local"
                            this.send("set_app_data", {
                                config: this.config_data,
                                pending_config: this.config_data,
                            });
                            this.send("show_notification", {type: "warning", textColor: "black", message: "Warning: remote node not available, using local node", timeout: 2000})

                        } else if(this.config_data.daemon.type == "remote") {
                            this.send("set_app_data", {
                                status: {
                                    code: -1 // Return to config screen
                                }
                            });
                            this.send("show_notification", {type: "negative", message: "Error: remote node not available, change to local mode or update remote node", timeout: 2000})
                            return;
                        }
                    } else if(this.config_data.app.testnet && !data.result.testnet) {
                        // remote node network does not match local network (testnet, mainnet)

                        if(this.config_data.daemon.type == "local_remote") {
                            // if in local+remote, then switch to local only
                            this.config_data.daemon.type = "local"
                            this.send("set_app_data", {
                                config: this.config_data,
                                pending_config: this.config_data,
                            });
                            this.send("show_notification", {type: "warning", textColor: "black", message: "Warning: remote node network does not match, using local node", timeout: 2000})

                        } else if(this.config_data.daemon.type == "remote") {
                            this.send("set_app_data", {
                                status: {
                                    code: -1 // Return to config screen
                                }
                            });
                            this.send("show_notification", {type: "negative", message: "Error: remote node network does not match, change to local mode or update remote node", timeout: 2000})
                            return;
                        }

                    }

                    this.daemon.start(this.config_data).then(() => {

                        this.send("set_app_data", {
                            status: {
                                code: 6 // Starting wallet
                            }
                        });

                        this.walletd.start(this.config_data).then(() => {

                            this.send("set_app_data", {
                                status: {
                                    code: 7 // Reading wallet list
                                }
                            });

                            this.walletd.listWallets(true)

                            this.send("set_app_data", {
                                status: {
                                    code: 0 // Ready
                                }
                            });
                        }).catch(error => {
                            this.send("set_app_data", {
                                status: {
                                    code: -1 // Return to config screen
                                }
                            });
                            return;
                        });

                    }).catch(error => {
                        if(this.config_data.daemon.type == "remote") {
                            this.send("show_notification", {type: "negative", message: "Remote daemon cannot be reached", timeout: 2000})
                        } else {
                            this.send("show_notification", {type: "negative", message: "Local daemon internal error", timeout: 2000})
                        }
                        this.send("set_app_data", {
                            status: {
                                code: -1 // Return to config screen
                            }
                        });
                        return;
                    });
                });

            }).catch(error => {
                this.send("set_app_data", {
                    status: {
                        code: -1 // Return to config screen
                    }
                });
                return;
            });

        });
    }

    quit() {
        return new Promise((resolve, reject) => {
            let process = []
            if(this.daemon)
                process.push(this.daemon.quit())
            if(this.walletd)
                process.push(this.walletd.quit())

            Promise.all(process).then(() => {
                resolve()
            })
        })
    }
}
