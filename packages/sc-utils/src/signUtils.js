import { decrypt16, encrypt16 } from './cryptoJSUtils'
import { isEmpty } from './validateUtil'
import MD5 from 'md5'
const paramsFilter = (params) => {
  let result = {}
  Object.keys(params).forEach((key) => {
    if (!isEmpty(params[key])) {
      result[key] = params[key]
    }
  })

  return result
}
const createLinkString = (params) => {
  let keys = Object.keys(params)
  keys = keys.sort((a, b) => (a > b ? 1 : -1))
  let linkStrings = []
  keys.forEach((key) => {
    if (key !== 'sign') {
      linkStrings.push(key + '=' + params[key])
    }
  })
  let linkString = linkStrings.join('&')
  return linkString
}
export function getSign(params) {
  let linkString = createLinkString(paramsFilter(params))

  let md5String = MD5(linkString)

  return encrypt16(md5String)
}

export function validateSign(params) {
  const { sign, ...resprops } = params
  const newSign = getSign(resprops)

  return newSign === sign
}
