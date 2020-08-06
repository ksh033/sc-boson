---
title: ScFragment 占位组件
order: 9
nav:
  title: 组件
---

## ScFragment 占位组件

对react自带的Fragment组件的拓展。
有时候需要用一个组件将若干组件包裹，但又不想引入多余的dom标签，此时需要使用Fragment组件。
但Fragment组件有个缺陷，不能传递props参数。
ScFragment是对Fragment进行一个包装，其位可传递props的Fragment。

## 应用场景举例：

用于包裹一组按钮，并标记权限属性，用来做权限控制。

## 代码演示

``` jsx
/**
 * title: 基础
 */
import React from 'react'
import { ScFragment } from 'sc-element';
import { Button }  from 'antd';

export default () => {
  return (
    <ScFragment>
      <Button>button1</Button>
      <Button style={{marginLeft: '8px'}}>button2</Button>
    </ScFragment>
  )
}
```

## API

## ScFragment

组件没有特定有用的参数。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
