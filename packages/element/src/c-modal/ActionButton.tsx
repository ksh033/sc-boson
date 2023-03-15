/* eslint-disable react/no-find-dom-node */
import * as React from 'react';
import useState from 'rc-util/lib/hooks/useState';
import type { ButtonProps } from 'antd';
import { Button } from 'antd';
import type { LegacyButtonType } from 'antd/es/button/button';
import { convertLegacyProps } from 'antd/es/button/button';

export interface ActionButtonProps {
  type?: LegacyButtonType;
  actionFn?: (...args: any[]) => any | PromiseLike<any>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  close?: Function;
  autoFocus?: boolean;
  prefixCls?: string;
  buttonProps?: ButtonProps;
  emitEvent?: boolean;
  quitOnNullishReturnValue?: boolean;
  children?: React.ReactNode;
}

function isThenable(thing?: PromiseLike<any>): boolean {
  return !!(thing && !!thing.then);
}

const ActionButton: React.FC<ActionButtonProps> = props => {
  const clickedRef = React.useRef<boolean>(false);
  const ref = React.useRef<any>();
  const [loading, setLoading] = useState<ButtonProps['loading']>(false);
  const { close } = props;
  const onInternalClose = (...args: any[]) => {
    close?.(...args);
  };

  React.useEffect(() => {
    let timeoutId: any;
    if (props.autoFocus) {
      const $this = ref.current as HTMLInputElement;
      timeoutId = setTimeout(() => $this.focus());
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handlePromiseOnOk = (returnValueOfOnOk?: PromiseLike<any>) => {
    if (!isThenable(returnValueOfOnOk)) {
      return;
    }
    setLoading(true);
    returnValueOfOnOk!.then(
      (...args: any[]) => {
        setLoading(false, true);
        onInternalClose(...args);
        const timeoutId = setTimeout(() => {
          clickedRef.current = false;
          clearTimeout(timeoutId);
        }, 500)

      },
      (e: Error) => {
        // Emit error when catch promise reject
        // eslint-disable-next-line no-console
        console.error(e);
        // See: https://github.com/ant-design/ant-design/issues/6183
        setLoading(false, true);
        const timeoutId = setTimeout(() => {
          clickedRef.current = false;
          clearTimeout(timeoutId);
        }, 500)
      },
    );
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { actionFn } = props;
    if (clickedRef.current) {
      return;
    }
    clickedRef.current = true;
    if (!actionFn) {
      onInternalClose();
      return;
    }
    let returnValueOfOnOk;
    if (props.emitEvent) {
      returnValueOfOnOk = actionFn(e);
      if (props.quitOnNullishReturnValue && !isThenable(returnValueOfOnOk)) {
        clickedRef.current = false;
        onInternalClose(e);
        return;
      }
    } else if (actionFn.length) {
      returnValueOfOnOk = actionFn(close);
      // https://github.com/ant-design/ant-design/issues/23358
      clickedRef.current = false;
    } else {
      returnValueOfOnOk = actionFn();
      if (!returnValueOfOnOk) {
        onInternalClose();
        clickedRef.current = false;
        return;
      }
    }
    handlePromiseOnOk(returnValueOfOnOk);
  };

  const { type, children, prefixCls, buttonProps } = props;
  return (
    <Button
      {...convertLegacyProps(type)}
      onClick={onClick}
      loading={loading}
      prefixCls={prefixCls}
      {...buttonProps}
      ref={ref}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
