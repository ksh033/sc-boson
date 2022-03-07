export function imageToFile(url, option) {
  return new Promise((resolve, reject) => {
    if (url) {
      getUrlBase64(url, (base64) => {
        var blob = dataURLtoBlob(base64);
        var file = blobToFile(blob, 'file');
        resolve(file);
      });
    }
  });
}
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
//将blob转换为file
function blobToFile(theBlob, fileName) {
  theBlob.lastModifiedDate = new Date();
  theBlob.name = fileName;
  return theBlob;
}
function getUrlBase64(url, callback) {
  var canvas = document.createElement('canvas'); //创建canvas DOM元素
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  var ext = url.substring(img.src.lastIndexOf('.') + 1).toLowerCase();
  img.onload = function () {
    canvas.height = 60; //指定画板的高度,自定义
    canvas.width = 85; //指定画板的宽度，自定义
    ctx.drawImage(img, 0, 0, 60, 85); //参数可自定义
    var dataURL = canvas.toDataURL('image/' + ext);
    callback.call(this, dataURL); //回掉函数获取Base64编码
    canvas = null;
  };
}
