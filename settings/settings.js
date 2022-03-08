const remote = window.require('@electron/remote')
const { dialog } = remote
const Store = window.require('electron-store')
const settingsStore = new Store({ name: 'settings' })

const $ = (id) => {
  return document.getElementById(id)
}

document.addEventListener('DOMContentLoaded', () => {
  let savedFileLocation = settingsStore.get('savedFileLocation')
  if (savedFileLocation) {
    $('savedFileLocation').value = savedFileLocation
  }

  $('select-new-location').addEventListener('click', () => {
    dialog.showOpenDialog({
      title: '选择文件存放路径',
      properties: ['openDirectory']
    }).then(({ filePaths }) => {
      if (Array.isArray(filePaths)) {
        $('savedFileLocation').value = filePaths[0]
        savedFileLocation = filePaths[0]
      }
    })
  })

  $('settings-form').addEventListener('submit', () => {
    settingsStore.set('savedFileLocation', savedFileLocation)
    remote.getCurrentWindow().close()
  })
})