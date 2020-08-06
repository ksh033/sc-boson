---
title: ScTree 树组件
order: 17
nav:
  title: 组件
---

## ScTree 树组件

展示树结构数据, 基于antd, Tree组件扩展, 避免了手动创建树节点。

## 代码演示

``` jsx
/**
 * title: 基础
 */
import React from 'react'
import { ScTree } from 'sc-element';

export default () => {
  const treeData = [
    {
      title: '父节点',
      key: '0',
      children: [
        {
          title: '子节点1',
          key: '10',
        },
        {
          title: '子节点2',
          key: '11',
        }
      ]
    }
  ];

  return (
    <ScTree
      data={treeData}
    />
  )
}
```

``` jsx
/**
 * title: 显示额外信息
 */
import React from 'react'
import { ScTree } from 'sc-element';

export default () => {
  const treeData = [
    {
      title: '父节点',
      key: '0',
      metaInfo: <span style={{ color: '#f00' }}>（100）</span>, //传入要额外显示信息，可以是普通的字符串，也可以是dom
      children: [
        {
          title: '子节点1',
          key: '10',
          metaInfo: '（30）'
        },
        {
          title: '子节点2',
          key: '11',
          metaInfo: '（70）'
        }
      ]
    }
  ]
  const nodeRender = nodeData => {
    return (
      <div className="newNode">
        <span>{nodeData['title']} </span>
        <ul className="toolbar">
          <li>
            plus-circle
          </li>{' '}
          <li>
            edit
          </li>
          <li>
            delete
          </li>
        </ul>
      </div>
    )
  }

  return (
    <ScTree defaultExpandAll={true} nodeRender={nodeRender} data={treeData} />
  )
}
```

``` jsx
/**
 * title: 异步请求
 */
import React from 'react'
import { ScTree } from 'sc-element';

export default () => {
  const initTreeDate = [
    { title: 'Expand to load', key: '0' },
    { title: 'Expand to load', key: '1' },
    { title: 'Tree Node', key: '2', isLeaf: true }
  ]

  const request = params => {
    console.log(params)
    return new Promise(function(reslove, reject) {
      let data = initTreeDate
      if (params !== null) {
        data = [
          { title: 'Child Node', key: `${params.key}-0` },
          { title: 'Child Node', key: `${params.key}-1` }
        ]
      }
      reslove(data)
    })
  }

  return (
    <ScTree
      canSearch={true}
      placeholder={'search'}
      onSearch={value => {
        console.log('the search value is ' + value)
      }}
      defaultExpandAll={true}
      params={{}}
      autoload={true}
      request={request}
    />
  )
}
```

``` jsx
/**
 * title: 带搜索框的树
 */
import React from 'react'
import { ScTree } from 'sc-element';

export default () => {
  const treeData = [
    {
      title: '父节点',
      key: '0',
      children: [
        {
          title: '子节点1',
          key: '10'
        },
        {
          title: '子节点2',
          key: '11'
        }
      ]
    }
  ];

  return (
    <ScTree
      canSearch={true}
      placeholder={'search'}
      onSearch={(value)=>{
          console.log('the search value is ' + value)
      }}
      data={treeData}
    />
  )
}
```

## API

### ScTree

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 树组件的数据源, 可配置的字段参照antd组件中的Tree. TreeNode的props可选值  | array | [] |
| textField | 用于显示的字段名称  | string | "title" |
| valueField | 作为值的字段名称  | string | "key" |
| request | 一个获得 dataSource 的方法 | (params?: any) => Promise | '' |
| onLoad | 数据加载完成后触发, 会多次触发 | (dataSource: T[]) => void | '' |
| params | 异步加载树的请求参数  | object | {} |
| autoload | 是否自动加载异步树的第一级节点  | boolean | false |
| canSearch | 是否显示搜索框 | boolean | false |
| placeholder | 搜素框的占位符 | string | '' |
| root | 自定义根节点  | object | null |
| onSearch | 搜索框的值改变时触发的方法 | (value)=>void | null |
