/**
 * 格式化时间
 *
 * @param date YyyymmddHHMMSS
 * @returns Mm月dd日 HH:MM
 */
export function formatDate(date, format, type) {
  if (date === null || date === undefined || date === 'null') {
    return '';
  }
  switch (format) {
    // 年月
    case 'yyyymm':
      return date.substring(0, 4) + (type || '年') + date.substring(4, 6) + (type ? '' : '月');
      break;
    // 年月日
    case 'yyyymmdd':
      return (
        date.substring(0, 4) +
        (type || '年') +
        date.substring(4, 6) +
        (type || '月') +
        date.substring(6, 8) +
        (type ? ' ' : '日')
      );
      break;
    // 年月日时分
    case 'yyyymmddHHMM':
      return (
        date.substring(0, 4) +
        (type || '年') +
        date.substring(4, 6) +
        (type || '月') +
        date.substring(6, 8) +
        (type ? ' ' : '日') +
        date.substring(8, 10) +
        ':' +
        date.substring(10, 12)
      );
      break;
    // 年月日时分秒
    case 'yyyymmddHHMMSS':
      return (
        date.substring(0, 4) +
        (type || '年') +
        date.substring(4, 6) +
        (type || '月') +
        date.substring(6, 8) +
        (type ? ' ' : '日') +
        date.substring(8, 10) +
        ':' +
        date.substring(10, 12) +
        ':' +
        date.substring(12, 14)
      );
      break;
    // 月日时分秒
    case 'mmddHHMMSS':
      return (
        date.substring(4, 6) +
        (type || '月') +
        date.substring(6, 8) +
        (type ? ' ' : '日') +
        date.substring(8, 10) +
        ':' +
        date.substring(10, 12) +
        ':' +
        date.substring(12, 14)
      );
      break;
    // 月日时分
    default:
      return (
        date.substring(4, 6) +
        (type || '月') +
        date.substring(6, 8) +
        (type ? ' ' : '日') +
        date.substring(8, 10) +
        ':' +
        date.substring(10, 12)
      );
  }
}

export function dateFormat(timestamp, formats) {
  formats = formats || 'yyyy-mm-dd';
  var zero = function (value) {
    if (value < 10) {
      return '0' + value;
    }
    return value;
  };

  var myDate = timestamp ? new Date(timestamp) : new Date();

  var year = myDate.getFullYear();
  var month = zero(myDate.getMonth() + 1);
  var day = zero(myDate.getDate());

  var hour = zero(myDate.getHours());
  var minite = zero(myDate.getMinutes());
  var second = zero(myDate.getSeconds());

  return formats.replace(/yyyy|mm|dd|HH|MM|SS/gi, function (matches) {
    return {
      yyyy: year,
      mm: month,
      dd: day,
      HH: hour,
      MM: minite,
      SS: second,
    }[matches];
  });
}
export function formatSeconds(value) {
  var secondTime = parseInt(value); // 秒
  var minuteTime = 0; // 分
  var hourTime = 0; // 小时
  if (secondTime > 60) {
    //如果秒数大于60，将秒数转换成整数
    //获取分钟，除以60取整数，得到整数分钟
    minuteTime = parseInt(secondTime / 60);
    //获取秒数，秒数取佘，得到整数秒数
    secondTime = parseInt(secondTime % 60);
    //如果分钟大于60，将分钟转换成小时
    if (minuteTime > 60) {
      //获取小时，获取分钟除以60，得到整数小时
      hourTime = parseInt(minuteTime / 60);
      //获取小时后取佘的分，获取分钟除以60取佘的分
      minuteTime = parseInt(minuteTime % 60);
    }
  }
  var result = {
    h: hourTime <= 9 ? '0' + hourTime : '' + hourTime,
    m: minuteTime <= 9 ? '0' + minuteTime : '' + minuteTime,
    s: secondTime <= 9 ? '0' + secondTime : '' + secondTime,
  };
  return result;
}
export function interval(date) {
  var date1 = new Date(dateFormat(new Date(), 'yyyy/mm/dd HH:MM:SS'));
  var date2 = new Date(formatDate(date, 'yyyymmddHHMMSS', '/'));
  var s1 = date1.getTime(),
    s2 = date2.getTime();
  var total = (s2 - s1) / 1000;
  var day = parseInt(total / (24 * 60 * 60)); //计算整数天数
  var afterDay = total - day * 24 * 60 * 60; //取得算出天数后剩余的秒数
  var hour = parseInt(afterDay / (60 * 60)); //计算整数小时数
  var afterHour = total - day * 24 * 60 * 60 - hour * 60 * 60; //取得算出小时数后剩余的秒数
  var min = parseInt(afterHour / 60); //计算整数分
  var afterMin = total - day * 24 * 60 * 60 - hour * 60 * 60 - min * 60; //取得算出分后剩余的秒数
  let result = {
    h: hour <= 9 ? '0' + hour : hour,
    m: min <= 9 ? '0' + min : min,
    s: afterMin <= 9 ? '0' + afterMin : afterMin,
  };
  if (hour >= 2 && (min > 0 || afterMin > 0)) {
    result = {
      h: '02',
      m: '00',
      s: '00',
    };
  }
  return result;
}

/**
 * @example
 *   formatHMS(3610); // -> 1h0m10s
 *
 * @param {s} 秒数
 * @returns {String} 字符串
 */
export function formatHMS(s) {
  var str = '';
  if (s > 3600) {
    str = Math.floor(s / 3600) + 'h' + Math.floor((s % 3600) / 60) + 'm' + (s % 60) + 's';
  } else if (s > 60) {
    str = Math.floor(s / 60) + 'm' + (s % 60) + 's';
  } else {
    str = (s % 60) + 's';
  }
  return str;
}

/*获取某月有多少天*/
export function getMonthOfDay(time) {
  var date = new Date(time);
  var year = date.getFullYear();
  var mouth = date.getMonth() + 1;
  var days;

  //当月份为二月时，根据闰年还是非闰年判断天数
  if (mouth == 2) {
    days =
      (year % 4 == 0 && year % 100 == 0 && year % 400 == 0) || (year % 4 == 0 && year % 100 != 0)
        ? 28
        : 29;
  } else if (
    mouth == 1 ||
    mouth == 3 ||
    mouth == 5 ||
    mouth == 7 ||
    mouth == 8 ||
    mouth == 10 ||
    mouth == 12
  ) {
    //月份为：1,3,5,7,8,10,12 时，为大月.则天数为31；
    days = 31;
  } else {
    //其他月份，天数为：30.
    days = 30;
  }
  return days;
}

/*获取某年有多少天*/
export function getYearOfDay(time) {
  var firstDayYear = getFirstDayOfYear(time);
  var lastDayYear = getLastDayOfYear(time);
  var numSecond = (new Date(lastDayYear).getTime() - new Date(firstDayYear).getTime()) / 1000;
  return Math.ceil(numSecond / (24 * 3600));
}

/*获取某年的第一天*/
export function getFirstDayOfYear(time) {
  var year = new Date(time).getFullYear();
  return year + '-01-01 00:00:00';
}

/*获取某年最后一天*/
export function getLastDayOfYear(time) {
  var year = new Date(time).getFullYear();
  var dateString = year + '-12-01 00:00:00';
  var endDay = getMonthOfDay(dateString);
  return year + '-12-' + endDay + ' 23:59:59';
}

/*获取某个日期是当年中的第几天*/
export function getDayOfYear(time) {
  var firstDayYear = getFirstDayOfYear(time);
  var numSecond = (new Date(time).getTime() - new Date(firstDayYear).getTime()) / 1000;
  return Math.ceil(numSecond / (24 * 3600));
}

/*获取某个日期在这一年的第几周*/
export function getDayOfYearWeek(time) {
  var numdays = getDayOfYear(time);
  return Math.ceil(numdays / 7);
}
