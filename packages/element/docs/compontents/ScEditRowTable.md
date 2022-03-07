---
title: ScEditRowTable 可编辑行表格
order: 20
nav:
  title: 组件
---

## ScEditRowTable 可编辑行表格

对 Table 组件的拓展。

## 代码演示

```jsx
/** Title: 基础 */
import React from 'react';
import { ScEditRowTable } from 'sc-element';
import { Button, Input, Select } from 'antd';
const Option = Select.Option;

export default () => {
  const handleSubmit = (key, row, record) => {
    console.log(key);
    console.log(row);
    console.log(record);
  };
  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: 'age',
      dataIndex: 'age',
      width: '15%',
      editable: true,
    },
    {
      title: 'address',
      dataIndex: 'label',
      width: '40%',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'opertaion',
    },
  ];
  const request = (params) => {
    return new Promise(function (reslove, reject) {
      let dataSource = [];
      const total = 20;
      for (let i = 0; i < total; i++) {
        dataSource.push({
          key: i,
          name: 'name' + i,
          age: i + 1,
          editable: false,
        });
      }
      reslove({
        rows: dataSource,
        total: total,
        current: 1,
        size: 10,
      });
    });
  };

  const onLoad = (data) => {
    console.log(data);
    return data;
  };

  return (
    <ScEditRowTable
      columns={columns}
      request={request}
      onLoad={onLoad}
      onSubmit={handleSubmit}
      autoload
    >
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </ScEditRowTable>
  );
};
```

## API

## ScEditRowTable 新增属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| request | 一个获得 dataSource 的方法 | (params?: any) => Promise | '' |
| onLoad | 数据加载完成后触发, 会多次触发 | (dataSource: T[]) => void | '' |
| data | 如果不绑定 Redux effects 可以指定 data{rows:[], total 总数} | Object |  |
| pageSize | 每页显示条数 | number | 10 |
| params | 默认查询参数 | Object | null |
| autoload | 是否自动加载数据。当默认查询条件已知的情况下可使用自动加载，如果默认查询条件需要请求后端接口才能知道，那么不建议自动加载。 | boolean | false |
| checkbox | 是否显示勾选框（该功能存在 bug，待修复） | boolean | false |
| saveText | 保存按钮的名称 | string | '提交' |
| showEditOperation | 是否显示修改和提交的操作列 | boolean | true |
| cancelText | 取消按钮的名称 | string | '取消' |
| saveRef | 表格暴露的实例 | React. MutableRefObject | null |
| rowHeadRender | 每行的头部 | (record:any) => React. ReactNode |  |
| onSubmit | 行提交的方法 | (key:string, row:any, record:any) => void |  |

### Column 新增属性

列描述数据对象，是 columns 中的一项，Column 使用相同的 API。

| 参数     | 说明       | 类型                                               | 默认值 |
| -------- | ---------- | -------------------------------------------------- | ------ |
| editable | 是否可编辑 | boolean                                            | false  |
| editor   | 编辑器配置 | '{component:'ReactNode', options:{}}' \| ReactNode | -      |

更多 api 请访问[Table](https://ant.design/components/table-cn/)。
