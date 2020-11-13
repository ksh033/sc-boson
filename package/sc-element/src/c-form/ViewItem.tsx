import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';

function deepGet(obj: Object, keys: any, defaultVal?: any): any {
  return (
    (!Array.isArray(keys)
      ? keys
          .replace(/\[/g, '.')
          .replace(/\]/g, '')
          .split('.')
      : keys
    ).reduce((o: any, k: any) => (o || {})[k], obj) || defaultVal
  );
}

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

    const newName = Array.isArray(name) ? name.join('.') : name;
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
              ? deepGet(initialValue, newName) || ''
              : initialValue}
          </Col>
        </Row>
      </div>
    );
  }
}
