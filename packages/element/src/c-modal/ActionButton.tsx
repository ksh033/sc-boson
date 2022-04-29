/* eslint-disable react/no-find-dom-node */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button } from 'antd';
import type { PropsWithChildren } from 'react';
interface ActionButtonState {
  loading: boolean;
}
interface ActionButtonProps {
  autoFocus?: boolean;
  actionFn?: (params?: any) => any;
  closeModal: (params?: any) => void;
  type?: string;
  buttonProps?: any;
}

export default class ActionButton extends React.Component<
  PropsWithChildren<ActionButtonProps>,
  ActionButtonState
> {
  timeoutId: any;

  constructor(props: any) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      const $this: any = ReactDOM.findDOMNode(this);
      this.timeoutId = setTimeout(() => $this.focus());
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  onClick = () => {
    const { actionFn, closeModal } = this.props;
    if (actionFn) {
      let ret;
      if (actionFn.length) {
        ret = actionFn(closeModal);
      } else {
        ret = actionFn();
        if (!ret) {
          closeModal();
        }
      }
      if (ret && ret.then) {
        this.setState({ loading: true });
        ret.then(
          (...args: any[]) => {
            // It's unnecessary to set loading=false, for the Modal will be unmounted after close.
            // this.setState({ loading: false });
            closeModal(...args);
          },
          () => {
            // Emit error when catch promise reject
            // console.error(e);
            // See: https://github.com/ant-design/ant-design/issues/6183
            this.setState({ loading: false });
          },
        );
      }
    } else {
      closeModal();
    }
  };

  render() {
    const { type, children, buttonProps } = this.props;
    const { loading } = this.state;
    return (
      <Button type={type} onClick={this.onClick} loading={loading} {...buttonProps}>
        {children}
      </Button>
    );
  }
}
