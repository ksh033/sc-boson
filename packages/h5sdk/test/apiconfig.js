const appid = 'wx399860662d245136';
const appsecret = 'f6903992472277a907e82d4ea3429c51';

const WX_CONFIG = {
  //appid:"wx098ba91d70da965e",
  //appsecret:"37300747966f4724f5aaf9641d1e1f85",
  appId: appid,
  tokenUrl:
    'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
    appid +
    '&secret=' +
    appsecret,
  jsUrl: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=',
};

module.exports = { WX_CONFIG };
