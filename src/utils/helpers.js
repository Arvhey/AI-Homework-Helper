export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const generateId = () => Math.random().toString(36).substr(2, 9)

export const truncate = (str, length) => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

export const debounce = (fn, ms) => {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}
