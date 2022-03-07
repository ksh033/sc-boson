---
title: ScForm 表单
order: 8
nav:
  title: 组件
---

## ScForm 表单

对 Form 组件的拓展。

## 代码演示

```jsx
/** Title: 基础 desc: 基础表单 */
import React, { useRef } from 'react';
import { Button, Input, message } from 'antd';
import { ScForm, ScSelect } from 'sc-element';

export default () => {
  let formConfig = [
    {
      component: Input,
      formProps: {
        initialValue: '张三',
        rules: [
          {
            required: true,
            message: '必填',
          },
        ],
      },
      props: {},
      label: '姓名',
      name: 'name',
    },
    {
      component: Input,
      formProps: {},
      props: {
        placeholder: '请输入年龄',
      },
      label: '年龄',
      name: 'age',
    },
    {
      component: ScSelect,
      formProps: {
        initialValue: '1',
      },
      props: {
        data: [
          {
            text: '男',
            value: '1',
          },
          {
            text: '女',
            value: '2',
          },
        ],
      },
      label: '性别',
      name: 'sex',
    },
    {
      component: Input,
      formProps: {},
      props: {},
      label: '年级',
      name: 'grade',
      group: '2',
    },
    {
      component: Input,
      formProps: {},
      props: {},
      label: '班级',
      name: 'class',
      group: '2',
    },
  ];

  const formItemLayout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 20,
    },
  };

  formConfig = formConfig.map((item) => {
    item.formProps = { ...item.formProps, ...formItemLayout };
    return item;
  });

  const groupConfig = [
    {
      name: 'default',
      title: '组1',
      col: 3,
      gutter: 8,
    },
    {
      name: '2',
      title: '组2',
      col: 2,
    },
  ];
  const form = useRef();
  return (
    <div>
      <ScForm formConfig={formConfig} groupConfig={groupConfig} form={form} />
      <div style={{ textAlign: 'right' }}>
        <Button
          type={'primary'}
          onClick={async () => {
            const values = await form.current.validateFields();
            console.log(values);
            message.success('提交成功');
          }}
        >
          提交
        </Button>
      </div>
    </div>
  );
};
```

## API

## ScForm

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| formConfig | 表单项配置 | array | null |
| groupConfig | 表单分组配置 | object | null |
| form | 表单控制实例 | React. MutableRefObject 或者 ((actionRef: ActionType) => void) | null |

## formConfig 项的可选值

| 参数      | 说明                       | 类型                      | 默认值    |
| --------- | -------------------------- | ------------------------- | --------- |
| component | 组件类型                   | antd 的表单组件, 如 Input | null      |
| formProps | 表单项配置                 | object                    | null      |
| props     | 表单组件 component 的配置  | object                    | null      |
| label     | 表单项名称                 | string                    | ''        |
| name      | 表单项的 id 值，具有唯一性 | string                    | ''        |
| group     | 表单项归属的分组名         | string                    | 'default' |

## groupConfig 项的可选值

| 参数   | 说明   | 类型   | 默认值    |
| ------ | ------ | ------ | --------- |
| name   | 组名   | string | 'default' |
| col    | 列数   | number | 1         |
| title  | 组标题 | string | ''        |
| gutter | 列间隔 | number | 16        |

更多 api 请访问[ScForm](https://ant.design/components/form-cn/)。
