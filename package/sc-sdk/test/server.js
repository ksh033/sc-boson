/**
 * Module dependencies.
 */
var express = require('express');
var path = require('path');
var fetch = require('node-fetch');
var proxy = require('http-proxy-middleware'); // require('http-proxy-middleware');
var address = require('address'); // require('http-proxy-middleware');
const QRCode=require('qr-image');

const apiconfig=require('./apiconfig')
const sha1 = require('sha1');
const stringRandom = require('string-random');

var jsonPlaceholderProxy = proxy({
  target: 'https://api.weixin.qq.com',
  pathRewrite: {'^/api' : ''},
  changeOrigin: true, // for vhosted sites, changes host header to match to target's host
  logLevel: 'debug'
});

var app = express();
app.use(express.static(path.resolve(__dirname, '..') + '/'))

app.get('/',function(req,res,next){
  res.send('Hello Express+https');
});
app.get('/qrcode',   function (req, res) {
  const referer=req.headers.referer;
   // 二维码尺寸，输入时为了保证精确性，请确保为21的公倍数，否则按四舍五入处理.
    // 如果为空,默认为5,即尺寸为105*105
    var size =  5;
 
    // 白色外边距，输入时为了保证精确性，请确保为5的公倍数，否则按四舍五入处理.
    // 如果为空,默认为2,即尺寸为10
    var margin = 2 ;
 
    var code = QRCode.image( referer ,{ type: 'png',size:size, margin:margin});
    res.writeHead(200, {'Content-Type': 'image/png;charset=UTF-8'});
    code.pipe(res)

})
/**
 * Add the proxy to express
 */
//app.use('/wxapi', jsonPlaceholderProxy);
app.get('/wxapi', async  function (req, res) {
  const referer=req.headers.referer;

  fetch(apiconfig.WX_CONFIG.tokenUrl).then(function(res){
    return res.json()
}).then(function(json){
    var accesstoken = json.access_token;
    //var openid = json.openid;
    var tokenurl = apiconfig.WX_CONFIG.jsUrl+accesstoken;
    return fetch(tokenurl).then(function(res){
      
 return res.json()
}).then((json)=>{

  var jsapi_ticket=json["ticket"];
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
 // var timestamp = new Date().getTime();
  var nonceStr=stringRandom(16);
  console.log(nonceStr)
  var url="https://testepay.bstj.com/sjq/80/test/adapter/wxsdk.html";
  //console.log(jsapi_ticket)
   //5、将参数排序并拼接字符串  
   var  str = "jsapi_ticket="+jsapi_ticket+"&noncestr="+nonceStr+"&timestamp="+timestamp+"&url="+referer;  
  var appId=apiconfig.WX_CONFIG.appId;
  const signature=sha1(str)
  const result={
     code:"1",
     data:{
      debug:false,
      appId,
      signature,
      timestamp,
      nonceStr
     }

  }
  // timestamp: "timestamp",//上面main方法中拿到的时间戳timestamp  
  // nonceStr: "nonceStr",//上面main方法中拿到的随机数nonceStr  
  // signature: "signature",//上面main方法中拿到的签名signature  
   return result

}).then(function(json){
    res.send(json)
})

  //res.send('GET request to the homepage')
})
})

const server=app.listen(8080, '0.0.0.0',(arg)=>{
console.log(arg)

 const host = address.ip();
 const port = server.address().port;
 
  //console.log(app)
    console.log('测试端口: listening on port 8080');
  console.log('[微信api代理]] Opening: http://%s:%s/wxapi', host, port);
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
});


//require('open')('http://localhost:3000/users');