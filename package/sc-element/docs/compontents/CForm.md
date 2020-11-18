---
title: CForm 自定义表单
order: 2
nav:
  title: 组件
---

## CForm 自定义表单

## 代码演示

``` jsx
/**
 * title: 基础
 * desc: 基础表单
 */
import React, {useRef} from 'react'
import { Button, Input, message } from 'antd'
import { CForm,ScSelect } from 'sc-element';

export default () => {
  let formConfig= [
    {
      col: 1,
      group: 'basic',
      groupTitle: '基本信息',
      items: [
        {
          label: '机构id',
          name: 'deptId',
          component: Input,

        },
        {
          label: '上级机构',
          name: 'userFullName',
          component: Input,

        },
        {
          label: '机构名称',
          name: 'deptName',
          component: Input,
         
          formItemProps: {
            required: true,
            rules: [
              {
                required: true,
              },
            ],
          },
          props: {
            placeholder: '组织机构名称不能超过20个字符',
          },
        },

  ]},
  {
      col: 1,
      group: 'base2',
      groupTitle: '角色信息',
      items: [
        {
          label: '角色信息ID',
          name: 'sysRoleId',
          component: Input,
          hidden: true,
        },
        {
          label: '角色所属系统',
          name: 'systemCode',
          component: ScSelect,
          // formItemProps: {
          //   required: true,
          //   rules: [
          //     {
          //       required: true,
          //     },
          //   ],
          // },
          props: {
            remoteSearch: true,
            notFoundContent: null,
            showSearch: true,
            filterOption: false,
            labelInValue: true,
            request: 'systemList',
            searchField: 'systemName',
            textField: 'systemName',
            valueField: 'systemCode',
            placeholder: '选择角色所属系统',
          },
        },
        {
          label: '角色名称',
          name: 'roleName',
          component: Input,
          formItemProps: {
            required: true,
            rules: [
              {
                required: true,
              },
            ],
          },
          props: { placeholder: '请输入角色名称' },
        },
        {
          label: '角色描述',
          name: 'roleDesc3',
          component: Input,
           formItemProps: {
            required: true,
            rules: [
              {
                required: true,
              },
            ],
          },
          props: { placeholder: '最多输入50个汉字' },
        },
        ,
        {
          label: '角色描述',
          name: 'roleDesc4',
          component: Input,
          props: { placeholder: '最多输入50个汉字' },
        },
        ,
        {
          label: '角色描述',
          name: 'roleDesc6',
          component: Input,
          props: { placeholder: '最多输入50个汉字' },
        },
        ,
        {
          label: '角色描述',
          name: 'roleDesc7',
          component: Input,
          props: { placeholder: '最多输入50个汉字' },
        },
        ,
        {
          label: '角色描述',
          name: 'roleDesc8',
          component: Input,
          props: { placeholder: '最多输入50个汉字' },
        },
      ],
    }
  ]

  const formItemLayout = {
    labelCol: {
        span: 4
    },
    wrapperCol: {
        span: 20
    }
  }

  formConfig = formConfig.map((item) => {
    item.formProps = {...item.formProps, ...formItemLayout}
    return item;
  })

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
      col: 2
    }
  ]
  const form = useRef();
  return (
    <div style={{position: "relative",height:'100%'}}>
      <CForm anchor
        formConfig={formConfig}
  
        form={form}
      />
      <div style={{ textAlign: 'right' }}>
        <Button
          type={'primary'}
          onClick={async ()=>{
            const values = await form.current.validateFields();
            console.log(values);
            message.success("提交成功")
          }}
        >
          提交
        </Button>
      </div>
    </div>
  )
}
```
## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| formConfig | 需要展示的表单子项配置 | array | [] |
| layout | 表单布局 | 'horizontal'，'vertical'，'inline' | 'horizontal' |
| labelCol | label 标签布局，同 Col 组件，设置 span offset 值，如 {span: 3, offset: 12} 或 sm: {span: 3, offset: 12} | object | {span:12} |
| wrapperCol | 需要为输入控件设置布局样式时，使用该属性，用法同 labelCol | object | {span:12} |
| labelAlign | 	label 标签的文本对齐方式 | 'left' ，'right' | 'right' |

其他属性参照 [Form](https://ant.design/components/form-cn/#Form)
