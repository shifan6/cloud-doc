const { app, BrowserWindow, Menu } = require('electron')
const Store = require('electron-store')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    }
  })
  
  // 启用remote
  require('@electron/remote/main').initialize()
  require('@electron/remote/main').enable(mainWindow.webContents)

  // 初始化Store
  Store.initRenderer() 

  const urlLoaction = isDev ? 'http://localhost:3000' : 'dumnurl'
  mainWindow.loadURL(urlLoaction)
  mainWindow.webContents.openDevTools()  // 自动打开开发者工具

  // 设置菜单
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})