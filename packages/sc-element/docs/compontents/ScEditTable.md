---
title: ScEditTable 可编辑单元格
order: 19
nav:
  title: 组件
---

## ScEditTable 可编辑单元格

对Table组件的拓展。

## 代码演示

``` jsx
/**
 * title: 基础
 */
import React from 'react'
import { ScEditTable } from 'sc-element';
import {
  Button, Input, Select
} from 'antd';
const Option=Select.Option

export default () => {
  const handleSubmit = (value) => {
    console.log(value);
  }
  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '25%',
      editor:{component:<Input/>,options:{}},
      editable: true
    },
    {
      title: 'age',
      dataIndex: 'age',
      width: '15%',
      editor:{component:<Input/>,options:{}},
      editable: true
    },
    {
      title: 'address',
      dataIndex: 'label',
      width: '40%',
      editor:{component:<Select labelInValue={true}>
          <Option value="1">Option 1</Option>
          <Option value="2">Option 2</Option>
          <Option value="3">Option 3</Option>
        </Select>,options:{}},
      editable: true
    },
  ]
  let dataSource = [];
  for(let i = 0; i < 100; i++){
    dataSource.push({
      key: i,
      name: 'name' + i,
      age: i + 1
    })
  }
  return (
    <ScEditTable columns={columns} data={dataSource} onSubmit={handleSubmit}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </ScEditTable>
  )
}
```

## API

## EditTable

| 参数                 | 说明                                                                | 类型                      | 默认值     |
| -------------------- | ------------------------------------------------------------------- | ------------------------- | ---------- |
| request              | 一个获得 dataSource 的方法                                           | (params?: any) => Promise | ''         |
| onLoad               | 数据加载完成后触发, 会多次触发                                        | (dataSource: T[]) => void | ''         |
| data                 | 如果不绑定 Redux effects 可以指定 data{rows:[], total 总数}           | Object                    |            |
| pageSize             | 每页显示条数                                                         | number                    | 10         |
| params               | 默认查询参数                                                         | Object                    | null       |
| autoload             | 是否自动加载数据。当默认查询条件已知的情况下可使用自动加载，如果默认查询条件需要请求后端接口才能知道，那么不建议自动加载。 | boolean  | false  |
| saveRef              | 表格暴露的实例                                                       | React. MutableRefObject   | null      |

### Column新增属性

列描述数据对象，是 columns 中的一项，Column 使用相同的 API。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| editable | 是否可编辑 | boolean | false|
| editor | 编辑器配置 | '{component:'ReactNode', options:{}}' \| ReactNode | -|

更多api 请访问[Table](https://ant.design/components/table-cn/)。
