export const arrayToObj = (array, key = 'id') => {
  return array.reduce((map, item) => {
    map[item[key]] = item
    return map
  }, {})
}

export const objToArray = (obj) => {
  return Object.keys(obj).map(key => obj[key])
}