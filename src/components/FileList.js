import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import { getParentNode } from '../utils/helper'

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete}) => {
  const [ editFileId, setEditFileId ] = useState(null)
  const [ value, setValue ] = useState('')
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const node = useRef(null)
  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          editFile(parentElement.dataset.id, parentElement.dataset.title)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileDelete(parentElement.dataset.id)
        }
      }
    }
  ], '.file-list', [files])

  const editFile = (fileId, fileTitle) => {
    const unfinishedNewFile = files.find(file => file.isNew)
    if (unfinishedNewFile) {
      closeEdit(unfinishedNewFile)
    }
    setEditFileId(fileId)
    setValue(fileTitle)
  }

  const closeEdit = (file) => {
    setEditFileId(null)
    setValue('')
    if (file.isNew) {
      onFileDelete(file.id)
    }
  }

  const saveEdit = (file) => {
    const isRepeat = files.some(file => value === file.title)
    if (isRepeat) {
      // update useKeyPress, then alert
      setTimeout(() => {
        alert('文件名已存在')
      }, 300)
      return
    }
    onSaveEdit(file.id, value, file.isNew)
    closeEdit(file)
  }

  useEffect(() => {
    const file = files.find(file => editFileId === file.id || file.isNew)
    if (enterPressed && file && value.trim()) {
      saveEdit(file)
    }
    if (escPressed && file) {
      closeEdit(file)
    }
  })

  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    if (newFile) {
      setEditFileId(newFile)
      setValue(newFile.title)
      node.current.focus()
    }
  }, [files])

  useEffect(() => {
    const editFile = files.find(file => file.id === editFileId)
    if (editFile) {
      node.current.focus()
    }
  }, [editFileId, files])

  return (
    <ul className='list-group list-group-flush file-list'>
      {
        files.map(file => (
          <li
            className='row g-0 list-group-item bg-light d-flex align-item-center file-item'
            key={ file.id }
            data-id={ file.id }
            data-title={ file.title }
          >
            {
              (editFileId !== file.id && !file.isNew) &&
              <>
                <span className='col-2'>
                  <FontAwesomeIcon
                    title="markdown"
                    icon={ faMarkdown }
                  />
                </span>
                <span
                 className='col c-link'
                 onClick={() => { onFileClick(file.id) }}
                 >
                  { file.title }
                </span>
              </>
            }
            {
              (editFileId === file.id || file.isNew) &&
              <>
                <input
                  ref={ node }
                  className="form-control col"
                  value={ value }
                  placeholder='请输入文档名称'
                  onChange={(e) => { setValue(e.target.value) }}
                />
                <button
                  type="button"
                  className="icon-button col-2"
                  onClick={ () => closeEdit(file) }
                >
                  <FontAwesomeIcon
                    title="关闭"
                    icon={ faTimes }
                  />
                </button>
              </>
            }
          </li>
        ))
      }
    </ul>
  )
}

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func
}

export default FileList