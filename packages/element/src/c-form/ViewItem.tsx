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

export default class ViewItem extends PureComponent<any> {
  render() {
    const {
      label,
      labelCol = {},
      wrapperCol = {},
      initialValue,
      value,
      fieldProps,
      readonlyFormItem = false,
      render,
      layout,
      name,
      form,
    } = this.props;

    const { colon = true } = fieldProps;

    const labelClassName = classNames('ant-form-item-label', labelCol.className);
    const wrapperClassName = classNames('ant-form-item-control', wrapperCol.className);

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
          {this.props.children ? this.props.children : render ? render(value, initialValue) : value}
        </Col>
      </Row>
    );
  }
}
