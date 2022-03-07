/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-rest-params */
/* eslint-disable eqeqeq */
/* eslint-disable no-bitwise */
/* eslint-disable prefer-const */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable func-names */
import defConfig from '../config/default-config';
import utils from '../utils/index';

type Window = Record<string, any>;

function createIframe(op: any): HTMLElement {
  const {
    form: { id },
  } = op;
  const template = `<iframe \
                        id="socketIframe${id}"
                        name="socketIframe${id}"
                        style="position:absolute; top:-9999px; left:-9999px">
                    </iframe>`;
  return utils.appendHtml(template);
}

function createForm(op: any): HTMLFormElement {
  const {
    form: { id },
    url,
    form,
  } = op;
  if (op.func) {
    op.invokeType = 'func';
    op.invokeValue = op.func;
  } else {
    op.invokeType = 'proc';
    op.invokeValue = op.proc;
  }
  const template = `<form id="socketForm${id}" name="socketForm${id}" 
        target="socketIframe${id}" 
        action="${url}" 
        method="post" 
        accept-charset="UTF-8" 
        style="position:absolute; top:-9999px; left:-9999px"
        >
        </form>`;
  const $form = utils.appendHtml(template);
  const fieldTemp = '<input type="hidden" name="" value="" />';
  for (const field in form) {
    const $field = utils.appendHtml(fieldTemp, $form);
    $field.setAttribute('name', field);
    $field.setAttribute('value', form[field]);
  }
  return <HTMLFormElement>$form;
}

const messageStack: Map<string, Function> = new Map<string, Function>();
window.addEventListener('message', function (event: any) {
  // TODO
  const {
    data: { type = '' },
  } = event;
  if (~type.indexOf('webpack')) {
    return;
  }
  let { data } = event;
  try {
    data = JSON.parse(data);
    const callback = messageStack.get(data.id);
    if (callback) {
      callback.call({}, data);
    }
  } catch (e) {
    window.console.error('客户端返回json数据异常：', data, e);
  }
});

export default {
  /**
   * 通过iframe实现跨域post通讯
   *
   * @param ops
   */
  send(ops: { url: string; form: any }): Promise<any> {
    const defer = new Promise((resolve, reject) => {
      const iframe = createIframe(ops);
      let status = 'pending';
      const form: HTMLFormElement = createForm(ops);
      const callback: Function = function (data: any = {}) {
        const {
          id,
          ret: { ret_code, ret_msg },
        } = data;
        try {
          if (ret_code === '0') {
            resolve.apply(defer, [ret_msg]);
          } else {
            reject.apply(defer, [{ code: 'error', msg: ret_msg }]);
          }
          status = 'resolved';
        } catch (e) {
          console.error('业务回调函数调用异常：', e);
        } finally {
          iframe.remove();
          form.remove();
          clearInterval(timer);
        }
      };
      messageStack.set(ops.form.id, callback);
      form.submit();
      // 超时
      const timeout = defConfig.sendByIframeTimeout;
      const startTime = new Date().getTime();
      var timer = setInterval(function () {
        const endTime = new Date().getTime();
        if (status !== 'pending') {
          clearInterval(timer);
          iframe.remove();
          form.remove();
          return;
        }
        if (endTime - startTime > timeout) {
          reject({ code: 'timeout', msg: '超时' });
          clearInterval(timer);
          messageStack.delete(ops.form.id);
          iframe.remove();
          form.remove();
        }
      }, 800);
    });
    return defer;
  },

  /**
   * Jsonp 调用
   *
   * @param ops
   */
  jsonp(ops: { jsonp: string; url: string; data?: any; timeout?: number }): Promise<any> {
    const defer = new Promise((resolve, reject) => {
      let { jsonp = `jsonp_${utils.uuid()}`, url, data = {}, timeout = defConfig.timeout } = ops;
      const step = timeout / 2;
      let timeconsum = 0;
      let timer: any = -1;
      let status = 'pending';
      // @ts-ignore
      //const t=window.masterWindow;
      //console.log(t);
      // console.log(window["0"]);
      const temWin = window.masterWindow || <Window>window;
      const headNode = temWin.document.getElementsByTagName('head')[0];
      const scriptNode = temWin.document.createElement('script');
      temWin[jsonp] = function () {
        status = 'resolved';
        const args: any = [];
        for (let i = 0; i < arguments.length; i++) {
          args[i] = arguments[i];
        }
        resolve.apply(defer, args);
        clearInterval(timer);
        scriptNode.remove();
        delete temWin[jsonp];
      };

      scriptNode.type = 'text/javascript';
      scriptNode.charset = 'utf-8';
      scriptNode.async = true;
      const queryString = Object.keys(data)
        .map((key) => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');
      if (~url.indexOf('?')) url += `&jsonp=${jsonp}&${queryString}`;
      else {
        url += `?jsonp=${jsonp}&${queryString}`;
      }
      scriptNode.src = url;
      timer = setInterval(function () {
        timeconsum += step;
        if (timeconsum >= timeout) {
          delete temWin[jsonp];
          clearInterval(timer);
          if (status == 'pending') {
            scriptNode.remove();
            reject({ code: 'timeout', msg: '超时' });
          }
        }
      }, step);
      headNode.appendChild(scriptNode);
      return true;
    });
    return defer;
  },
};
