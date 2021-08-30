/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable prefer-const */
/* eslint-disable no-multi-assign */
import defConfig from 'config/default-config';
import utils from 'utils/index';
import socket from 'socket/socket';

import type { PluginFunConfig, PluginConfig, PluginInvokeOptions } from '../boss-soft-plugin';

/** 博思插件基类 */
export default class BasePluginvoke {
  [index: string]: any;

  protected config: any = {
    appId: 'bosssoft',
  };

  protected initStateDefer: Promise<true>;

  constructor(config: PluginConfig, module: string, functions: (string | PluginFunConfig)[]) {
    Object.assign(this.config, config, defConfig);
    if (typeof module === 'undefined') {
      throw new Error('请设置module属性!');
    }
    this.module = module;
    // 方法初始化functions
    this.initMethods(functions, 'func');
    // 过程初始化processes
    // this.initMethods(processes, 'proc');
    // 控件初始化
    this.initStateDefer = this.init();
    // 初始化成功后调用客户端升级
    if (!defConfig.initUpdate) {
      return;
    }
    this.initStateDefer.then(() => {
      BasePluginvoke.clientUpdate();
    });
  }

  /**
   * 调用客户端公用方法
   *
   * @param op
   */
  public operate(ops: PluginInvokeOptions): Promise<any> {
    const { func, data = [] } = ops;
    const form = {
      id: utils.uuid(),
      func,
      payload: utils.base64(
        JSON.stringify({
          config: this.config,
          data,
        }),
      ),
    };
    const operate = socket.send({ url: this.config.url + this.module, form });
    return Promise.all([operate, BasePluginvoke.heartbeat()]).then(() => operate);
  }

  /**
   * 初始化调用方法
   *
   * @param fns
   * @param type
   */
  private initMethods(fns: (string | PluginFunConfig)[], type: string): void {
    if (!Array.isArray(fns)) {
      return;
    }
    fns.forEach((item: string | PluginFunConfig) => {
      let jsName: string = '';
      let dllName: string;
      let invokeOP: PluginInvokeOptions;
      let initRequired: boolean = true;
      if (typeof item === 'string') {
        jsName = dllName = item;
      } else {
        jsName = item.jsName;
        dllName = item.dllName;
        initRequired = item.initRequired;
      }
      invokeOP = {
        data: {},
        func: dllName,
      };
      this[jsName] = (...args: any[]): Promise<any> => {
        invokeOP.data = args;
        if (!initRequired) {
          return this.operate(invokeOP);
        }
        return this.initStateDefer
          .then(() => {
            return this.operate(invokeOP);
          })
          .catch((e: any) => {
            if (e.code === 'timeout') {
              return this.init().then(() => {
                return this.operate(invokeOP);
              });
            }
          });
      };
    });
  }

  /** 控件初始化 */
  protected init(): Promise<any> {
    return Promise.resolve(true);
  }

  /**
   * 启动客户端
   *
   * @param type
   */
  public static startClient(type: 'url' | 'jsonp' = 'url'): Promise<any> {
    if (type === 'url') {
      console.log($.get);
      $.get(defConfig.startUrl);
      // let btn = utils.appendHtml(`
      //     <a href="${defConfig.startUrl}}" style="position:absolute; top:-9999px; left:-9999px" />
      // `)
      // btn.click();
      // btn.remove();
      return Promise.resolve(true);
    }
    return socket.jsonp({
      jsonp: `start_${utils.uuid()}`,
      url: `${defConfig.guardUrl}?ct=2`,
    });
  }

  /** 获取注册表启动url */
  public static getStartUrl(): string {
    return defConfig.startUrl;
  }

  /**
   * 心跳
   *
   * @param timeout
   */
  public static heartbeat(timeout: number = defConfig.timeout): Promise<any> {
    return socket
      .jsonp({
        jsonp: `heartbeat_${utils.uuid()}`,
        url: defConfig.url + defConfig.heartbeat,
      })
      .catch((e) => {
        defConfig.unstart();
        return Promise.reject(e);
      });
  }

  /**
   * 客户端升级请求
   *
   * @param url
   * @param timeout
   */
  public static clientUpdate(
    url: string = defConfig.updateUrl,
    timeout: number = defConfig.timeout,
  ): Promise<any> {
    return socket.jsonp({
      jsonp: `upate_${utils.uuid()}`,
      url: defConfig.url + defConfig.update,
      data: {
        url: defConfig.updateUrl,
      },
    });
  }

  /**
   * @param key
   * @param value
   */
  public static setDefaultConfig(key: string, value: any) {
    defConfig[key] = value;
    return BasePluginvoke;
  }

  public static getDefaultConfig(key: string) {
    return defConfig[key];
  }
}
