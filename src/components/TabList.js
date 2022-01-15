/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import ClassNames from 'classnames'
import './TabList.scss'

const TabList = ({ files, activedId, unsavedIds, onTabClick, onTabClose }) => {
  return (
    <ul className="nav nav-pills tablist-component">
      { 
        files.map(file => {
          const unsaved = unsavedIds.includes(file.id)
          const className = ClassNames({
            'nav-link': true,
            'active': file.id === activedId,
            'unsaved': unsaved
          })
          return (
            <li 
              className="nav-item" 
              key={ file.id }
            >
              <a 
                href="#"
                className={ className }
                onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
              >
                { file.title }
                <span 
                  className='ms-2 close-icon' 
                  onClick={(e) => { e.stopPropagation(); onTabClose(file.id) }}
                >
                  <FontAwesomeIcon
                    icon={ faTimes }
                  />
                </span>
                {
                  unsaved && 
                  (<span className='rounded-circle unsaved-icon ms-2'></span>)
                }
              </a>
            </li>
          )
        })
      }
    </ul>
  )
}

TabList.propTypes = {
  files: PropTypes.array,
  activedId: PropTypes.string,
  unsavedIds: PropTypes.array,
  onTabClick: PropTypes.func,
  onTabClose: PropTypes.func
}

TabList.defaultProps = {
  unsavedIds: []
}

export default TabList