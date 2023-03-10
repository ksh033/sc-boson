/*
 * @Description: 
 * @Version: 1.0
 * @Autor: yangyuhang
 * @Date: 2023-02-22 10:43:42
 * @LastEditors: yangyuhang
 * @LastEditTime: 2023-03-10 11:44:50
 */
import React from 'react';
import CModal from './CModal';
import type { CModalDialogProps } from './CModal';
import { Modal } from 'antd';
import debounce from 'lodash/debounce';
export { CModalDialogProps };
export default {
  show: (props: CModalDialogProps) => {
    const config = {
      okCancel: true,
      ...props,
    };
    return CModal(config);
  },
  showFull: (props: CModalDialogProps & { component?: any }) => {
    const { component, pageProps, ...restPops } = props;
    if (component) {
      restPops.content = React.createElement(component, pageProps);
      // console.log(restPops.content)
    }
    const config = {
      okCancel: false,
      visible: true,
      showHeader: false,
      closable: true,
      fullscreen: true,
      showFullscreen: true,
      pageProps,
      ...restPops,
    };

    return CModal(config);
  },
  confirm: (props: Omit<CModalDialogProps, 'content'> & { content?: React.ReactNode }) => {
    const { onOk, ...newProps } = props;
    const newonOk = props.onOk ? debounce(props.onOk, 200) : undefined;
    return Modal.confirm({
      ...newProps,
      onOk: newonOk,
    });
  },
};
