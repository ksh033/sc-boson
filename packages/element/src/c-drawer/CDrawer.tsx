import * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { ButtonProps, DrawerProps } from 'antd';
import { Drawer } from 'antd';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import classNames from 'classnames';
import ModalPageTpl from '../c-modal/ModalPageTpl';
import ActionButton from '../c-modal/ActionButton';
import type { ButtonType } from 'antd/es/button';

export const destroyFns: any[] = [];

const IS_REACT_16 = !!ReactDOM.createPortal;

type CustButtonType = { text: string; onClick?: () => any; buttonProps?: ButtonProps };
export type CDrawerDialogProps = DrawerProps & {
  okType?: ButtonType;
  pageProps?: any;
  content?: React.ReactElement | React.ComponentType<any>;
  customToolbar?: CustButtonType[];
  close?: (...args: any[]) => void;
  autoFocusButton?: null | 'ok' | 'cancel';
  onOk?: (...args: any[]) => any;
  onCancel?: (...args: any[]) => any;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okCancel?: boolean;
  visible?: boolean;
};

const CDrawerDialog = (props: CDrawerDialogProps) => {
  const {
    close = () => { },
    zIndex,
    visible,
    keyboard,
    getContainer,
    maskStyle,
    closable,
    bodyStyle,
    customToolbar,
    onCancel,
    onOk,
    okButtonProps,
    cancelButtonProps,
    footer,
    extra,
    onClose,
    // iconType = 'question-circle',
  } = props;
  // 支持传入{ icon: null }来隐藏`Modal.confirm`默认的Icon
  // const icon = props.icon === undefined ? iconType : props.icon;
  const okType = props.okType || 'primary';
  const prefixCls = props.prefixCls || 'ant-drawer';
  const contentPrefixCls = `${prefixCls}-custom`;
  const placement = props.placement || 'right';
  // 默认为 true，保持向下兼容
  // eslint-disable-next-line no-constant-condition
  const okCancel = 'okCancel' ? props.okCancel : true;
  const width = props.width || 'auto';
  const style = props.style || {};
  const mask = props.mask === undefined ? true : props.mask;
  // 默认为 false，保持旧版默认行为
  const maskClosable = props.maskClosable === undefined ? true : props.maskClosable;
  const okText = props.okText || (okCancel ? '确定' : '确定');
  const cancelText = props.cancelText || '取消';
  const autoFocusButton = props.autoFocusButton === null ? false : props.autoFocusButton || 'ok';

  const classString = classNames(contentPrefixCls, `${contentPrefixCls}`, props.className);

  const cancelButton = okCancel && (
    <ActionButton
      key="ActionButton-cancel"
      actionFn={onCancel}
      close={close}
      autoFocus={autoFocusButton === 'cancel'}
      buttonProps={cancelButtonProps}
    >
      {cancelText}
    </ActionButton>
  );
  const customButton = [];
  customButton.push(cancelButton);
  customButton.push(
    <ActionButton
      key="button-ok"
      type={okType}
      actionFn={onOk}
      close={close}
      autoFocus={autoFocusButton === 'ok'}
      buttonProps={okButtonProps}
    >
      {okText}
    </ActionButton>,
  );
  if (customToolbar && customToolbar.length > 0) {
    customToolbar.map((item: any, index: number) => {
      const { text, onClick, buttonProps } = item;
      customButton.push(
        <ActionButton
          // eslint-disable-next-line react/no-array-index-key
          key={`ActionButton-${index}`}
          actionFn={onClick}
          close={close}
          buttonProps={buttonProps}
        >
          {text}
        </ActionButton>,
      );
      return item;
    });
  }
  let custFooter = null;
  if (footer === null) {
    custFooter = null;
  } else {
    custFooter = <div className={`${contentPrefixCls}-footer`}>{customButton}</div>;
  }

  // let customFooter=hideFooter

  let dlgContent = null;
  const dlgCprops = { close, pageProps: props.pageProps };
  if (props.content) {
    if (React.isValidElement(props.content)) {
      dlgContent = React.cloneElement<any>(props.content, dlgCprops);
    } else {
      //@ts-ignore
      dlgContent = React.createElement<any>(props.content, dlgCprops);
    }
  }

  return (
    <Drawer
      extra={extra}
      prefixCls={prefixCls}
      className={classString}
      onClose={(e) => {
        onClose?.(e);
        close({ triggerCancel: true });
      }}
      open={visible}
      visible={visible}
      title={props.title}
      footer={custFooter}
      mask={mask}
      closable={closable}
      placement={placement}
      maskClosable={maskClosable}
      maskStyle={maskStyle}
      destroyOnClose={true}
      style={style}
      width={width}
      zIndex={zIndex}
      keyboard={keyboard}
      bodyStyle={bodyStyle}
      getContainer={getContainer}
    >
      <ConfigProvider locale={zhCN}>
        <div className={`${contentPrefixCls}-body-wrapper`}>
          <div className={`${contentPrefixCls}-body`}>
            {customToolbar ? (
              <ModalPageTpl title={props.title} toolbar={customButton}>
                {dlgContent}
              </ModalPageTpl>
            ) : (
              dlgContent
            )}
          </div>
        </div>
      </ConfigProvider>
    </Drawer>
  );
};
let timer: any = null;
export default function CDrawer(config: any) {
  const div = document.createElement('div');
  div.className = 'c-custom-modal';
  document.body.style.cssText = 'overflow:hidden;+overflow:none;_overflow:none;padding:0 17px 0 0;';
  document.body.appendChild(div);
  let currentConfig = { ...config, close, visible: true, getContainer: div };

  function close(...args: any[]) {
    currentConfig = {
      ...currentConfig,
      visible: false,
    };
    if (IS_REACT_16) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      render(currentConfig);
      timer = setTimeout(() => {
        clearTimeout(timer);
        timer = null;
        destroy(...args);
      }, 200);
    } else {
      destroy(...args);
    }
  }

  function update(newConfig: any) {
    currentConfig = {
      ...currentConfig,
      ...newConfig,
    };
    render(currentConfig);
  }

  function destroy(...args: any[]) {
    document.body.style.cssText = ' ';
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
    const triggerCancel = args.some((param) => param && param.triggerCancel);
    if (config.onCancel && triggerCancel) {
      config.onCancel(...args);
    }
    for (let i = 0; i < destroyFns.length; i = +1) {
      const fn = destroyFns[i];
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }
  }

  function render(props: any) {
    ReactDOM.render(<CDrawerDialog {...props} />, div);
  }

  render(currentConfig);

  destroyFns.push(close);

  return {
    destroy: close,
    update,
  };
}
