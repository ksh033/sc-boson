---
title: ScSearchBar 查询面板
order: 12
nav:
  title: 组件
---

## ScSearchBar 查询面板

具有数据收集、校验和提交功能的表单，包含复选框、单选框、输入框、下拉选择框等元素。

## 代码演示

```jsx
/** Title: 基础 */
import React from 'react';
import { ScSearchBar } from 'sc-element';
import { Input, Select } from 'antd';
let Option = Select.Option;

export default () => {
  let queryList = [
    { label: '规则编号', name: 'no', component: <Input placeholder="请输入" /> },
    {
      label: '使用状态',
      name: 'status',
      component: (
        <Select placeholder="请选择">
          <Option value="0">关闭</Option>
          <Option value="1">运行中</Option>
        </Select>
      ),
    },
    { label: '规则编2号2', name: 'no2222', component: <Input placeholder="请输入" /> },
    {
      label: '使用状态2',
      name: 'status2',
      component: (
        <Select placeholder="请选择">
          <Option value="0">关闭</Option>
          <Option value="1">运行中</Option>
        </Select>
      ),
    },
  ];

  return <ScSearchBar queryList={queryList} initialValues={{ no: '1' }} />;
};
```

## 表单

我们为 `form` 提供了以下三种排列方式：

- 水平排列：标签和表单控件水平排列；（默认）
- 垂直排列：标签和表单控件上下垂直排列；
- 行内排列：表单项水平行内排列。

## 关于初始值和默认值

- 定义：初始值为组件首次加载时表单的原始值，默认值为点击“重置”按钮后表单恢复的值，通常情况下初始值和默认值是一致的
- 初始值设置：页面初始化时，在模型中设置 searchData（组件参数的 modelKey）的值
- 默认值设置：不做任何设置时，默认值等于初始值，若要手工将默认值设置成和初始值不同，则在模型中需设置 search_bar_initialValue 的值
- 特殊情况：当没有初始值时，且需要默认值也为空的情况下，要手工的将 search_bar_initialValue 设置为 null，否则会将第一次有效使用的参数值作为默认值

## API

## ScSearchBar

查询面板，。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| queryList | 查询框组件 | array [{label: 标签名, name; 控件 id, component: 查询组件, hiddenExpend: 是否隐藏}] | 无 |
| className | 自定义样式名 | any | 无 |
| request | 一个获得 dataSource 的方法 | (params?: any) => Promise | '' |
| onLoad | 数据加载完成后触发, 会多次触发 | (dataSource: T[]) => void | '' |
| customOptionButtons | 自定义按钮 | () => React. ReactNode[] | null |
| colNumber | 每行显示多少个 | number | null |
| onReset | 重置的回调函数 | (values: any) => void |  |
| onSubmit | 查询的回调函数 | (values: any) => void |  |
| form | 表单控制实例 | React. MutableRefObject 或者 ((actionRef: ActionType) => void) | null |
