/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
import React from 'react';
import { useRef, useState } from 'react';
// @ts-ignore
//import { history } from 'umi';
import type { FormFilterProp, DialogOptions, HButtonType, ButtonTypeProps } from '../interface';
import { PageConfig, PageType, ToolButtons, Action } from '../interface';
import schema from '../pageConfigUitls';
import type { UseListPageProp } from './useListPage';
import ListPage from './useListPage';
import FormInfo from '../page/FormInfo';
import { Schema, useSchemaContext } from '../context';
import { isObject, isString } from 'lodash';
import { useSetState } from 'ahooks';
import { useOutletContext } from '@umijs/renderer-react'
import {parse} from 'query-string';
import defaultEvents from '../event/DefaultEvents'

import dayjs from "dayjs"

// import ButtonTool from '../page/OpColButton';

export type { PageConfig, Action };
interface initProps {
  /** 请求详情后的回调函数 */
  callback?: (res: any) => any;
  /** 服务名, 默认名称为 queryById */
  name?: string;
  /** 默认为id */
  key?: string;
  /** 服务的参数，默认参数为 { id: record } */
  params?: any;
  /** 表单初始化的值 */
  defaultValues?: any;
  /**
   * 默认格式化
   *
   * @default false
   */
  defaultForamted?: boolean;
  /** 约定默认格式化的字段集合 */
  defaultRuleFormatKeys?: string[];
}
type ActionType = 'add' | 'edit' | 'view';
export interface UseEditPageProp<S> extends UseListPageProp<S> {
  getFormConfig: (_props?: FormFilterProp) => {
    form: React.MutableRefObject<any>;
    formConfig: any[];
    initialValues: any;
  };
  getModalBtns: (
    rAction?: string,
    options?: DialogOptions & ButtonTypeProps,
    serverName?: string,
  ) => any[];
  toInitialValues: (initConfig: initProps) => void;
  loading: boolean;
  getPageParam: <T = any>() => T;
  getAction: <T = ActionType>() => T;
  getFormInfo: (_props?: FormFilterProp) => FormInfo;
  getTitle: (action: string) => any;
  getModalBtn: (
    button: keyof typeof ToolButtons | HButtonType,
    options?: DialogOptions & ButtonTypeProps,
  ) => HButtonType;
  addPageButton: <T extends keyof typeof ToolButtons>(
    btns:
      | (HButtonType & { buttonType?: T; extraProps?: ButtonTypeProps; options?: DialogOptions })
      | T,
  ) => HButtonType;
  getPageButtons: <T extends keyof typeof ToolButtons>(
    ...btns: (
      | (HButtonType & { buttonType?: T; extraProps?: ButtonTypeProps; options?: DialogOptions })
      | T
      | undefined
    )[]
  ) => HButtonType[];
}

const defaultConfig: PageConfig = {
  pageType: 'page',
};

const endsWith = (val: string, str: string) => {
  if (typeof String.prototype.endsWith === 'function') {
    return val.endsWith(str);
  } else {
    const reg = new RegExp(str + '$');
    return reg.test(val);
  }
};

/**
 * 默认规则对下拉选择组件进行格式化
 *
 * @param obj 对象
 * @param keys 对象内的字段
 */
export function defaultRuleFormat(obj: any, keys?: string[]) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }
  const innerSet = new Set<string>(keys || []);
  if (innerSet.size === 0) {
    Object.keys(obj).forEach((key) => {
      if (endsWith(key, 'Id')) {
        const prefixKey = key.substring(0, key.length - 2);
        if (obj[`${prefixKey}Name`]) {
          innerSet.add(prefixKey);
        }
      }
    });
  }
  Array.from(innerSet).forEach((prefixKey) => {
    const itemValue: any = {};
    itemValue[`${prefixKey}Id`] = obj[`${prefixKey}Id`];
    itemValue.value = obj[`${prefixKey}Id`];
    itemValue[`${prefixKey}Name`] = obj[`${prefixKey}Name`];
    itemValue.label = obj[`${prefixKey}Name`];

    obj[prefixKey] = itemValue;
  });
  return obj;
}

export default function useEditPage(
  pageConfig: PageConfig = { pageType: 'page' },
  props: any,
): UseEditPageProp<any> {
  const config = { ...defaultConfig, ...pageConfig };
  const { dataTypeFormat } = Schema;
  const Page = ListPage(config, props);
  // const _editPageButtons: any[] = [];
  // const toolbar = new ButtonTool();
  const schemaContext = useSchemaContext();
  const layoutContext = useOutletContext<any>()||{};
 
  
  const { location, params } = layoutContext
  // const { service } = config;
  const { pageProps = {}, match } = props;
  let record: any = {};
  if (config.pageType === PageType.modal) {
    record = pageProps.params;
  } else if (location && location.search) {
    record = parse(location.search);
  }
  const [pageData, setPageData] = useSetState<any>({});
  const history = schemaContext.umi.history;
  defaultEvents.setHistory(history)
  const pageEntryTimeRef = useRef<string>(dayjs().format('YYYY-MM-DD HH:mm:ss'));

  const setData = (data: any) => {
    setPageData(data);
  };

  const getData = (key: any): Partial<any> => {
    return pageData[key];
  };
  // const { formatEvent, format } = useFormatEvent(config);
  const form: React.MutableRefObject<any> = useRef();
  const [loading, setLoading] = useState(false);

  // const _editPageButtons = useRef<any[]>([]);
  const defaultOptions = {
    ...props,
    form,
    callBack: pageProps.callBack,
    pageEntryTime: pageEntryTimeRef.current,
  };
  // const { dict } = userDictModel();
  const [initialValues, setInitialValues] = useState(() => {
    const values = isObject(record) ? record : {};
    return values;
  });

  const getAction = () => {
    if (config.pageType === PageType.modal) {
      return pageProps.action;
    }
    if (config.pageType === PageType.page) {
      if (params && params.editpage) {
        return params.editpage;
      } else {
        return record && record['action'];
      }
    }
    return '';
  };

  const getPageParam = () => {
    if (config.pageType === PageType.modal) {
      return pageProps.params;
    }
    if (config.pageType === PageType.page) {
      if (location && location.search) {
        return parse(location.search);
      }
    }
    return '';
  };
  /** 表单详情时对枚举字段进行翻译 */
  const toDefaultValueChange = (values: any) => {
    const action = getAction();
    if (Array.isArray(config.formConfig)) {
      config.formConfig.forEach((item) => {
        if (Array.isArray(item.items)) {
          item.items.forEach((element: any) => {
            if (action === 'view' && element.dataType) {
              values[element.name] =
                dataTypeFormat &&
                dataTypeFormat(
                  values[element.name],
                  element.dataType || element.name || '',
                  values,
                );
              // const list: Array<DictDataItem> = dict[`${element.name}`];
              // if (list) {
              //   values[element.name] = cacheRender(values[element.name], list);
              // } else if (element.dataType) {

              // }
            }
          });
        }
      });
    }
    return values;
  };

  const toInitialValues = (initConfig: initProps) => {
    const {
      callback,
      name = 'queryById',
      params,
      defaultValues,
      key,
      defaultForamted = false,
      defaultRuleFormatKeys,
    } = initConfig;

    if (getAction() !== Action.ADD) {
      if (config.service && config.service[name]) {
        let _params = params;
        if (isObject(record)) {
            //@ts-ignore
          _params = key ? { [key]: record[key] } : record;
        }
        setLoading(true);

        config.service[name](_params).then((res: any) => {
          if (Object.prototype.toString.call(res) === '[object Object]' && defaultForamted) {
            res = defaultRuleFormat(res, defaultRuleFormatKeys);
          }
          if (callback) {
            const ret = callback(res);
            if (ret) {
              if (ret.then) {
                // 判断是Promise方法
                ret.then((result: any) => {
                  setInitialValues(toDefaultValueChange(result));
                  setLoading(false);
                });
              } else {
                setInitialValues(toDefaultValueChange(ret));
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          } else {
            setInitialValues(toDefaultValueChange(res));
            setLoading(false);
          }
        });
      } else {
        setInitialValues(toDefaultValueChange(defaultValues));
      }
    } else {
      setInitialValues(toDefaultValueChange(defaultValues));
    }
  };

  /** 获取网格列 */
  const getFormConfig = (_props?: FormFilterProp) => {
    const { formKey, fieldsProp, callBack } = _props || {};
    const action = getAction();
    const formConfig = schema.getFormInfo(config, formKey, fieldsProp, callBack, action);
    return { form, formConfig, initialValues };
  };

  const addPageButton = <T extends keyof typeof ToolButtons>(
    item?:
      | (HButtonType & { buttonType?: T; extraProps?: ButtonTypeProps; options?: DialogOptions })
      | T,
  ): any => {
    let button: any = null;
    if (item) {
      if (config.pageType === PageType.page) {
        defaultOptions.close = () => {
          history?.go(-1);
        };
      }

      if (React.isValidElement(item)) {
        button = item;
      }
      if (isString(item)) {
        const key: string = item;
        //@ts-ignore
        button = { ...ToolButtons[key], options: defaultOptions };
      }

      if (isObject(item)) {
        const { buttonType, extraProps, options, ...restProps } = item;
        if (buttonType) {
          button = {
            ...ToolButtons[buttonType],
            ...extraProps,
            options: { ...defaultOptions, ...options },
          };
        } else {
          button = { ...restProps, options: { ...defaultOptions, ...options } };
        }
      }
    }
    return button;
  };
  const getPageButtons = <T extends keyof typeof ToolButtons>(
    ...btns: (
      | (HButtonType & { buttonType?: T; extraProps?: ButtonTypeProps; options?: DialogOptions })
      | T
      | undefined
    )[]
  ): any[] => {
    const newBtns: any[] = [];
    const newAction = getAction();
    const [fisBtn, ...otherBtns] = btns;
    const formSubmitBtn = addPageButton('formSubmit');
    const formUpdateBtn = addPageButton('formUpdate');

    if (newAction === Action.ADD) {
      // btns.push((addPageButton(item))
      if (fisBtn) {
        const extBtn = addPageButton(fisBtn);
        newBtns.push({ ...formSubmitBtn, ...extBtn });
      }
    }
    if (newAction === Action.EDIT) {
      // btns.push((addPageButton(item))

      if (fisBtn) {
        const extBtn = addPageButton(fisBtn);
        newBtns.push({ ...formUpdateBtn, ...extBtn });
      }
    }
    if (newBtns.length === 0) {
      otherBtns.unshift(fisBtn);
    }

    if (otherBtns) {
      otherBtns.forEach((item) => {
        const temBtn = addPageButton(item);
        if (temBtn) {
          newBtns.push(temBtn);
        }
      });
    }
    newBtns.push({
      ...ToolButtons.formBack, // 返回按钮
      text: newAction === Action.VIEW ? '返回' : '取消',
      options: defaultOptions,
    });
    return Page.bindEvents(newBtns);
  };

  const getModalBtn = (
    button: keyof typeof ToolButtons | HButtonType,
    buttonProps?: ButtonTypeProps,
  ) => {
    const {
      preHandle,
      closeDlg,
      options,
      callBack: newBallCack,
      ...restOptions
    } = buttonProps || {};

    if (config.pageType === PageType.page) {
      defaultOptions.close = () => {
        if (config.path) {
          history.push(config.path);
        } else {
          history?.go(-1);
        }
      };
    }

    const { close, callBack: defCallBack, ...otherDefaultOpt } = defaultOptions;

    let callBack = defCallBack;
    if (newBallCack) {
      callBack = (fromdata: any, newdata: any) => {
        defCallBack?.();
        newBallCack(fromdata, newdata);
      };
    }
    let btn = null;
    if (typeof button === 'string') {
      btn = ToolButtons[button];
    } else {
      btn = button;
    }
    const newBtn = {
      ...btn,
      ...restOptions,
      callBack,
      options: {
        ...otherDefaultOpt,

        ...options,
        close: closeDlg !== undefined && closeDlg === false ? null : close,
      },
    };

    return Page.bindEvent(newBtn);
  };
  const getModalBtns = (
    rAction?: string,
    options?: DialogOptions & ButtonTypeProps,
    serverName?: string,
  ): any[] => {
    const { preHandle, ...restOptions } = options || {};

    if (config.pageType === PageType.page) {
      defaultOptions.close = () => {
        if (config.path) {
          history.push(config.path);
        } else {
          history?.go(-1);
        }
      };
    }
    const buttons: any[] = [];
    const newAction = rAction || getAction();
    if (newAction === Action.ADD) {
      const btn1 = {
        ...ToolButtons.formSubmit, // 提交按钮
        preHandle,

        options: {
          ...defaultOptions,
          ...restOptions,
        },
      };
      if (serverName) {
        btn1.serverName = serverName;
      }
      buttons.push(btn1);
    }
    if (newAction === Action.EDIT) {
      const btn2 = {
        ...ToolButtons.formUpdate, // 更新按钮
        preHandle,

        options: {
          ...defaultOptions,
          ...restOptions,
        },
      };
      if (serverName) {
        btn2.serverName = serverName;
      }
      buttons.push(btn2);
    }
    buttons.push({
      ...ToolButtons.formBack, // 返回按钮
      text: newAction === Action.VIEW ? '返回' : '取消',
      options: defaultOptions,
    });
    return Page.bindEvents(buttons);
  };

  const getFormInfo = (_props?: FormFilterProp) => {
    const formInfo = getFormConfig(_props);

    return new FormInfo(formInfo);
  };
  const getTitle = (rAction: string) => {
    const newAction = rAction || getAction();
    let title: string = '';
    switch (newAction) {
      case 'add':
        title = '新增';
        break;
      case 'edit':
        title = '修改';
        break;
      case 'view':
        title = '详情';
        break;
      default:
        title = '';
    }
    return title;
  };
  return {
    ...Page,
    getFormConfig,
    getModalBtns,
    toInitialValues,
    loading,
    getAction,
    getPageParam,
    getFormInfo,
    getTitle,
    setData,
    getData,
    data: pageData,
    getPageButtons,
    addPageButton,
    getModalBtn,
  };
}
