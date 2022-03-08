/* eslint-disable no-unused-vars */
import './App.css'
import React, { useState } from 'react'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import 'bootstrap/dist/css/bootstrap.min.css'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import { v4 as uuidv4 } from 'uuid'
import { objToArray, arrayToObj } from './utils/helper'
import fileHelper from './utils/fileHelper'
import useIpcRenderer from './hooks/useIpcRenderer'

import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'

const { join, basename, dirname, extname } = window.require('path')
const { app, dialog } = window.require('@electron/remote')
const Store = window.require('electron-store')
const fileStore = new Store({ name: 'Files Data' })
const settingsStore = new Store({ name: 'settings' })

const saveFilesToStore = (files) => {
  const filesStoreObj = objToArray(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id,
      path, 
      title,
      createdAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}

function App() {
  const [ files, setFiles ] = useState(fileStore.get('files') || {})
  const [ searchedKeyword, setSearchedKeyword ] = useState('')
  const [ openedFileIds, setOpenedFileIds ] = useState([])
  const [ activeFileId, setActiveFileId ] = useState('')
  const [ unsavedFileIds, setUnsaveFileIds ] = useState([])
  const filesArr = objToArray(files)
  const renderedFileList = searchedKeyword ? filesArr.filter(file => file.title.includes(searchedKeyword)) : filesArr
  const activeFile = files[activeFileId]
  const openedFiles = openedFileIds.map(openedFileId => files[openedFileId])
  const savedLocation = settingsStore.get('savedFileLocation') || app.getPath('documents')
  
  const searchFile = (keyword) => {
    setSearchedKeyword(keyword)
  }

  const clickFile = (fileId) => {
    const currentFile = files[fileId]
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(data => {
        const newFile = { ...currentFile, body: data, isLoaded: true }
        currentFile.body = data
        setFiles({ ...files, [fileId]: newFile })
        setActiveFileId(fileId)
        if (!openedFileIds.includes(fileId)) {
          setOpenedFileIds([...openedFileIds, fileId])
        }
      }, error => {
        alert('文件不存在')
        deleteFile(fileId)
      })
    } else {
      setActiveFileId(fileId)
      if (!openedFileIds.includes(fileId)) {
        setOpenedFileIds([...openedFileIds, fileId])
      }
    }
  }

  const updateFileBody = (fileId, value) => {
    // don't update when value unchange
    if (files[fileId].body === value) { return }
    const modefiedFile = { ...files[fileId], body: value }
    setFiles({ ...files, [fileId]: modefiedFile })
    if (!unsavedFileIds.includes(fileId)) {
      setUnsaveFileIds([...unsavedFileIds, fileId])
    }
  }

  const updateFileTitle = (fileId, value, isNew) => {
    const newPath = isNew ? join(savedLocation, `${value}.md`) : join(dirname(files[fileId].path), `${value}.md`)
    const modefiedFile = { ...files[fileId], title: value, path: newPath, isNew: false }
    const newFiles = { ...files, [fileId]: modefiedFile } 
    if (isNew) {
      fileHelper.writeFile(newPath, modefiedFile.body).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        clickFile(fileId)
      })
    } else {
      const oldPath = files[fileId].path
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    }
  }

  const saveCurrentFile = () => {
    console.log(activeFile)
    if (!activeFile) { return }
    fileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
      setUnsaveFileIds(unsavedFileIds.filter(id => id !== activeFileId))
    })
  }

  const deleteFile = (fileId) => {
    const { [fileId]: currentFile, ...afterDelete } = files
    const callback = () => {
      closeTab(fileId)
      saveFilesToStore(afterDelete)
      setFiles(afterDelete)
    }
    fileHelper.deleteFile(currentFile.path).then(callback, callback)
  }

  const createNewFile = () => {
    const unfinishedNewFile = filesArr.find(file => file.isNew)
    if (unfinishedNewFile) { return }
    const newId = uuidv4()
    setFiles({ 
      ...files, 
      [newId]: {
        id: newId,
        title: '',
        body: '## 请输入标题',
        createdAt: new Date().getTime(),
        isNew: true,
        isLoaded: true,
      }
    })
  }

  const importFiles = () => {
    dialog.showOpenDialog({
      title: '选择 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: 'Markdown File',
          extensions: ['md']
        }
      ]
    }).then(({ filePaths }) => {
      const filteredPaths = filePaths.filter(path => {
        const alreadyAdded = Object.values(files).find(file => file.path === path)
        return !alreadyAdded
      })

      const importedFilesArr = filteredPaths.map(path => {
        return {
          id: uuidv4(),
          title: basename(path, extname(path)),
          path
        }
      })

      const newFiles = { ...files, ...arrayToObj(importedFilesArr)}
      setFiles(newFiles)
      saveFilesToStore(newFiles)

      const fileCount = importedFilesArr.length
      if (fileCount > 0) {
        dialog.showMessageBox({
          type: 'info',
          title: `成功导入了${fileCount}个文件`,
          message: `成功导入了${fileCount}个文件`
        })
      }
    })
  }

  const clickTab = (fileId) => {
    setActiveFileId(fileId) 
  }

  const closeTab = (fileId) => {
    const result = openedFileIds.filter(openedFileId => fileId !== openedFileId)
    setOpenedFileIds(result)
    if (fileId === activeFileId) {
      const prevActiveFileId = result.length ? result[result.length - 1] : ''
      setActiveFileId(prevActiveFileId)
    }
  }

  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile
  })
  
  return (
    <div className='App container-fluid px-0'>
      <div className='row g-0'>
        <div className='col-4 left-panel bg-light'>
          <FileSearch
            title="我的云文档"
            onFileSearch={ searchFile }
          />
          <FileList
            files={ renderedFileList }
            onFileClick={ clickFile }
            onFileDelete={ deleteFile }
            onSaveEdit={ updateFileTitle }
          />
          <div className="row g-0 button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                icon={ faPlus }
                btnClass="btn-primary"
                onBtnClick={ createNewFile }
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                icon={ faFileImport }
                btnClass="btn-success"
                onBtnClick={ importFiles }
              />
            </div>
          </div>
        </div> 
        <div className='col right-panel'>
          {
            !activeFileId &&
            <div className='start-page'>
              打开或创建一个 Markdown 文档
            </div>
          }
          {
            activeFileId &&
            <>
              <TabList
                files={ openedFiles }
                activedId={ activeFileId }
                unsavedIds={ unsavedFileIds }
                onTabClick={ clickTab }
                onTabClose={ closeTab }
              />
              <SimpleMDE
                key={ activeFile && activeFile.id }
                value={ activeFile && activeFile.body }
                onChange={(value) => { updateFileBody(activeFile.id, value) }}
                options={
                  {
                    minHeight: '400px'
                  }
                } 
              />
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
