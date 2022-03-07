---
title: ScSelect 下拉选择器
order: 13
nav:
  title: 组件
---

## ScSelect 下拉选择器

下拉选择器。

## 何时使用

- 弹出一个下拉菜单给用户选择操作，用于代替原生的选择器，或者需要一个更优雅的多选器时。
- 当选项少时（少于 5 项），建议直接将选项平铺，使用 [Radio](/components/radio/) 是更好的选择。

## 代码演示

```jsx
/** Title: 异步请求 */
import React, { useState } from 'react';
import { ScSelect } from 'sc-element';
import { Button } from 'antd';

export default () => {
  const [params, setParams] = useState({ type: 1 });

  const request = (_params) => {
    return new Promise(function (reslove, reject) {
      let data = [];
      for (let i = 0; i < _params.type; i++) {
        data.push({
          text: 'select' + i,
          value: i + '',
        });
      }
      reslove(data);
    });
  };

  return (
    <div>
      <div style={{ lineHeight: '2' }}>
        每次改变参数，都会重新执行type中定义的方法，再次获取一次数据, 当前type:{params.type}
      </div>
      <ScSelect
        request={request}
        remoteSearch
        showSearch
        autoload
        params={params}
        style={{ width: 300 }}
        notFoundContent={null}
      />
      <Button
        onClick={() => {
          const type = Math.floor(Math.random() * 10);
          setParams({
            type: type,
          });
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
| textField | 显示值字段 | string | text |
| valueField | key 值字段 | string | value |
| data | 绑定数据 | array | [] |
| autoload | 组件初始化时是否自动加载数据，当值为 true 时，需要从配置参数 type | boolean | false |
| request | 一个获得 dataSource 的方法 | (params?: any) => Promise | '' |
| onLoad | 数据加载完成后触发, 会多次触发 | (dataSource: T[]) => void | '' |
| params | 查询参数 | object | {} |
| tip | 标题提示 | boolean | false |
| customRef | 组件实例 | React. MutableRefObject | null |
| onSearch | 输入查询回调 | (value)=>void | null |
| remoteSearch | 是否支持远程查询数据 | boolean | false |
| singleInput | 单选查询并生成自定义选项 | boolean | false |
| openReloadData | remoteSearch = true 时，是否每次展开都重新拉取数据 | boolean | false |

更多配置项，请查看 Antd [ `select` ](https://ant.design/components/select-cn/)。
