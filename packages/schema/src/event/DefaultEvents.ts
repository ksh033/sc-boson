// @ts-ignore
import { CModal } from '@scboson/sc-element';
import type { ButtonTypeProps } from '../interface';

import {stringify} from 'query-string'
// @ts-ignore umi4.0 允许组件包引入 umi 会造成webpack上下文问题

import { omitUndefinedAndEmptyArr } from '../index';

let history:any
function setHistory(h: any) {
  if (!history && h) {
    history = h
  }

}
const defaultOptions = {
  showFull: false,
  okCancel: false,
  footer: null,
};
function add(props: ButtonTypeProps, event?: any) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  const { options, preHandle } = props;
  const newOptions = {
    ...defaultOptions,
    ...options,
    pageProps: { ...options?.pageProps, action: 'add' },
  };
  if (options) {
    const { showFull, title, url } = options;
    newOptions.title = title || '新增';
    if (preHandle) {
      const result = preHandle(options.pageProps);
      if (!result) {
        return;
      }
    }
    if (url) {
      history.push({
        pathname: url,
        search: stringify(options.pageProps),
      });
    } else if (showFull) {
      CModal.showFull(newOptions);
    } else {
      CModal.show(newOptions);
    }
  }
}

/**
 * 页面跳转
 *
 * @param props
 * @returns
 */
function link(props: ButtonTypeProps, event?: any) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  const { preHandle, options } = props;
  if (options) {
    let { pageProps } = options;

    if (!pageProps) {
      pageProps = {};
    }
    // const newOptions = { ...defaultOptions, ...resProps, pageProps: tempageProps };
    const { url } = options;
    if (preHandle) {
      const result = preHandle(pageProps);
      if (!result) {
        return;
      }
    }
    if (url) {
      history.push({
        pathname: url,
        search: options.params,
      });
    }
  }
}

function edit(props: ButtonTypeProps, event?: any) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  const { preHandle, options } = props;
  if (options) {
    const { pageProps, ...resProps } = options;
    let tempageProps: any = pageProps;
    if (!pageProps) {
      tempageProps = {};
    }
    tempageProps.action = 'edit';
    const newOptions = { ...defaultOptions, ...resProps, pageProps: tempageProps };
    const { showFull, title, url } = options;
    newOptions.title = title || '修改';
    if (preHandle) {
      const result = preHandle(options.pageProps);
      if (!result) {
        return;
      }
    }
    if (url) {
      history.push({
        pathname: url,
        search: options.pageProps,
      });
    } else if (showFull) {
      CModal.showFull(newOptions);
    } else {
      CModal.show(newOptions);
    }
  }
}

function view(props: ButtonTypeProps, event?: any) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  const { options } = props;
  if (options) {
    const { pageProps, ...resProps } = options;
    let tempageProps: any = pageProps;
    if (!pageProps) {
      tempageProps = {};
    }
    tempageProps.action = 'view';
    const newOptions = { pageProps: tempageProps, ...defaultOptions, ...resProps };
    const { showFull, title, url } = options;
    newOptions.title = title || '查看';
    if (url) {
      history.push({
        pathname: url,
        search: options.pageProps,
      });
    } else if (showFull) {
      CModal.showFull(newOptions);
    } else {
      CModal.show(newOptions);
    }
  }
}

/** 删除 */
function remove(props: ButtonTypeProps, event?: any) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  const { options, callBack } = props;
  if (options) {
    const { params, title = '您是否确定删除' } = options;
    CModal.confirm({
      title,
      //   content: 'Some descriptions',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        if (options.service) {
          const data = await options.service(params);
          if (callBack) {
            callBack(data, params);
          }
        }
      },
      onCancel() { },
    });
  }
}
/** @param props */
function confirm(props: ButtonTypeProps, event?: any) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  const { options, preHandle, callBack } = props;
  if (options) {
    const { params, beforeOpen } = options;

    if (beforeOpen) {
      beforeOpen();
    }
    CModal.confirm({
      title: options.title,
      //   content: 'Some descriptions',
      okText: '确定',
      cancelText: '取消',
      content: options.content,
      onOk: async () => {
        if (options.service) {
          try {
            let newValue = params
            if (preHandle) {
              newValue = await preHandle(newValue);
              if (newValue === null || newValue === false) {
                return Promise.reject("preHandle error")
              }
            }
            const data = await options.service({ ...newValue, ...params });

            if (callBack) {
              callBack(data, newValue);
            }
            return Promise.resolve()
          } catch (ex) {
            return Promise.reject(ex)
          }


        }


      },
      onCancel() { },
    });
  }
}
/** 停用 */
async function disabled(props: ButtonTypeProps, event?: any) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  const { options, callBack } = props;
  if (options) {
    const { params } = options;
    const { status } = params;
    if (status === 0 || status === '0') {
      CModal.confirm({
        title: '您是否确定禁用',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          if (options.service) {
            const data = await options.service(params);
            if (callBack) {
              callBack(data);
            }
          }
        },
      });
    } else if (options.service) {
      const data = await options.service(params);
      if (callBack) {
        callBack(data);
      }
    }
  }
}
// 弹窗返回
function formBack(props: ButtonTypeProps) {
  const { options } = props;
  if (options) {
    const { close } = options;
    if (close) {
      close();
    } else {
      history.go(-1);
    }
  }
}

/** 提交 */
function formSubmit(props: ButtonTypeProps) {
  const { options, callBack, preHandle } = props;
  if (options) {
    const { form, service, close, pageEntryTime } = options;
    if (form && form.current) {
      form.current
        .validateFields()
        .then(async (values: any) => {
          let newValue = values;
          if (preHandle) {
            newValue = await preHandle(values);
            if (newValue === null || newValue === false) {
              return;
            }
          }
          newValue.pageEntryTime = pageEntryTime;
          newValue = omitUndefinedAndEmptyArr(newValue);
          if (service) {
            try {
              const data = await service(newValue);
              if (callBack) {
                callBack(data, newValue);
              }
              if (data === null || data.success === undefined || data.success === null) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                close && close(data);
              }
            } catch (err) {
              callBack?.(err, newValue);
            }
          } else if (close) {
            close();
          }
        })
        .catch((error: { errorFields: { name: any }[] }) => {
          form.current.scrollToField(error.errorFields[0].name, {
            block: 'center',
            behavior: 'smooth',
          });
        });
    }
  }
}

/** 修改 */
function formUpdate(props: ButtonTypeProps) {
  const { options, callBack, preHandle } = props;
  if (options) {
    const { form, service, close, pageEntryTime } = options;
    if (form && form.current) {
      form.current
        .validateFields()
        .then(async (values: any) => {
          let newValue = values;
          if (preHandle) {
            newValue = await preHandle(values);
            if (newValue === null || newValue === false) {
              return;
            }
          }
          newValue.pageEntryTime = pageEntryTime;
          newValue = omitUndefinedAndEmptyArr(newValue);
          if (service) {
            try {
              const data = await service(newValue);
              if (callBack) {
                callBack(data, newValue);
              }
              if (data === null || data.success === undefined || data.success === null) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                close && close(data);
              }
            } catch (err) {
              callBack?.(err, newValue);
            }
          } else if (close) {
            close();
          }
        })
        .catch((error: { errorFields: { name: any }[] }) => {
          form.current.scrollToField(error.errorFields[0].name, {
            block: 'center',
            behavior: 'smooth',
          });
        });
    }
  }
}
/**
 * 导出
 */
function dataExport(props: ButtonTypeProps) {
  const { options, callBack, params = {} } = props;
  if (options) {
    const { service } = options;
    const data = service?.(params);
    if (callBack) {
      callBack(data, params);
    }
  }
}
const defaultEvent = {
  add,
  disabled,
  edit,
  view,
  remove,
  formBack,
  formSubmit,
  formUpdate,
  confirm,
  link,
  dataExport, setHistory
};
export default defaultEvent;
