/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
import React from 'react';
import { useRef, useState } from 'react';
// @ts-ignore
import { history } from 'umi';
import type { FormFilterProp, DialogOptions, HButtonType, ButtonTypeProps } from '../interface';
import { PageConfig, PageType, ToolButtons, Action } from '../interface';
import schema from '../pageConfigUitls';
import type { UseListPageProp } from './useListPage';
import ListPage from './useListPage';
import FormInfo from '../page/FormInfo';
import { Schema } from '../context';
import {isObject,isString} from 'lodash';
import { useSetState } from 'ahooks';

// import ButtonTool from '../page/OpColButton';

export { PageConfig, Action };
interface initProps {
  callback?: (res: any) => any; // 回调函数
  name?: string; // 服务名, 默认名称为 queryById
  key?: string; // 默认为id
  params?: any; // 服务的参数，默认参数为 { id: record }
  defaultValues?: any; // 默认初始化值
}
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
  getPageParam: () => any;
  getAction: () => any;
  getFormInfo: (_props?: FormFilterProp) => FormInfo;
  getTitle: (action: string) => any;
  addPageButton: <T extends keyof typeof ToolButtons>(
    btns:
      | (HButtonType & { buttonType?: T; extraProps?: ButtonTypeProps; options?: DialogOptions })
      | T,
  ) => any;
  getPageButtons: <T extends keyof typeof ToolButtons>(
    ...btns: (
      | (HButtonType & { buttonType?: T; extraProps?: ButtonTypeProps; options?: DialogOptions })
      | T
      | undefined
    )[]
  ) => any[];
}

const defaultConfig: PageConfig = {
  pageType: 'page',
};

export default function useEditPage(
  pageConfig: PageConfig = { pageType: 'page' },
  props: any,
): UseEditPageProp<any> {
  const config = { ...defaultConfig, ...pageConfig };
  const { dataTypeFormat } = Schema;
  const Page = ListPage(config, props);
  // const _editPageButtons: any[] = [];
  // const toolbar = new ButtonTool();

  // const { service } = config;
  const { pageProps = {}, match, location } = props;
  let record: any = '';
  if (config.pageType === PageType.modal) {
    record = pageProps.params;
  } else if (location && location.query) {
    record = location.query;
  }
  const [pageData, setPageData] = useSetState<any>();

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
      if (match && match.params) {
        return match.params.editpage;
      }
    }
    return '';
  };

  const getPageParam = () => {
    if (config.pageType === PageType.modal) {
      return pageProps.params;
    }
    if (config.pageType === PageType.page) {
      if (location && location.query) {
        return location.query;
      }
    }
    return '';
  };
  const toDefaultValueChuange = (values: any) => {
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
    const { callback, name = 'queryById', params, defaultValues, key } = initConfig;

    if (getAction() !== Action.ADD) {
      if (config.service && config.service[name]) {
        let _params = params;
        if (isObject(record)) {
          _params = key ? { [key]: record[key] } : record;
        }
        setLoading(true);

        config.service[name](_params).then((res: any) => {
          if (callback) {
            setInitialValues(toDefaultValueChuange(callback(res)));
          } else {
            setInitialValues(toDefaultValueChuange(res));
          }
          setLoading(false);
        });
      } else {
        setInitialValues(toDefaultValueChuange(defaultValues));
      }
    } else {
      setInitialValues(toDefaultValueChuange(defaultValues));
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

  const getModalBtns = (
    rAction?: string,
    options?: DialogOptions & ButtonTypeProps,
    serverName?: string,
  ): any[] => {
    const { preHandle, ...restOptions } = options || {};

    if (config.pageType === PageType.page) {
      defaultOptions.close = () => {
        history?.go(-1);
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
  };
}
