const Config: Record<string, any> = {
  version: '1.0',
  url: 'http://127.0.0.1:13526/',
  guardUrl: 'http://127.0.0.1:13528/controlMainApp',
  heartbeat: 'heart',
  // 未启动客户端回调
  unstart: () => {},
  update: 'update',
  startUrl: 'BosssoftAssistant://',
  cookies: (<any>window)._cookies || 'no-cookies',
  timeout: 2000,
  sendByIframeTimeout: 5 * 60 * 1000,
  sliceSize: 1024,
  companyClient: '博思客户端',
  // 控件下载地址 //TODO 配置化从后端配置文件读取
  downloadUrl: 'resources/bsnetfun/bosssoft-assistant-v1.5.8.exe',
  // 前端控件实例初始化时更新，如果客户端未启动，会在启动成功后再发一次更新请求
  initUpdate: true,
  // 客户端更新地址，initUpdate为true时才起作用
  updateUrl: '',
};
// if(location.href.match('^https://')!==null){
//     Config.url = 'https://127.0.0.1:13526/';
//     Config.guardUrl = 'https://127.0.0.1:13528/controlMainApp';
// }

export default Config;
