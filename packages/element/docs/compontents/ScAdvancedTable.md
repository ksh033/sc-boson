---
title: ScAdvancedTable 复杂表格
order: 4
nav:
  title: 组件
---

## ScAdvancedTable 复杂表格

对 Table 组件的拓展。

## 代码演示

### 列动态显示隐藏

```jsx
import React from 'react';
import { ScAdvancedTable } from 'sc-element';

export default () => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
  ];
  let dataSource = [];
  for (let i = 0; i < 100; i++) {
    dataSource.push({
      key: i,
      name: 'name' + i,
      age: i + 1,
    });
  }
  return (
    <ScAdvancedTable
      columns={columns}
      data={dataSource}
      pagination={{
        pageSize: 5,
      }}
      showColumnsControl={true}
    />
  );
};
```

### 自定义提示语

```jsx
import React from 'react';
import { ScAdvancedTable } from 'sc-element';

export default () => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
  ];
  let dataSource = [];
  return (
    <ScAdvancedTable
      columns={columns}
      data={dataSource}
      pagination={{
        pageSize: 5,
      }}
      locale={{
        filterConfirm: '确定',
        filterReset: '重置',
        emptyText: '暂无数据...',
      }}
    />
  );
};
```

### 自定义工具栏

```jsx
import React from 'react';
import { Button } from 'antd';
import { ScAdvancedTable } from 'sc-element';

export default () => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
  ];
  let dataSource = [];
  for (let i = 0; i < 100; i++) {
    dataSource.push({
      key: i,
      name: 'name' + i,
      age: i + 1,
    });
  }
  const customToolbar = (
    <span>
      <Button
        onClick={() => {
          alert('下载pdf');
        }}
      >
        file-pdf
      </Button>
      <Button
        onClick={() => {
          alert('下载excel');
        }}
        style={{
          marginLeft: '8px',
        }}
      >
        file-excel
      </Button>
    </span>
  );
  return (
    <ScAdvancedTable
      customToolbar={customToolbar}
      columns={columns}
      data={dataSource}
      pagination={{
        pageSize: 5,
      }}
    />
  );
};
```

### 行可改变顺序

```jsx
import React from 'react';
import update from 'immutability-helper';
import { ScAdvancedTable } from 'sc-element';
class DemoModal extends React.Component {
  constructor(props) {
    super(props);
    let dataSource = [];
    for (let i = 0; i < 5; i++) {
      dataSource.push({
        key: i,
        name: 'name' + i,
        age: i + 1,
      });
    }
    this.state = {
      data: dataSource,
    };
  }
  render() {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 400,
      },
      {
        title: '年龄',
        dataIndex: 'age',
        key: 'age',
      },
    ];
    const { data } = this.state;
    return (
      <ScAdvancedTable
        canRowMove={true}
        columns={columns}
        data={data}
        pagination={{
          pageSize: 5,
        }}
        onMoveRow={(dragIndex, hoverIndex) => {
          const { data } = this.state;
          const dragRow = data[dragIndex];

          this.setState(
            update(this.state, {
              data: {
                $splice: [
                  [dragIndex, 1],
                  [hoverIndex, 0, dragRow],
                ],
              },
            }),
          );
        }}
      />
    );
  }
}
export default DemoModal;
```

### 服务端分页

```jsx
import React from 'react';
import update from 'immutability-helper';
import { ScAdvancedTable } from 'sc-element';
class DemoModal extends React.Component {
  constructor(props) {
    super(props);
    let rows = [];
    for (let i = 0; i < 5; i++) {
      rows.push({
        key: i,
        name: 'name' + i,
        age: i + 1,
      });
    }
    this.state = {
      data: {
        rows: rows,
        current: 1,
        total: 100,
        pageSize: 5,
      },
    };
  }
  render() {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '年龄',
        dataIndex: 'age',
        key: 'age',
        sorter: (a, b) => a.age - b.age, //排序
      },
    ];
    const { data } = this.state;
    return (
      <ScAdvancedTable
        columns={columns}
        data={data}
        paginationType={'server'}
        pagination={{
          onChange: (page, pageSize) => {
            console.log('pageNumber: ' + page);
            console.log('pageSize: ' + pageSize);
            let { data } = this.state;
            data.current = page;
            data.pageSize = pageSize;
            this.setState({ data });
          },
        }}
      />
    );
  }
}
export default DemoModal;
```

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| paginationType | 分页方式，分为客户端分页'client'和服务端分页'server' | string | 'client' |
| data | 数据源，根据分页方式的不同，数据结构不同，客户端分页时数据源为数组，服务端分页时数据源为包含分页信息的对象 | Array 或 Object | null |
| showColumnsControl | 是否开启动态控制列的显示和隐藏功能 | boolean | false |
| columnsResizable | 是否开启列宽拖动功能（开启此功能还需要配置 columns 的 width 属性） | boolean | false |
| canRowMove | 是否开启行拖动功能（开启此功能还需要自己编写数据改变的逻辑） | boolean | false |
| onMoveRow | 需要开启 canRowMove，当行拖动后触发，可获得拖动目标行的索引和放置行的索引，从而改变数据的排序 | (dragIndex, hoverIndex)=>void | null |
| customToolbar | 自定义工具栏 | string 或 reactDom | null |
| showOrderNumber | 是否显示行序号 | boolean | false |

更多 api 请访问[Table](https://ant.design/components/table-cn/)。
