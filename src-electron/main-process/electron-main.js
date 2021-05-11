import { app, ipcMain, BrowserWindow, Menu, dialog } from "electron"
import { Backend } from "./modules/backend"
import menuTemplate from "./menu"
const windowStateKeeper = require("electron-window-state")

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
    global.__statics = require("path").join(__dirname, "statics").replace(/\\/g, "\\\\")
    global.__uplexa_bin = require("path").join(__dirname, "..", "bin").replace(/\\/g, "\\\\")
} else {
    global.__uplexa_bin = require("path").join(process.cwd(), "bin").replace(/\\/g, "\\\\")
}

let mainWindow, backend
let showConfirmClose = true
let forceQuit = false

function createWindow() {
    /**
     * Initial window options
     */

    let mainWindowState = windowStateKeeper({
        defaultWidth: 800,
        defaultHeight: 650
    })

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 640,
        minHeight: 480,
        icon: require("path").join(__statics, "icon_512x512.png"),
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
      }
    })

    //mainWindow.webContents.openDevTools() // Add dev tools (Only for debug)

    mainWindow.on("close", (e) => {
        if (process.platform === "darwin") {
            if (forceQuit) {
                forceQuit = false
                if (showConfirmClose) {
                    e.preventDefault()
                    mainWindow.show()
                    mainWindow.webContents.send("confirmClose")
                } else {
                    e.defaultPrevented = false
                }
            } else {
                e.preventDefault()
                mainWindow.hide()
            }
        } else {
            if (showConfirmClose) {
                e.preventDefault()
                mainWindow.webContents.send("confirmClose")
            } else {
                e.defaultPrevented = false
            }
        }
    })

    ipcMain.on("confirmClose", (e) => {
        showConfirmClose = false
        if (backend) {
            backend.quit().then(() => {
                backend = null
                app.quit()
            })
        } else {
            app.quit()
        }
    })

    mainWindow.webContents.on("did-finish-load", () => {
      backend = new Backend(mainWindow)
      backend.init()
    })

    mainWindow.loadURL(process.env.APP_URL)
    mainWindowState.manage(mainWindow)
}

app.on("ready", () => {
    if (process.platform === "darwin") {
        const menu = Menu.buildFromTemplate(menuTemplate)
        Menu.setApplicationMenu(menu)
    }
    createWindow()
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow()
    } else if (process.platform === "darwin") {
        mainWindow.show()
    }
})

app.on("before-quit", () => {
    if (process.platform === "darwin") {
        forceQuit = true
    } else {
        if (backend) {
            backend.quit().then(() => {
                mainWindow.close()
            })
        }
    }
})

app.on("quit", () => {

})
