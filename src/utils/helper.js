export const arrayToObj = (array, key = 'id') => {
  return array.reduce((map, item) => {
    map[item[key]] = item
    return map
  }, {})
}

export const objToArray = (obj) => {
  return Object.keys(obj).map(key => obj[key])
}

export const getParentNode = (node, parentClassName) => {
  let current = node
  while(current !== null) {
    if (current.classList.contains(parentClassName)) {
      return current
    }
    current = current.parentNode
  } 
  return null
}