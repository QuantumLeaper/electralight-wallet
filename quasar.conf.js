// Configuration for your app

module.exports = function (ctx) {
    return {
        // app plugins (/src/plugins)
        plugins: [
            "i18n",
            "axios",
	    "vuelidate",
            "gateway",
            "timeago"
        ],
        css: [
            "app.styl"
        ],
        extras: [
            ctx.theme.mat ? "roboto-font" : null,
            "material-icons" // optional, you are not bound to it
            // "ionicons",
            // "mdi",
            // "fontawesome"
        ],
        supportIE: false,
        build: {
            scopeHoisting: true,
            vueRouterMode: "history",
            // vueCompiler: true,
            // gzip: true,
            // analyze: true,
            // extractCSS: false,
            extendWebpack(cfg) {
                /*
                cfg.module.rules.push({
                    enforce: "pre",
                    test: /\.(js|vue)$/,
                    loader: "eslint-loader",
                    exclude: /(node_modules|quasar)/
                })
                */
            }
        },
        devServer: {
            // https: true,
            // port: 8080,
            open: true // opens browser window automatically
        },
        // framework: "all" --- includes everything; for dev only!
        framework: {
            components: [
                "QLayout",
                "QLayoutHeader",
                "QLayoutFooter",
                "QLayoutDrawer",
                "QPageContainer",
                "QPage",
                "QToolbar",
                "QToolbarTitle",
                "QTooltip",
                "QField",
                "QInput",
                "QRadio",
                "QBtn",
                "QBtnToggle",
                "QIcon",
                "QTabs",
                "QTab",
                "QRouteTab",
                "QBtnDropdown",
                "QPopover",
                "QModal",
                "QModalLayout",
                "QStep",
                "QStepper",
                "QStepperNavigation",
                "QSpinner",
                "QList",
                "QListHeader",
                "QItem",
                "QItemMain",
                "QItemSeparator",
                "QItemSide",
                "QItemTile",
                "QSelect",
                "QToggle",
                "QPageSticky",
                "QCollapsible",
                "QCheckbox",
                "QInnerLoading",
                "QInfiniteScroll",
                "QDatetime",
                "QContextMenu"
            ],
            directives: [
                "Ripple",
                "CloseOverlay"
            ],
            // Quasar plugins
            plugins: [
                "Notify",
                "Loading",
                "LocalStorage",
                "Dialog"
            ]
            // iconSet: ctx.theme.mat ? "material-icons" : "ionicons"
            // i18n: "de" // Quasar language
        },
        // animations: "all" --- includes all animations
        animations: [],
        pwa: {
            // workboxPluginMode: "InjectManifest",
            // workboxOptions: {},
            manifest: {
                // name: "Quasar App",
                // short_name: "Quasar-PWA",
                // description: "Best PWA App in town!",
                display: "standalone",
                orientation: "portrait",
                background_color: "#ffffff",
                theme_color: "#027be3",
                icons: [{
                        "src": "statics/icons/icon-128x128.png",
                        "sizes": "128x128",
                        "type": "image/png"
                    },
                    {
                        "src": "statics/icons/icon-192x192.png",
                        "sizes": "192x192",
                        "type": "image/png"
                    },
                    {
                        "src": "statics/icons/icon-256x256.png",
                        "sizes": "256x256",
                        "type": "image/png"
                    },
                    {
                        "src": "statics/icons/icon-384x384.png",
                        "sizes": "384x384",
                        "type": "image/png"
                    },
                    {
                        "src": "statics/icons/icon-512x512.png",
                        "sizes": "512x512",
                        "type": "image/png"
                    }
                ]
            }
        },
        cordova: {
            // id: "org.cordova.quasar.app"
        },
        electron: {
            bundler: "builder", // or "packager"
            extendWebpack(cfg) {
                // do something with Electron process Webpack cfg
            },
            packager: {
                // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

                // OS X / Mac App Store
                // appBundleId: "",
                // appCategoryType: "",
                // osxSign: "",
                // protocol: "myapp://path",

                // Window only
                // win32metadata: { ... }

                extraResource: [
                    "bin",
                ]
            },
            builder: {
                // https://www.electron.build/configuration/configuration

                appId: "com.uplexa.wallet",
                productName: "Wallet ElectraLight",
                copyright: "Copyright © 2018-2019 uPlexa Project",

                // directories: {
                //     buildResources: "src-electron/build"
                // },

                linux: {
                    //target: ["AppImage", "snap", "tar.xz"],
                    target: ["AppImage", "deb"],
                    icon: "src-electron/icons/icon_512x512.png",
                    category: "Finance"
                },

                mac: {
                    icon: "src-electron/icons/icon.icns",
                    category: "public.app-category.finance"
                },

                dmg: {
                    background: "src-electron/build/uplexa-dmg.tiff"
                },

                extraResources: [
                    "bin"
                ]
            }
        }
    }
}
