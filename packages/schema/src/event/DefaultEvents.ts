/* eslint-disable @typescript-eslint/no-unused-vars */
import { CModal } from '@scboson/sc-element';
import type { ButtonTypeProps } from '../interface';
import { umi } from '../context';
// @ts-ignore
import { history } from 'umi';

const defaultOptions = {
  showFull: false,
  okCancel: false,
  footer: null,
};
function add(props: ButtonTypeProps) {
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
        query: options.pageProps,
      });
    } else if (showFull) {
      CModal.showFull(newOptions);
    } else {
      CModal.show(newOptions);
    }
  }
}

function edit(props: ButtonTypeProps) {
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
        query: options.pageProps,
      });
    } else if (showFull) {
      CModal.showFull(newOptions);
    } else {
      CModal.show(newOptions);
    }
  }
}

function view(props: ButtonTypeProps) {
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
        query: options.pageProps,
      });
    } else if (showFull) {
      CModal.showFull(newOptions);
    } else {
      CModal.show(newOptions);
    }
  }
}

/** 删除 */
function remove(props: ButtonTypeProps) {
  const { options, callBack } = props;
  if (options) {
    const { params } = options;
    CModal.confirm({
      title: '您是否确定删除',
      //   content: 'Some descriptions',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        if (options.service) {
          const data = await options.service(params);
          if (callBack) {
            callBack(data);
          }
        }
      },
      onCancel() {},
    });
  }
}
/** 停用 */
async function disabled(props: ButtonTypeProps) {
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
    const { form, service, close } = options;
    if (form && form.current) {
      form.current.validateFields().then(async (values: any) => {
        if (preHandle) {
          const result = preHandle(values);
          if (!result) {
            return;
          }
        }
        if (service) {
          const data = await service(values);
          if (callBack) {
            callBack(data);
          }
          if (data === null || data.success === undefined || data.success === null) {
            close?.();
          }
        } else if (close) {
          close();
        }
      });
    }
  }
}

/** 修改 */
function formUpdate(props: ButtonTypeProps) {
  const { options, callBack, preHandle } = props;
  if (options) {
    const { form, service, close } = options;
    if (form && form.current) {
      form.current.validateFields().then(async (values: any) => {
        if (preHandle) {
          const result = preHandle(values);
          if (!result) {
            return;
          }
        }
        if (service) {
          const data = await service(values);
          if (callBack) {
            callBack(data);
          }
          if (data === null || data.success === undefined || data.success === null) {
            close?.();
          }
        } else if (close) {
          close();
        }
      });
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
};
export default defaultEvent;
