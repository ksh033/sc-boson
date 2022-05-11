import React, { PureComponent } from 'react';

export default class ViewItem extends PureComponent<any> {
  render() {
    const { initialValue, value, render } = this.props;
    return (
      <div>
        {this.props.children ? this.props.children : render ? render(value, initialValue) : value}
      </div>
    );
  }
}
