import * as React from 'react';
import * as ReactDOM from 'react-dom';
import type { ButtonProps, ModalFuncProps } from 'antd';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import classNames from 'classnames';
import ScModal from '../sc-modal';

import type { ScModalProps } from '../sc-modal';

import ModalPageTpl from './ModalPageTpl';
import ActionButton from './ActionButton';
import { ContainerContext } from '../sc-context';

export const destroyFns: any[] = [];

const IS_REACT_16 = !!ReactDOM.createPortal;

type CustButtonType = { text: string; onClick?: () => any; buttonProps?: ButtonProps };
export type CModalDialogProps = Omit<ModalFuncProps, 'content' | 'close'> &
  Omit<ScModalProps, 'children' | 'content' | 'close'> & {
    afterClose?: () => void;
    close?: (...args: any[]) => void;
    autoFocusButton?: null | 'ok' | 'cancel';
    rootPrefixCls?: string;
    customToolbar?: CustButtonType[];
    pageProps?: any;
    content?: React.ReactElement | React.ComponentType<any>;
  };

const CModalDialog = (props: CModalDialogProps) => {
  const {
    onCancel,
    onOk,
    close = () => {},
    fullscreen,
    showFullscreen,
    zIndex,
    showHeader,
    customToolbar,
    afterClose,
    visible,
    keyboard,
    centered = true,
    getContainer,
    maskStyle,
    okButtonProps,
    cancelButtonProps,
    closable,
    footer,
    onToggleFullscreen,
    bodyStyle,
    // iconType = 'question-circle',
  } = props;

  // 支持传入{ icon: null }来隐藏`Modal.confirm`默认的Icon
  // const icon = props.icon === undefined ? iconType : props.icon;
  const okType = props.okType || 'primary';
  const prefixCls = props.prefixCls || 'ant-modal';
  const contentPrefixCls = `${prefixCls}-custom`;
  // 默认为 true，保持向下兼容
  // eslint-disable-next-line no-constant-condition
  const okCancel = 'okCancel' ? props.okCancel : true;
  const width = props.width || 'auto';
  const style = props.style || {};
  const mask = props.mask === undefined ? true : props.mask;
  // 默认为 false，保持旧版默认行为
  const maskClosable = props.maskClosable === undefined ? false : props.maskClosable;
  const okText = props.okText || (okCancel ? '确定' : '确定');
  const cancelText = props.cancelText || '取消';
  const autoFocusButton = props.autoFocusButton === null ? false : props.autoFocusButton || 'ok';
  const transitionName = props.transitionName || 'ant-zoom';
  const maskTransitionName = props.maskTransitionName || 'ant-fade';
  const modalDomRef=React.useRef<HTMLDivElement>(null);
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
    custFooter = !fullscreen ? <div>{customButton}</div> : null;
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
    <ScModal
      prefixCls={prefixCls}
      className={classString}
      wrapClassName={classNames({
        [`${contentPrefixCls}-centered`]: !!props.centered,
      })}
      onCancel={() => {
        return close && close({ triggerCancel: true });
      }}
      open={visible}
      //visible={visible}
      title={props.title}
      onToggleFullscreen={onToggleFullscreen}
      transitionName={transitionName}
      footer={custFooter}
      showHeader={showHeader}
      maskTransitionName={maskTransitionName}
      mask={mask}
      closable={closable}
      maskClosable={maskClosable}
      maskStyle={maskStyle}
      style={style}
      fullscreen={fullscreen}
      showFullscreen={showFullscreen}
      width={width}
      zIndex={zIndex}
      afterClose={afterClose}
      keyboard={keyboard}
      centered={centered}
      bodyStyle={bodyStyle}
      getContainer={getContainer}
    >
      <ConfigProvider locale={zhCN}>
      <ContainerContext.Provider value={{type:'dialog',domRef:modalDomRef}}>
     
        <div className={`${contentPrefixCls}-body-wrapper`}>
          <div className={`${contentPrefixCls}-body`} ref={modalDomRef}>
            {fullscreen && customToolbar ? (
              <ModalPageTpl title={props.title} toolbar={customButton}>
                {dlgContent}
              </ModalPageTpl>
            ) : (
              dlgContent
            )}
          </div>
        </div>
        </ContainerContext.Provider>
      </ConfigProvider>
    </ScModal>
  );
};
export default function CModal(config: any) {
  const div = document.createElement('div');
  div.className = 'c-custom-modal';
 // document.body.style.cssText = 'overflow:hidden;+overflow:none;_overflow:none;padding:0 17px 0 0;';
  document.body.appendChild(div);
  let currentConfig = { ...config, close, onToggleFullscreen, visible: true, getContainer: div };

  function close(...args: any[]) {
    currentConfig = {
      ...currentConfig,
      visible: false,
      afterClose: () => {
        destroy(...args);
      },
    };
    if (IS_REACT_16) {
      render(currentConfig);
    } else {
      destroy(...args);
    }
  }

  function onToggleFullscreen(fullscreen: any) {
    currentConfig = {
      ...currentConfig,
      fullscreen: !fullscreen,
    };
    render(currentConfig);
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
    // const app = getDvaApp();
    ReactDOM.render(<CModalDialog {...props} />, div);
  }

  render(currentConfig);

  destroyFns.push(close);

  return {
    destroy: close,
    update,
  };
}
