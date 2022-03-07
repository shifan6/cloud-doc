import { useEffect, useRef } from 'react'
const remote = window.require('@electron/remote')
const { Menu, MenuItem } = remote

const useContextMenu = (itemsArr, targetSelector, dependencies = []) => {
  const clickedElement = useRef(null)
  useEffect(() => {
    const menu = new Menu()
    itemsArr.forEach(item => {
      menu.append(new MenuItem(item))
    });
    const contextMenuHandler = (e) => {
      if (document.querySelector(targetSelector).contains(e.target)) {
        clickedElement.current = e.target
        menu.popup({ window: remote.getCurrentWindow() })
      }
    }
    document.addEventListener('contextmenu', contextMenuHandler)
    return () => {
      document.removeEventListener('contextmenu', contextMenuHandler)
    }
  }, dependencies)
  return clickedElement
}

export default useContextMenu