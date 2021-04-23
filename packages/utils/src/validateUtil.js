/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-useless-escape */
/**
 * 验证身份证号是否正确
 * @param num
 * @returns {boolean}
 */
export function checkIDCard(idcode) {
  // 转换大小写 保证最后一位的x为大写
  idcode = idcode.toUpperCase()
  if (!idcode) {
    return false
  }
  // 加权因子
  const weightFactor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  // 校验码
  const checkCode = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  const code = `${idcode}`
  const last = idcode[17] // 最后一个

  const seventeen = code.substring(0, 17)

  // ISO 7064:1983.MOD 11-2
  // 判断最后一位校验码是否正确
  const arr = seventeen.split('')
  const len = arr.length
  let num = 0
  for (let i = 0; i < len; i++) {
    num += arr[i] * weightFactor[i]
  }

  // 获取余数
  const resisue = num % 11
  const lastNo = checkCode[resisue]

  // 格式的正则
  // 正则思路
  /*
  第一位不可能是0
  第二位到第六位可以是0-9
  第七位到第十位是年份，所以七八位为19或者20
  十一位和十二位是月份，这两位是01-12之间的数值
  十三位和十四位是日期，是从01-31之间的数值
  十五，十六，十七都是数字0-9
  十八位可能是数字0-9，也可能是X
  */
  const idcardPatter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/

  // 判断格式是否正确
  const format = idcardPatter.test(idcode)

  // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
  return !!(last === lastNo && format)
}
/**
 * 判断字符串是否为空，若为空则返回true否则返回false
 * @param source
 * @return true或者false
 * */
export function isEmpty(source) {
  if (source === undefined) {
    return true
  }
  source = source.toString()

  const str = source.replace(/(^\s*)|(\s*$)/g, '')
  if (str === '' || str.toLowerCase() === 'null' || str.length <= 0) {
    return true
  } 
    return false
  
}

/**
 * 验证是否为手机号码（移动手机）
 *
 * @param {}
 *            source
 */

export function isMobilePhone(source) {
  const regex = /^((\d3)|(\d{3}\-))?1\d{10}/
  return regex.test(source)
}
/**
 * 验证是否为电子邮箱
 *
 * @param {}
 *            source
 */
export function isEmail(source) {
  // var regex = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
  if (
    source.search(
      /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
    ) !== -1
  ) {
    return true
  } 
    return false
  
}
/**
 * 判断是否为空
 * @param val
 * @returns
 */
export function isNull(val) {
  if (
    val === undefined ||
    val === null ||
    val === '' ||
    val === '' ||
    val === 'undefined' ||
    val === 'null' ||
    val === 'NULL'
  ) {
    return true
  }
  return false
}
