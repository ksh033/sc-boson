---
title: ScDatePicker 日期选择框
order: 7
nav:
  title: 组件
---

## ScDatePicker 日期选择框

输入或选择日期的控件。

## 何时使用

当用户需要输入一个日期，可以点击标准输入框，弹出日期面板进行选择。

## 代码演示

```jsx
/** Title: 基础 desc: 时间类控件 */
import React from 'react';
import { ScDatePicker as ScDate } from 'sc-element';

const { ScRangePicker, ScDatePicker } = ScDate;

export default () => {
  return (
    <div>
      <ScDatePicker format={'YYYYMMDD'} value={'20180101'} />
      <br />
      <ScRangePicker
        format={'YYYYMMDD'}
        value={['20180101', '20180102']}
        rangesList={[
          { text: '一周', type: 'w', value: 1 },
          { text: '一月', type: 'M', value: 1 },
          { text: '一年', type: 'y', value: 1 },
        ]}
      />
    </div>
  );
};
```

## API

日期类组件包括以下四种形式。

- DatePicker
- MonthPicker
- RangePicker
- WeekPicker

### 国际化配置

默认配置为 en-US，如果你需要设置其他语言，推荐在入口处使用我们提供的国际化组件, 详见：[LocaleProvider 国际化](http://ant.design/components/locale-provider-cn/)。

如有特殊需求（仅修改单一组件的语言），请使用 locale 参数，参考：[默认配置](https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json)。

### 共同的 API

以下 API 为 DatePicker、MonthPicker、RangePicker, WeekPicker 共享的 API。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| allowClear | 是否显示清除按钮 | boolean | true |
| autoFocus | 自动获取焦点 | boolean | false |
| className | 选择器 className | string | '' |
| dateRender | 自定义日期单元格的内容 | function(currentDate: moment, today: moment) => React. ReactNode | - |
| disabled | 禁用 | boolean | false |
| disabledDate | 不可选择的日期 | (currentDate: moment) => boolean | 无 |
| dropdownClassName | 额外的弹出日历 className | string | - |
| getCalendarContainer | 定义浮层的容器，默认为 body 上新建 div | function(trigger) | 无 |
| locale | 国际化配置 | object | [默认配置](https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json) |
| open | 控制弹层是否展开 | boolean | - |
| placeholder | 输入框提示文字 | string\|RangePicker\[] | - |
| popupStyle | 额外的弹出日历样式 | object | {} |
| size | 输入框大小， `large` 高度为 40px， `small` 为 24px，默认是 32px | string | 无 |
| style | 自定义输入框样式 | object | {} |
| onOpenChange | 弹出日历和关闭日历的回调 | function(status) | 无 |

### 共同的方法

| 名称    | 描述     |
| ------- | -------- |
| blur()  | 移除焦点 |
| focus() | 获取焦点 |

### DatePicker

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- | --- | --- |
| defaultValue | 默认日期 | [moment](http://momentjs.com/) | 无 |
| disabledTime | 不可选择的时间 | function(date) | 无 |
| format | 展示的日期格式，配置参考 [moment.js](http://momentjs.com/) | string | "YYYY-MM-DD" |
| mode | 日期面板的状态 | `time | date | month | year` | 'date' |
| renderExtraFooter | 在面板中添加额外的页脚 | () => React. ReactNode | - |
| showTime | 增加时间选择功能 | Object\|boolean | [TimePicker Options](/components/time-picker/#API) |
| showTime.defaultValue | 设置用户选择日期时默认的时分秒，[例子](#components-date-picker-demo-disabled-date) | [moment](http://momentjs.com/) | moment() |
| showToday | 是否展示“今天”按钮 | boolean | true |
| value | 日期 | [moment](http://momentjs.com/) | 无 |
| onChange | 时间发生变化的回调 | function(date: moment, dateString: string) | 无 |
| onOk | 点击确定按钮的回调 | function() | - |
| onPanelChange | 日期面板变化时的回调 | function(value, mode) | - |

### MonthPicker

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultValue | 默认日期 | [moment](http://momentjs.com/) | 无 |
| format | 展示的日期格式，配置参考 [moment.js](http://momentjs.com/) | string | "YYYY-MM" |
| monthCellContentRender | 自定义的月份内容渲染方法 | function(date, locale): ReactNode | - |
| renderExtraFooter | 在面板中添加额外的页脚 | () => React. ReactNode | - |
| value | 日期 | [moment](http://momentjs.com/) | 无 |
| onChange | 时间发生变化的回调，发生在用户选择时间时 | function(date: moment, dateString: string) | - |

### WeekPicker

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultValue | 默认日期 | [moment](http://momentjs.com/) | - |
| format | 展示的日期格式，配置参考 [moment.js](http://momentjs.com/) | string | "YYYY-wo" |
| value | 日期 | [moment](http://momentjs.com/) | - |
| onChange | 时间发生变化的回调，发生在用户选择时间时 | function(date: moment, dateString: string) | - |

### RangePicker

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- |
| defaultValue | 默认日期 | [moment](http://momentjs.com/)\[] | 无 |
| disabledTime | 不可选择的时间 | function(dates: [moment, moment], partial: `'start' | 'end'` ) | 无 |
| format | 展示的日期格式 | string | "YYYY-MM-DD HH:mm:ss" |
| ranges       | 预设时间范围快捷选择 | { \[range: string]: [moment](http://momentjs.com/)\[] } \| () => { \[range: string]: [moment](http://momentjs.com/)\[] } | 无 |
| renderExtraFooter | 在面板中添加额外的页脚 | () => React. ReactNode | - |
| showTime | 增加时间选择功能 | Object\|boolean | [TimePicker Options](/components/time-picker/#API) |
| showTime.defaultValue | 设置用户选择日期时默认的时分秒，[例子](#components-date-picker-demo-disabled-date) | [moment](http://momentjs.com/)\[] | [moment(), moment()] |
| value | 日期 | [moment](http://momentjs.com/)\[] | 无 |
| onCalendarChange | 待选日期发生变化的回调 | function(dates: [moment, moment], dateStrings: [string, string]) | 无 |
| onChange | 日期范围发生变化的回调 | function(dates: [moment, moment], dateStrings: [string, string]) | 无 |
| onOk | 点击确定按钮的回调 | function() | - |
