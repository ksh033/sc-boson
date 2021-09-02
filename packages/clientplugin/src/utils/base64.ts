/* eslint-disable no-plusplus */
/* eslint-disable no-console */
/* eslint-disable new-cap */
/* eslint-disable no-useless-escape */
/* eslint-disable eqeqeq */
/* eslint-disable func-names */
/* eslint-disable no-case-declarations */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-control-regex */
/* eslint-disable no-bitwise */
/* eslint-disable no-nested-ternary */
// eslint-disable-next-line no-nested-ternary
// eslint-disable-next-line no-bitwise
/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

// existing version for noConflict()
const version = '2.1.9';
// eslint-disable-next-line import/no-mutable-exports
let Base64: any = {};
// if node.js, we use Buffer
let buffer: any;
if (typeof module !== 'undefined' && module.exports) {
  try {
    // eslint-disable-next-line global-require
    buffer = require('buffer').Buffer;
  } catch (err) {
    console.log(err);
  }
}
// constants
const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const b64tab = (function (bin: any) {
  const t: any = {};
  for (let i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
  return t;
})(b64chars);
const { fromCharCode } = String;
// encoder stuff
const cb_utob = function (c: any) {
  if (c.length < 2) {
    const cc = c.charCodeAt(0);

    return cc < 0x80
      ? c
      : cc < 0x800
      ? fromCharCode(0xc0 | (cc >>> 6)) + fromCharCode(0x80 | (cc & 0x3f))
      : fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
        fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
        fromCharCode(0x80 | (cc & 0x3f));
  }
  const cc: any = 0x10000 + (c.charCodeAt(0) - 0xd800) * 0x400 + (c.charCodeAt(1) - 0xdc00);
  return (
    fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) +
    fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) +
    fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
    fromCharCode(0x80 | (cc & 0x3f))
  );
};
const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
const utob = function (u: string) {
  return u.replace(re_utob, cb_utob);
};
const cb_encode = function (ccc: string) {
  const padlen = [0, 2, 1][ccc.length % 3];
  const ord =
    (ccc.charCodeAt(0) << 16) |
    ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) |
    (ccc.length > 2 ? ccc.charCodeAt(2) : 0);
  const chars = [
    b64chars.charAt(ord >>> 18),
    b64chars.charAt((ord >>> 12) & 63),
    padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
    padlen >= 1 ? '=' : b64chars.charAt(ord & 63),
  ];
  return chars.join('');
};
const btoa = Base64.btoa
  ? function (b: any) {
      return Base64.btoa(b);
    }
  : function (b: any) {
      return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
const _encode = buffer
  ? function (u: any) {
      return (u.constructor === buffer.constructor ? u : new buffer(u)).toString('base64');
    }
  : function (u: any) {
      return btoa(utob(u));
    };
const encode = function (u: any, urisafe: any) {
  return !urisafe
    ? _encode(String(u))
    : _encode(String(u))
        .replace(/[+\/]/g, function (m0: any) {
          return m0 == '+' ? '-' : '_';
        })
        .replace(/=/g, '');
};
const encodeURI = function (u: any) {
  return encode(u, true);
};
// decoder stuff
const re_btou = new RegExp(
  ['[\xC0-\xDF][\x80-\xBF]', '[\xE0-\xEF][\x80-\xBF]{2}', '[\xF0-\xF7][\x80-\xBF]{3}'].join('|'),
  'g',
);
const cb_btou = function (cccc: any) {
  switch (cccc.length) {
    case 4:
      const cp =
        ((0x07 & cccc.charCodeAt(0)) << 18) |
        ((0x3f & cccc.charCodeAt(1)) << 12) |
        ((0x3f & cccc.charCodeAt(2)) << 6) |
        (0x3f & cccc.charCodeAt(3));
      const offset = cp - 0x10000;
      return fromCharCode((offset >>> 10) + 0xd800) + fromCharCode((offset & 0x3ff) + 0xdc00);
    case 3:
      return fromCharCode(
        ((0x0f & cccc.charCodeAt(0)) << 12) |
          ((0x3f & cccc.charCodeAt(1)) << 6) |
          (0x3f & cccc.charCodeAt(2)),
      );
    default:
      return fromCharCode(((0x1f & cccc.charCodeAt(0)) << 6) | (0x3f & cccc.charCodeAt(1)));
  }
};
const btou = function (b: any) {
  return b.replace(re_btou, cb_btou);
};
const cb_decode = function (cccc: any) {
  const len = cccc.length;
  const padlen = len % 4;
  const n =
    (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) |
    (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) |
    (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) |
    (len > 3 ? b64tab[cccc.charAt(3)] : 0);
  const chars = [fromCharCode(n >>> 16), fromCharCode((n >>> 8) & 0xff), fromCharCode(n & 0xff)];
  chars.length -= [0, 0, 2, 1][padlen];
  return chars.join('');
};
const atob = Base64.atob
  ? function (a: any) {
      return Base64.atob(a);
    }
  : function (a: any) {
      return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
// eslint-disable-next-line no-underscore-dangle
const _decode = buffer
  ? function (a: any) {
      return (a.constructor === buffer.constructor ? a : new buffer(a, 'base64')).toString();
    }
  : function (a: any) {
      return btou(atob(a));
    };
const decode = function (a: any) {
  return _decode(
    String(a)
      .replace(/[-_]/g, function (m0) {
        return m0 == '-' ? '+' : '/';
      })
      .replace(/[^A-Za-z0-9\+\/]/g, ''),
  );
};
// export Base64
Base64 = {
  VERSION: version,
  atob,
  btoa,
  fromBase64: decode,
  toBase64: encode,
  utob,
  encode,
  encodeURI,
  btou,
  decode,
};

export default Base64;
