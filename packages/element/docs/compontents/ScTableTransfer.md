---
title: ScTableTransfer 网格穿梭框
order: 16
nav:
  title: 组件
---

## ScTableTransfer 网格穿梭框

双栏穿梭选择框。

## 何时使用

用直观的方式在两栏中移动元素，完成选择行为。两栏需要显示的数据较多选择一个或以上的选项后，点击对应的方向键，可以把选中的选项移动到另一栏。其中，左边一栏为 `source` ，右边一栏为 `target` ，API 的设计也反映了这两个概念。

## 代码演示

```jsx
/** Title: 基础 */
import React from 'react';
import { ScTableTransfer } from 'sc-element';

export default () => {
  let data = { rows: [] };
  let targetData = { rows: [] };
  for (let i = 0; i < 11; i++) {
    data.rows.push({ sn: +'00' + i, type: 'T00' + i, info: 'test' + i });
  }
  const columns = [
    {
      title: '终端编号(SN)',
      dataIndex: 'sn',
      width: 100,
    },
    {
      title: '设备型号',
      dataIndex: 'type',
      width: 100,
    },
    {
      title: ' 备注信息',
      dataIndex: 'info',
      width: 100,
    },
  ];
  return (
    <ScTableTransfer
      targetData={targetData}
      data={data}
      showSearch={true}
      valueField={'sn'}
      searchField={'type'}
      columns={columns}
      titles={['左侧标题', '右侧标题']}
      pagination={false}
    />
  );
};
```

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| className | 自定义类 | string |  |
| dataSource | 数据源，其中的数据将会被渲染到左边一栏中， `targetKeys` 中指定的除外。 | [TransferItem](https://git.io/vMM64)\[] | \[] |
| filterOption | 接收 `inputValue` `option` 两个参数，当 `option` 符合筛选条件时，应返回 `true` ，反之则返回 `false` 。 | (inputValue, option): boolean |  |
| footer | 底部渲染函数 | (props): ReactNode |  |
| lazy | Transfer 使用了 [react-lazy-load](https://github.com/loktar00/react-lazy-load) 优化性能，这里可以设置相关参数。设为 `false` 可以关闭懒加载。 | object\|boolean | `{ height: 32, offset: 32 }` |
| listStyle | 两个穿梭框的自定义样式 | object |  |
| notFoundContent | 当列表为空时显示的内容 | string\|ReactNode | '列表为空' |
| operations | 操作文案集合，顺序从下至上 | string\[] | ['>', '<'] |
| render | 每行数据渲染函数，该函数的入参为 `dataSource` 中的项，返回值为 ReactElement。或者返回一个普通对象，其中 `label` 字段为 ReactElement， `value` 字段为 title | Function(record) |  |
| searchPlaceholder | 搜索框的默认值 | string | '请输入搜索内容' |
| selectedKeys | 设置哪些项应该被选中 | string\[] | \[] |
| showSearch | 是否显示搜索框 | boolean | false |
| targetKeys | 显示在右侧框数据的 key 集合 | string\[] | \[] |
| titles | 标题集合，顺序从左至右 | string\[] | ['', ''] |
| onChange | 选项在两栏之间转移时的回调函数 | (targetKeys, direction, moveKeys): void |  |
| onScroll | 选项列表滚动时的回调函数 | (direction, event): void |  |
| onSearchChange | 搜索框内容时改变时的回调函数 | (direction: 'left'\|'right', event: Event): void | - |
| onSelectChange | 选中项发生改变时的回调函数 | (sourceSelectedKeys, targetSelectedKeys): void |  |

## 注意

按照 React 的[规范](http://facebook.github.io/react/docs/lists-and-keys.html#keys)，所有的组件数组必须绑定 key。在 Transfer 中， `dataSource` 里的数据值需要指定 `key` 值。对于 `dataSource` 默认将每列数据的 `key` 属性作为唯一的标识。

如果你的数据没有这个属性，务必使用 `rowKey` 来指定数据列的主键。
