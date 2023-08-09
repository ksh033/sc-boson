// import React, { PureComponent } from 'react';

// export default class ViewItem extends PureComponent<any> {
//   render() {
//     const { initialValue, value, render } = this.props;
//     return (
//       <div>
//         {this.props.children ? this.props.children : render ? render(value, initialValue) : value}
//       </div>
//     );
//   }
// }
import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import classNames from 'classnames';
import FormItem from 'antd/es/form/FormItem';
import type { FormInstance } from 'antd/es/form';
import type { FormItemProp, SchemaValueEnumMap, SchemaValueEnumObj } from './interface';

const View: React.FC<any> = (props) => {
  const allValus = props.form.getFieldValue();
  return (
    <div>
      {props.children
        ? props.children
        : props.render
          ? props.render(props.value, allValus)
          : props.value}
    </div>
  );
};
// render={render}
// readonlyFormItem={isViewFormItem}
// name={viewName}
// fieldProps={itemProps}
// value={itValue}
// layout={layout}
// valueEnum={valueEnum}
// initialValue={initialValues}
// form={form}

export type ViewItemPros = Omit<FormItemProp, 'valueEnum'> & {
  form?: FormInstance,
  value: any,
  valueEnum: SchemaValueEnumMap | SchemaValueEnumObj
}
export default class ViewItem extends PureComponent<ViewItemPros> {
  render() {
    const {
      label,

      initialValue,
      value,
      fieldProps = {},
      readonlyFormItem = false,
      render,
      valueEnum,
      layout,
      name,
      form,
    } = this.props;

    const { colon = true, labelCol, wrapperCol } = fieldProps;

    const labelClassName = classNames('ant-form-item-label', labelCol.className);
    const wrapperClassName = classNames('ant-form-item-control', wrapperCol.className);


    const toValue = (v: any) => {
      if (valueEnum) {
        const key = v + ""
        //@ts-ignore
        const item = valueEnum[key]
        if (item) {
          return item.text
        }

      }

      return value

    }
    if (readonlyFormItem) {
      const { rules, required, ...viewItemProps } = fieldProps;
      delete viewItemProps.render;
      return (
        <FormItem
          key={`form-item-${name}`}
          name={name}
          {...viewItemProps}
          className="sc-viem-form-item"
        >
          <View render={render} form={form}>
            {this.props.children}
          </View>
        </FormItem>
      );
    }

    return (
      <Row
        className={classNames({
          'ant-form-item': true,
          'sc-viem-item': layout === 'vertical',
        })}
      >
        {label ? (
          <Col {...labelCol} className={labelClassName}>
            <div
              className={[
                'sc-viem-item-label',
                layout === 'vertical' ? '' : 'sc-view-item-label-text',
              ].join(' ')}
            >
              {label}
              {layout === 'vertical' ? '' : colon ? ':' : ''}
            </div>
          </Col>
        ) : null}

        <Col {...wrapperCol} className={wrapperClassName}>
          {this.props.children ? this.props.children : render ? render(value, initialValue) : toValue(value)}
        </Col>
      </Row>
    );
  }
}
