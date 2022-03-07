---
title: ScRadio 弹窗
order: 11
nav:
  title: 组件
---

## ScRadio 弹窗

单选框。

## 何时使用

- 用于在多个备选项中选中单个状态。
- 和 Select 的区别是，Radio 所有选项默认可见，方便用户在比较中选择，因此选项不宜过多。

## 代码演示

```jsx
/** Title: 基础 */
import React from 'react';
import { ScRadio } from 'sc-element';

export default () => {
  const data = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
    { label: 'C', value: 'c' },
    { label: 'D', value: 'd' },
  ];

  return <ScRadio data={data} defaultValue={'a'} />;
};
```

```jsx
/** Title: 按钮型选项 */
import React from 'react';
import { ScRadio } from 'sc-element';

export default () => {
  const data = [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
    { label: 'C', value: 'c' },
    { label: 'D', value: 'd' },
  ];

  return <ScRadio data={data} radioType={'button'} defaultValue={'a'} />;
};
```

```jsx
/** Title: 请求后台数据 */
import React from 'react';
import { ScRadio } from 'sc-element';

export default () => {
  const request = () => {
    return new Promise(function (reslove, reject) {
      reslove([
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
        { label: 'D', value: 'd' },
      ]);
    });
  };
  const onLoad = (data) => {
    console.log(data);
    return data;
  };

  return <ScRadio request={request} onLoad={onLoad} modelKey={'selectData'} autoload={true} />;
};
```

## API

### ScRadio

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 选项列表数据，如：[{label:'A', value:'a'}, {label:'B', value:'b'}]，用户绑定静态的数据 | array | [] |
| textField | 选项中用于显示的字段名称, 可以是字符串，也可以是一个返回字符串的函数 | string 或 (item)=>item | 'label' |
| valueField | 选项中用于作为值的字段名称 | string | 'value' |
| radioType | 选项的样式类型，可选值有'radio'和'button' | string | 'radio' |
| request | 一个获得 dataSource 的方法 | (params?: any) => Promise | '' |
| onLoad | 数据加载完成后触发, 会多次触发 | (dataSource: T[]) => any[] | '' |
| params | 请求服务端数据时的参数 | object | {} |
| autoload | 是否自动加载服务端数据，需要配合参数 type, modelKey, params 使用 | boolean |  |

### RadioGroup

单选框组合，用于包裹一组 `Radio` 。 RadioGroup 中所有的参数都可用在 ScRadio 中。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| defaultValue | 默认选中的值 | any | 无 |
| disabled | 禁选所有子单选器 | boolean | false |
| name | RadioGroup 下所有 `input[type="radio"]` 的 `name` 属性 | string | 无 |
| options | 以配置形式设置子元素 | string\[] \| Array&lt; { label: string value: string disabled?: boolean }> | 无 |
| size | 大小，只对按钮样式生效 | `large` \| `default` \| `small` | `default` |
| value | 用于设置当前选中的值 | any | 无 |
| onChange | 选项变化时的回调函数 | Function(e: Event) | 无 |
| buttonStyle | RadioButton 的风格样式，目前有描边和填色两种风格 | outline 或 solid | 无 |
