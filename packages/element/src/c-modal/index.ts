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

    return Modal.confirm({
      ...newProps,
      onOk: onOk,
    });
  },
};
