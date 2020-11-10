import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';

export default class ViewItem extends PureComponent<any> {
  render() {
    const {
      label,
      name,
      labelCol,
      wrapperCol,
      initialValue,
      initData,
      render,
    } = this.props;
    return (
      <div className="sc-viem-item-item">
        <Row>
          <Col {...labelCol}>
            <div className="sc-viem-item-label">{label}：</div>
          </Col>
          <Col {...wrapperCol}>
            {this.props.children
              ? this.props.children
              : render
              ? render(initialValue, initData)
              : typeof initialValue === 'object'
              ? initialValue[name] || ''
              : initialValue}
          </Col>
        </Row>
      </div>
    );
  }
}
