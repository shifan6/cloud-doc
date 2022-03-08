const { app, Menu, ipcMain } = require('electron')
const Store = require('electron-store')
const isDev = require('electron-is-dev')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const { join } = require('path')
let mainWindow, settingsWindow

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1024,
    height: 680
  }
  const urlLocation = isDev ? 'http://localhost:3000' : 'dumnurl'
  mainWindow = new AppWindow(mainWindowConfig, urlLocation)
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 800,
      height: 400,
      parent: mainWindow
    }
    const settingUrlLocation = 'file://' + join(__dirname, './settings/settings.html')
    settingsWindow = new AppWindow(settingsWindowConfig, settingUrlLocation)
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })

    // 启用remote
    require('@electron/remote/main').enable(settingsWindow.webContents)

    settingsWindow.webContents.openDevTools()  // 自动打开开发者工具
  })

  // 启用remote
  require('@electron/remote/main').initialize()
  require('@electron/remote/main').enable(mainWindow.webContents)

  // 初始化Store
  Store.initRenderer() 

  mainWindow.webContents.openDevTools()  // 自动打开开发者工具

  // 设置菜单
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})