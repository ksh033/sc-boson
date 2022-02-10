/* eslint-disable func-names */
/* eslint-disable react-hooks/rules-of-hooks */
import type { PageConfig } from '../interface';
import { useRequest } from 'ahooks';
import { BaseResult } from '@ahooksjs/use-request/es/types';
import defaultEvents from './DefaultEvents';
import type { HButtonType } from '../interface';
import React from 'react';

// interface useFormatEventProps {
//   bindEvent: <T extends ButtonTypeProps>(button: T) => T;
//   bindEvents: <T extends ButtonTypeProps>(buttons: T[]) => T[];
//   formatUseReq: <R = any, P extends any[] = any>(serviveName: string) => BaseResult<R, P> | null;
// }

function formatUseReq<R = any, P extends any[] = any>(
  serviveName: string,
  service?: any,
): BaseResult<R, P> | null {
  if (service && service[serviveName]) {
    return useRequest(service[serviveName], { manual: true });
  }
  return null;
}

const bindEvent = (
  btn: HButtonType,
  config: PageConfig,
  defaultCallback?: (values: any) => void,
): HButtonType => {
  if (React.isValidElement(btn)) {
    return btn;
  }

  const newBtn = { ...btn };
  if (newBtn.buttonType) {
    const serverName = newBtn.serverName || newBtn.buttonType;
    const remote = formatUseReq(serverName, config.service);
    let options: any = {};
    if (remote) {
      newBtn.loading = remote?.loading;
      options = {
        service: remote.run,
      };
    }
    if (newBtn.options) {
      options = {
        ...newBtn.options,
        ...options,
      };
    }
    if (!options.content) {
      if (!options.url) {
        if (config.path) {
          if (newBtn.action) {
            const path =
              config.path.lastIndexOf('/') === config.path.length - 1
                ? config.path
                : `${config.path}/`;
            options.url = path + newBtn.action;
          }
        }
      }
    }
    if (!newBtn.onClick && defaultEvents[newBtn.buttonType]) {
      const itemEvent = defaultEvents[newBtn.buttonType];
      let callBack: ((values: any) => void) | null = null;
      let preHandle: ((values: any) => boolean) | null = null;
      // 默认的回调方法
      if (defaultCallback) {
        callBack = defaultCallback;
      }

      if (newBtn.callBack) {
        callBack = newBtn.callBack;
      } else if (options.callBack) {
        callBack = options.callBack;
      }
      if (newBtn.preHandle) {
        preHandle = newBtn.preHandle;
      } else if (options.preHandle) {
        preHandle = options.preHandle;
      }

      newBtn.onClick = (...arg) => {
        const event: any = arg.length > 0 ? arg[arg.length - 1] : null;
        // 彈出框处理
        if (options.content) {
          if (options.pageProps && !options.pageProps.callBack) {
            options.pageProps.callBack = callBack;
          }
        }
        itemEvent(
          {
            ...newBtn,
            options,
            callBack,
            preHandle,
          },
          event,
        );
      };
    }
  }
  delete newBtn.buttonType;
  delete newBtn.preHandle;
  delete newBtn.callBack;
  delete newBtn.serverName;
  return newBtn;
};

const bindEvents = (
  toolbar: HButtonType[],
  config: PageConfig,
  callback?: (values: any) => void,
): HButtonType[] => {
  return toolbar.map((item: any) => {
    const newItem = bindEvent(item, config, callback);
    return newItem;
  });
};

export { BaseResult, bindEvent, bindEvents, formatUseReq };
