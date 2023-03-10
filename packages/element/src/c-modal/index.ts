import React from 'react';
import CModal from './CModal';
import type { CModalDialogProps } from './CModal';
import type { ModalFuncProps } from 'antd';
import confirm, {
  withConfirm,
  withError,
  withInfo,
  withSuccess,
  withWarn,
} from './confirm';

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
  confirm: (props: ModalFuncProps) => {
    return confirm(withConfirm(props));
  },
  info: function infoFn(props: ModalFuncProps) {
    return confirm(withInfo(props));
  },

  success: function successFn(props: ModalFuncProps) {
    return confirm(withSuccess(props));
  },
  warn: function (props: ModalFuncProps) {
    return confirm(withWarn(props));
  },
  error: function errorFn(props: ModalFuncProps) {
    return confirm(withError(props));
  },

};
