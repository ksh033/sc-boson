export interface PluginConfig {
  appId: string;

  /** 浏览器cookies，下载模板请求时用到 */
  cookie?: string;

  /** 控件下载地址 */
  downloadUrl?: string;

  /** 前端控件实例初始化时更新，如果客户端未启动，会在启动成功后再发一次更新请求 */
  initUpdate?: boolean;

  /** 客户端更新地址。主动发起更新可以调用plugin.clientUpdate()方法 */
  updateUrl?: string;
}

export interface PrintConfig extends PluginConfig {
  hostUrl: string;
  downLoadUrl: string;
  queryTempListUrl: string;
  queryTempNameUrl: string;
}

export interface PluginFunConfig {
  /** Js方法名 */
  jsName: string;

  /** Dll方法名 */
  dllName: string;

  /** 是否需要等待初始化操作完成 */
  initRequired: boolean;
}

export interface PluginInvokeOptions {
  data: any;
  func: string;
}

export type Window = Record<string, any>;
