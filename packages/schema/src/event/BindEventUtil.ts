/* eslint-disable func-names */
/* eslint-disable react-hooks/rules-of-hooks */
import type { ButtonTypeProps, PageConfig } from '../interface';
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
  isTable?: boolean,
): BaseResult<R, P> | null {
  if (service && service[serviveName]) {
    if (isTable) {
      return service[serviveName];
    }
    return useRequest(service[serviveName], { manual: true, throwOnError: true });
  }
  return null;
}

const bindEvent = (
  btn: HButtonType & { request?: any },
  config: PageConfig,
  defaultCallback?: (values: any) => void,
  isTable?: boolean,
): HButtonType => {
  if (React.isValidElement(btn)) {
    return btn;
  }

  const newBtn = { ...btn };
  if (newBtn.buttonType) {
    const serverName = newBtn.serverName || newBtn.buttonType;
    const remote = formatUseReq(serverName, config.service, isTable);
    let options: any = {};
    if (remote) {
      newBtn.loading = remote?.loading;
      options = {
        service: remote.run || remote,
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
  isTable?: boolean,
): HButtonType[] => {
  return toolbar.map((item: any) => {
    const newItem = bindEvent(item, config, callback, isTable);
    return newItem;
  });
};

const operationButtonsBindEvent = (
  btn: ButtonTypeProps & { request?: any },
  config: PageConfig,
  defaultCallback?: (values: any) => void,
): ButtonTypeProps => {
  const newBtn = { ...btn };
  if (newBtn.buttonType) {
    const serverName = newBtn.serverName || newBtn.buttonType;
    const service =
      config.service && config.service[serverName] ? config.service[serverName] : null;
    let options: any = {};
    if (service) {
      options = {
        service: service,
      };
    }
    if (newBtn.options) {
      options = {
        ...newBtn.options,
        ...options,
      };
    }
    if (!options.content && !options.url && config.path && newBtn.action) {
      const path =
        config.path.lastIndexOf('/') === config.path.length - 1 ? config.path : `${config.path}/`;
      options.url = path + newBtn.action;
    }
    newBtn.options = options;
    newBtn.callBack = btn.callBack ? btn.callBack : defaultCallback;
  }
  delete newBtn.serverName;
  return newBtn;
};

export { BaseResult, bindEvent, bindEvents, formatUseReq, operationButtonsBindEvent };
