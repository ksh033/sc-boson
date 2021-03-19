import { isEmpty } from './validateUtil'
// 格式化金额
export function convertMoney(s) {
  if (isEmpty(s)) {
    return formatMoney(s)
  } else {
    if (s % 100 === 0) {
      return formatMoney(s / 100)
    } else {
      return formatMoney(s / 100 + '.' + (s % 100))
    }
  }
}

// 金额单位分转换为元
export function transformMoney(num, count) {
  let money = 0.0,
    integer = [],
    digits = /^\d+$/.test(count) ? count : 2
  if (num) {
    money = (num * 0.01).toFixed(digits) //分到元，保留两位小数
    if (digits) {
      integer = money.toString().split('.')
      if (integer.length === 1) {
        money = money.toString() + '.00'
        return money
      }
      if (integer.length > 1) {
        if (integer[1].length < 2) {
          money = money.toString() + '0'
        }
        return money
      }
    } else {
      return money
    }
  } else if (num == 0) {
    return (0).toFixed(digits)
  } else {
    return '-'
  }
}

/**
 * 格式化金额
 * @param s xxxxxx.xx
 * @returns {String} ￥xxx,xxx.xx
 */
export function formatMoney(s) {
  if (s === null || s === undefined || s === 'null') {
    return ''
  }
  var n = 2
  s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + ''
  var l = s
      .split('.')[0]
      .split('')
      .reverse(),
    r = s.split('.')[1]
  var t = ''
  for (var i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 === 0 && i + 1 !== l.length ? ',' : '')
  }
  return (
    t
      .split('')
      .reverse()
      .join('') +
    '.' +
    r
  )
}

/**
 * 转大写金额
 * @param n
 * @returns {string}
 */
export function digitUppercase(n) {
  const fraction = ['角', '分']
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ]
  let num = Math.abs(n)
  let s = ''
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * 10 ** index) % 10] + item).replace(
      /零./,
      ''
    )
  })
  s = s || '整'
  num = Math.floor(num)
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = ''
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p
      num = Math.floor(num / 10)
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
  }

  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整')
}
/**
 * 转阿拉伯大写
 * @param n
 * @returns {string}
 */
export function toChinesNum(num) {
  let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'] //changeNum[0] = "零"
  let unit = ['', '十', '百', '千', '万']
  num = parseInt(num)
  let getWan = (temp) => {
    let strArr = temp
      .toString()
      .split('')
      .reverse()
    let newNum = ''
    for (var i = 0; i < strArr.length; i++) {
      newNum =
        (i == 0 && strArr[i] == 0
          ? ''
          : i > 0 && strArr[i] == 0 && strArr[i - 1] == 0
          ? ''
          : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i])) +
        newNum
    }
    return newNum
  }
  let overWan = Math.floor(num / 10000)
  let noWan = num % 10000
  if (noWan.toString().length < 4) noWan = '0' + noWan
  return overWan ? getWan(overWan) + '万' + getWan(noWan) : getWan(num)
}

/**
 * cyp
 * 格式化金额（分=>元并保存两位小数点）
 * 调用方法：formatMoneyQuery("参数名1")
 */
export function formatMoneyQuery(val, dw = '') {
  if (typeof val === 'number' || typeof val === 'string') {
    if (val === '0' || val === 0) {
      return `${dw}0.00`
    }
    if (val === '-1' || val === -1) {
      return '不限'
    }
    if (val) {
      // 金额转换 分->元 保留2位小数 并每隔3位用逗号分开 1,234.56
      const str = `${parseFloat(`${val}`).toFixed(2)}`
      const intSum = str
        .substring(0, str.indexOf('.'))
        .replace(/\B(?=(?:\d{3})+$)/g, ',') // 取到整数部分
      const dot = str.substring(str.length, str.indexOf('.')) // 取到小数部分搜索
      const ret = intSum + dot
      return dw + ret
    }
  }
  return '--'
}

/**
 * cyp
 * 格式化金额（分=>元并保存两位小数点）
 */
export function formatQuery(val) {
  if (typeof val === 'number' || typeof val === 'string') {
    if (val === '0' || val === 0) {
      return '0.00'
    }
    if (val) {
      // 金额转换 分->元 保留2位小数 并每隔3位用逗号分开 1,234.56
      const str = parseFloat(val.toString()).toFixed(2)
      return str
    }
  }
  return ''
}
