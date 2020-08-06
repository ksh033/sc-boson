export function getOffset(elem: any) {
  if (!elem) {
    return { top: 0, left: 0 }
  }
  let docElem = document.documentElement
  let box = elem.getBoundingClientRect()
  if (!box || !docElem) {
    return { top: 0, left: 0 }
  }
  return {
    top: box.top + (docElem ? docElem.scrollTop : 0),
    left: box.left + (docElem ? docElem.scrollLeft : 0),
  }
}
