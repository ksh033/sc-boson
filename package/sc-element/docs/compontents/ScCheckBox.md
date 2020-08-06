---
title: ScCheckbox 多选框
order: 6
nav:
  title: 组件
---

## ScCheckbox 多选框

多选框。

## 何时使用

* 在一组可选项中进行多项选择时；
* 单独使用可以表示两种状态之间的切换，和 `switch` 类似。区别在于切换 `switch` 会直接触发状态改变，而 `checkbox` 一般用于状态标记，需要和提交操作配合。

## 代码演示

``` jsx
/**
 * title: 基础
 * desc: 多选框
 */
import React from 'react'
import { ScCheckBox }  from 'sc-element';

export default () => {
  const data=[
    {label:'A',value:'a'},
    {label:'B',value:'b'},
    {label:'C',value:'c'},
    {label:'D',value:'d'}
  ];
  return (
    <ScCheckBox
      data={data}
      defaultValue={['a', 'b']}
    />
  )
};

```

``` jsx
/**
 * title: 异步请求
 */
import React from 'react'
import { ScCheckBox }  from 'sc-element';

export default () => {
  const request = () => {
    return new Promise(function(reslove, reject) {
      reslove([
        {label:'A',value:'a'},
        {label:'B',value:'b'},
        {label:'C',value:'c'},
        {label:'D',value:'d'}
      ]);
    });
  }
  return (
   <ScCheckBox
      request={request}
      autoload={true}
    />
  )
};

```

## API

### Checkbox

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultValue | 默认选中的选项 | string\[] | \[] |
| options | 指定可选项 | string\[] | \[] |
| value | 指定选中的选项 | string\[] | \[] |
| request | 一个获得 dataSource 的方法 | (params?: any) => Promise | '' |
| onLoad | 数据加载完成后触发, 会多次触发 | (dataSource: T[]) => void | '' |
| onChange | 变化时回调函数 | Function(checkedValue) | - |
| textField | 显示值字段 | string/function | text |
| valueField | 隐藏值字段 | string | value |
| data | 绑定数据 | array | [] |
| params | 查询参数 | object | {} |
| autoload  | 是否自动加载数据。当默认查询条件已知的情况下可使用自动加载，如果默认查询条件需要请求后端接口才能知道，那么不建议自动加载。 | boolean  | false  |
