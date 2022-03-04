/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import classNames from 'classnames';
export default class ViewItem extends PureComponent<any> {
  render() {
    const {
      label,
      labelCol = {},
      wrapperCol = {},
      initialValue,
      value,
      fieldProps,
      render,
      layout,
    } = this.props;

    const { colon = true } = fieldProps;

    const labelClassName = classNames('ant-form-item-label', labelCol.className);
    const wrapperClassName = classNames('ant-form-item-control', wrapperCol.className);
    return (
      <Row className="ant-form-item sc-viem-item">
        {label ? (
          <Col {...labelCol} className={labelClassName}>
            <div className="sc-viem-item-label">
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
