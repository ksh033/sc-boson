import CryptoJS from 'crypto-js';
const _key = 'B2E35AD513B9455E';
export function encrypt(word) {
  var key = CryptoJS.enc.Utf8.parse(_key);

  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted;
}
export function decrypt(word) {
  var key = CryptoJS.enc.Utf8.parse(_key);

  var decrypt = CryptoJS.AES.decrypt(word, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

export function encrypt16(word) {
  var encrypted = encrypt(word);
  return encrypted.ciphertext.toString().toUpperCase();
}

export function decrypt16(hexStr) {
  var oldHexStr = CryptoJS.enc.Hex.parse(hexStr);
  var base64Str = CryptoJS.enc.Base64.stringify(oldHexStr);
  console.log(base64Str);
  return decrypt(base64Str);
}
