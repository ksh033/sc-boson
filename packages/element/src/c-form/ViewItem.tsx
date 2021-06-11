import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';

export default class ViewItem extends PureComponent<any> {
  render() {
    const {
      label,
      labelCol,
      wrapperCol,
      initialValue,
      value,
      fieldProps,
      render,
    } = this.props;

    const {colon=true}=fieldProps
    return (
      <Row className="ant-form-item sc-viem-item-item">
        <Col {...labelCol}>
          <div className="sc-viem-item-label">{label}{colon?':':''} </div>
        </Col>
        <Col {...wrapperCol}>
          {this.props.children
            ? this.props.children
            : render
            ? render(value, initialValue)
            : value}
        </Col>
      </Row>
    );
  }
}
