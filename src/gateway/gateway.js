import { ipcRenderer } from "electron"
import { Notify, Dialog, Loading, LocalStorage } from "quasar"

export class Gateway {

    constructor(app, router) {

        this.app = app
        this.router = router

        let theme = LocalStorage.has("theme") ? LocalStorage.get.item("theme") : "light"
        this.app.store.commit("gateway/set_app_data", {
            config: {
                appearance: {
                    theme
                }
            }
        });
        this.app.store.watch( state => state.gateway.app.config.appearance.theme, (theme) => {
            LocalStorage.set("theme", theme)
        })

        this.closeDialog = false

        this.app.store.commit("gateway/set_app_data", {
            status: {
                code: 1 // Connecting to backend
            }
        });

        ipcRenderer.on("event", (event, data) => {
            this.receive(data)
        })

        ipcRenderer.on("confirmClose", () => {
            this.confirmClose("Are you sure you want to exit?")
        });

    }

    confirmClose(msg) {
        if(this.closeDialog) {
            return
        }
        this.closeDialog = true
        Dialog.create({
            title: "Exit",
            message: msg,
            ok: {
                label: "EXIT"
            },
            cancel: {
                flat: true,
                label: "CANCEL",
                color: this.app.store.state.gateway.app.config.appearance.theme=="dark"?"white":"dark"
            }
        }).then(() => {
            this.closeDialog = false
            Loading.hide()
            this.router.replace({ path: "/quit" })
            ipcRenderer.send("confirmClose")
        }).catch(() => {
            this.closeDialog = false
        })

    }

    send(module, method, data={}) {
        let message = {
            module,
            method,
            data
        }
        ipcRenderer.send("event", message)

    }

    receive(message) {

        // should wrap this in a try catch, and if fail redirect to error screen
        // shouldn't happen outside of dev environment
        if (typeof message !== "object" ||
            !message.hasOwnProperty("event") ||
            !message.hasOwnProperty("data"))
            return

        switch (message.event) {

            case "initialize":
                this.app.store.commit("gateway/set_app_data", {
                    status: {
                        code: 2 // Loading config
                    }
                })
                break

            case "set_app_data":
                this.app.store.commit("gateway/set_app_data", message.data)
                break

            case "set_daemon_data":
                this.app.store.commit("gateway/set_daemon_data", message.data)
                break

            case "set_wallet_data":
            case "set_wallet_error":
                this.app.store.commit("gateway/set_wallet_data", message.data)
                break

            case "set_tx_status":
                this.app.store.commit("gateway/set_tx_status", message.data)
                break

            case "wallet_list":
                this.app.store.commit("gateway/set_wallet_list", message.data)
                break

            case "settings_changed_reboot":
                this.confirmClose("Changes require restart. Would you like to exit now?")
                break

            case "show_notification":
                let notification = {
                    type: "positive",
                    timeout: 1000,
                    message: ""
                }
                Notify.create(Object.assign(notification, message.data))
                break

            case "return_to_wallet_select":
                this.router.replace({ path: "/wallet-select" })
                setTimeout(() => {
                    // short delay to prevent wallet data reaching the
                    // websocket moments after we close and reset data
                    this.app.store.dispatch("gateway/resetWalletData")
                }, 250);
                break

        }
    }
}
