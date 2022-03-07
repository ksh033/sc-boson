---
title: ScCascader 级联选择
order: 5
nav:
  title: 组件
---

## ScCascader 级联选择

级联选择。

## 何时使用

-需要从一组相关联的数据集合进行选择，例如省市区，公司层级，事物分类等。

-从一个较大的数据集合中进行选择时，用多级分类进行分隔，方便选择。

-比起 Select 组件，可以在同一个浮层中完成选择，有较好的体验。

## 代码演示

```jsx
/** Title: 基础 desc: 基础树形 */
import React from 'react';
import { ScCascader } from 'sc-element';

export default () => {
  const data = [
    {
      label: '空',
      value: '',
    },
    {
      label: 'select1',
      value: '1',
      children: [
        {
          label: 'select1-1',
          value: '1-1',
        },
      ],
    },
    {
      label: 'select2',
      value: '2',
    },
  ];
  return <ScCascader data={data} />;
};
```

```jsx
/** Title: 异步请求 */
import React, { useState } from 'react';
import { Button } from 'antd';
import { ScCascader } from 'sc-element';

export default () => {
  const [params, setParams] = useState({ type: 1 });

  const request = (_params) => {
    return new Promise(function (reslove, reject) {
      let data = [];
      if (_params.type < 5) {
        data = [
          {
            label: '空',
            value: '',
          },
          {
            label: 'select1',
            value: '1',
            children: [
              {
                label: 'select1-1',
                value: '1-1',
              },
            ],
          },
          {
            label: 'select2',
            value: '2',
          },
        ];
      } else {
        data = [
          {
            label: '空',
            value: '',
          },
        ];
      }
      reslove(data);
    });
  };
  return (
    <div>
      <div style={{ lineHeight: '2' }}>
        远程请求数据，更具参数修改数据,当type>5时会改变数据, 当前type：{params.type}
      </div>
      <ScCascader
        request={request}
        autoload={true}
        params={params}
        loadData={(selectedOptions) => {
          console.log(selectedOptions);
        }}
      />
      <Button
        onClick={() => {
          let type = Math.floor(Math.random() * 10);
          console.log(type);
          setParams({ type });
        }}
        style={{
          marginLeft: '16px',
        }}
      >
        改变参数
      </Button>
    </div>
  );
};
```

## API

### ScSelect props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| textField | 显示值字段 | string | label |
| valueField | 隐藏值字段 | string | value |
| autoload | 组件初始化时是否自动加载数据，当值为 true 时，需要从配置参数 type | boolean | false |
| data | 绑定数据 | array | [] |
| request | 一个获得 dataSource 的方法 | (params?: any) => Promise |  |
| onLoad | 数据加载完成后触发, 会多次触发 | (dataSource: T[]) => void |  |
| params | 查询参数 | object | {} |
| pIdField | 联动查询的父级 id 的字段 | string |  |
| asyn | 异步查询加载 | boolean | false |

更多配置项，请查看 Antd [ `cascader` ](https://ant.design/components/cascader-cn/)。
