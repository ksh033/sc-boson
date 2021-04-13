---
title: ScTable 数据绑定表格
order: 15
nav:
  title: 组件
---

## ScTable 数据绑定表格

展示行列数据, 基于 antd, table 组件扩展, 增加绑定 redux 绑定, 不需要自己去控制表格 data 属性

## 何时使用

* 当有大量结构化的数据需要展现时；
* 当需要对数据进行排序、搜索、分页、自定义操作等复杂行为时。

## 代码演示

``` jsx
/**
 * title: 基础
 */
import React from 'react'
import { ScTable } from 'sc-element';

export default () => {
  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "年龄",
      dataIndex: "age",
      key: "age"
    },
    {
      title: "住址",
      dataIndex: "address",
      key: "address"
    }
  ];
  const data = {
    rows: [{ name: 'aaa', age: '16', address: 'xinsad' }],
    total: 1,
  };
  return (
    <ScTable
      data={data}
      columns={columns}
    />
  )
}
```

``` jsx
/**
 * title: 异步请求
 */
import React, {useRef} from 'react'
import {
  Divider,
  Badge,
} from 'antd';
import { ScTable } from 'sc-element';
import moment from 'moment';
const Operation = ScTable.Operation;

export default () => {
  const getValue = obj => {
    return Object.keys(obj).map(key => obj[key]).join(',');
  }
  const statusMap = ['default', 'processing', 'success', 'error'];
  const status = ['关闭', '运行中', '已上线', '异常'];
  const saveRef = useRef()
  
  const columns = [
    {
      title: '规则编号',
      dataIndex: 'no',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '服务调用次数',
      dataIndex: 'callNo',
      sorter: true,
      align: 'right',
      filters: [
        {
          text: '3万以内',
          value: 3,
        },
        {
          text: '5万以内',
          value: 5,
        },
        {
          text: '10万以内',
          value: 10,
        },
        {
          text: '15万以内',
          value: 15,
        },
      ],
      render: val => `${val} 万` , // mark to display a total number
      needTotal: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
        {
          text: status[2],
          value: 2,
        },
        {
          text: status[3],
          value: 3,
        },
      ],
      onFilter: (value, record) => record.status.toString() === value,
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record, index) => {
        var t=arguments;
        return (
          <Operation
            key={index}
            max={3}
            buttons={[
              {
                disabled:true,
                text:'修改',
                onClick:()=>{
                  alert('update')
                },
              },
              { text:'删除'},
              { text:'审核'},
              { text:'查看'},
              { text:'提交'},
            ]}/>
        )
      },
    },
  ];
  const request = (params) => {
    const {size ,current} = params
    return new Promise(function(reslove, reject) {
      let data = [];
      for (let i = 0; i < size; i++) {
        data.push({
          no:  (current - 1) * size + i,
          description: 'fhja',
          callNo: Math.floor(Math.random() * 30),
          status:  Math.floor(Math.random() * 3),
          updatedAt: new Date().getTime()
        });
      }
      reslove({
        rows: data,
        total: 100,
        current: params.current,
        size: params.size
      });
    });
  }
  const  onLoad = (data) => {
    return data;
  }

  const onSelectRow = (selectedRowKeys, selectedRows) => {
     console.log(selectedRows)
  }
  return (
   <ScTable
      checkbox={true}
      /* rowSelection={{}} */
      customSelectedHeader={(selectedRowKeys) => {
        console.log(selectedRowKeys);
        return(
          <div>共{selectedRowKeys.length}条</div>
        )
      }}
      rowKey="no"
      onSelectRow={onSelectRow}
      request={request}
      onLoad = {onLoad}
      saveRef={saveRef}
      autoload={true}
      columns={columns}
    />
  )
}
```

## 项目应用

* 在实际使用过程中可将表格的列表描述 columns 用一个配置文件管理，通常是页面文件夹中的'components/pageConfig.js'
* 获得列描述可使用'src/utils/pageUtils'中的 generatorTaleInfo 方法
* 表格的最后一列通常是操作列，需使用组件 ScTable. Operation
* 组件中的页码参数自动维护，不要手动去修改，即不要在组件的 params 参数中去修改 current 和 size 的值，否则翻页功能会失效

## API

### ScTable 新增属性

| 参数                 | 说明                                                                | 类型                      | 默认值     |
| -------------------- | -------------------------------------------------------------------| ------------------------- | ---------- |
| request              | 一个获得 dataSource 的方法                                          | (params?: any) => Promise | ''         |
| onLoad               | 数据加载完成后触发, 会多次触发                                        | (dataSource: T[]) => void | ''         |
| data                 | data{rows:[], total 总数}                                           | Object                    |            |
| pageSize             | 每页显示条数                                                         | number                    | 10         |
| params               | 默认查询参数                                                         | Object                    | null       |
| autoload             | 是否自动加载数据。当默认查询条件已知的情况下可使用自动加载，如果默认查询条件需要请求后端接口才能知道，那么不建议自动加载。 | boolean  | false  |
| checkbox             | 是否显示勾选框（该功能存在 bug，待修复）                                | boolean                   | false      |
| rowKey               | 数据中哪个值作为选中的key                                             | string                   | 'key'      |
| selectedRowKeys      | 选中的key                                                           | string[]                   | null      |
| selectedRows         | 选中的对象                                                            | any[]                   | null      |
| saveRef              | 表格暴露的实例                                                       | React. MutableRefObject   | null      |
| rowHeadRender        | 每行的头部                                                          | (record:any) => React. ReactNode    |            | 
| onSelectRow          | 当选中时触发                                                        | (selectedRowKeys: string[], selectedRows: any[]) => void |            |
| onCustomRow          | 自定义行事件为了合并现有的方法                                        | (record: any, index: number) => {}; |            |
| onRowSelect          | 行选中时处理                                                        | (record: any) => void; |            |

### ScTable. Operation

| 参数    | 说明                                                 | 类型   | 默认值 |
| ------- | ---------------------------------------------------- | ------ | ------ |
| max     | 最多显示多少个按钮，当超过限制值时，会显示“更多”按钮 | number | 3      |
| buttons | 按钮数组                                             | array  | []     |

#### buttons 的属性值

| 参数    | 说明                                               | 类型     | 默认值     |
| ------- | -------------------------------------------------- | -------- | ---------- |
| text    | 按钮上显示的文字                                   | string   |            |
| icon    | 按钮上显示的图标，对应 Antd 中 Icon 组件的 type 值 | string   |            |
| onClick | 点击按钮触发的事件                                 | function | () => void |

更多配置项，请查看 Antd [ `Table` ](/components/table/)。
