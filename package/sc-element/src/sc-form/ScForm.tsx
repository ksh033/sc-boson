import * as React from 'react'
import { Col, Row, Form, Divider } from 'antd'
import { useCallback, useMemo } from 'react'
const FormItem = Form.Item

export interface ScFormProps {
  formConfig?: any
  groupConfig?: any
  form?:any
}
export interface ScFormState {
  data?: any
}
export interface FormItem {
  label?: any
  formProps?: any
  props?: any
  name: never
  component?: any
  group?: string
}

const ScForm: React.ForwardRefRenderFunction<unknown, ScFormProps> = (
  _props,
  ref
) => {
  const { formConfig = {}, groupConfig = {}, form } = _props

  const initialValues = useMemo(() => {
    let valuse: any = {}
    formConfig.map((item: FormItem) => {
      const {
        formProps: { initialValue },
        name
      } = item
      if (initialValue) {
        valuse[name] = initialValue
      }
    })
    return valuse
  }, [formConfig])

  const [wrapForm] = Form.useForm()
  React.useImperativeHandle(form, () => wrapForm)
  React.useImperativeHandle(ref, () => wrapForm)

  const createFormItem = useCallback((item: FormItem) => {
    const { label, formProps, props, name, component } = item
    const { initialValue, ...fromItemProps } = formProps
    return (
      <FormItem key={name} label={label} {...fromItemProps} name={name}>
        {React.createElement(component, { ...props })}
      </FormItem>
    )
  }, [])

  //将表单条目分组
  const createGroup = useCallback((_formConfig: any): any => {
    let formGroups: any = {}
    _formConfig.map((item: FormItem) => {
      const { group } = item
      if (group) {
        if (!formGroups[group]) {
          formGroups[group] = []
        }
        formGroups[group].push(item)
      } else {
        if (!formGroups['default']) {
          formGroups['default'] = []
        }
        formGroups['default'].push(item)
      }
    })
    return formGroups
  }, [])

  //创建表单
  function createForm(_formGroups: any, _groupConfig: any): any {
    let forms: any = []
    _groupConfig =
      _groupConfig && _groupConfig.length
        ? _groupConfig
        : [
            {
              name: 'default',
              col: '1'
            }
          ]

    _groupConfig.map((item: any) => {
      const { col, name, title, gutter } = item
      forms.push(
        <div key={name} className={'sc-form-group'}>
          {title ? <Divider orientation="left">{title}</Divider> : null}
          <Row gutter={gutter ? gutter : 16}>
            {_formGroups[name].map((item: any) => {
              return (
                <Col key={item.name} span={24 / col}>
                  {createFormItem(item)}
                </Col>
              )
            })}
          </Row>
        </div>
      )
    })
    return forms
  }

  return (
    <div>
      <Form form={wrapForm} initialValues={initialValues}>
        {createForm(createGroup(formConfig), groupConfig)}
      </Form>
    </div>
  )
}

export default React.forwardRef(ScForm)
