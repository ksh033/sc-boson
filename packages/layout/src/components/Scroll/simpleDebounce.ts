export const simpleDebounce = (func:any, delay:any) => {
    let timer:any
  
    function cancel() {
      clearTimeout(timer)
    }
  
    function debounced() {
      cancel()
      timer = setTimeout(() => {
        func()
      }, delay)
    }
  
    debounced.cancel = cancel
    return debounced
  }