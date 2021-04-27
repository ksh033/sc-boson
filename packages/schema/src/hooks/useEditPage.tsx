/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
import type React from 'react';
import { useRef, useState } from 'react';
// import { history } from 'umi';
import type { FormFilterProp, DialogOptions } from '../interface';
import { PageConfig, PageType, ToolButtons, Action } from '../interface';
import schema from '../pageConfigUitls';
import type { UseListPageProp } from './useListPage';
import ListPage from './useListPage';
import FormInfo from '../page/FormInfo';
import { Schema } from '../context';
import _ from 'lodash';

export { PageConfig, Action };
interface initProps {
  callback?: (res: any) => any; // 回调函数
  name?: string; // 服务名, 默认名称为 queryById
  key?: string; // 默认为id
  params?: any; // 服务的参数，默认参数为 { id: record }
  defaultValues?: any; // 默认初始化值
}
export interface UseEditPageProp extends UseListPageProp {
  getFormConfig: (
    _props?: FormFilterProp,
  ) => { form: React.MutableRefObject<any>; formConfig: any[]; initialValues: any };
  getModalBtns: (_action?: string, options?: any) => any[];
  toInitialValues: (initConfig: initProps) => void;
  loading: boolean;
  getPageParam: () => any;
  getAction: () => any;
  getFormInfo: (_props?: FormFilterProp) => FormInfo;
  getTitle: (action: string) => any;
}

const defaultConfig: PageConfig = {
  pageType: 'page',
};

export default function useEditPage(
  pageConfig: PageConfig = { pageType: 'page' },
  props: any,
): UseEditPageProp {
  const config = { ...defaultConfig, ...pageConfig };
  const { umi, dataTypeFormat } = Schema;
  const Page = ListPage(config, props);
  // const { service } = config;
  const { pageProps = {}, match, location } = props;
  let record: any = '';
  if (config.pageType === PageType.modal) {
    record = pageProps.params;
  } else if (location && location.query) {
    record = location.query;
  }

  // const { formatEvent, format } = useFormatEvent(config);
  const form: React.MutableRefObject<any> = useRef();
  const [loading, setLoading] = useState(false);
  // const { dict } = userDictModel();
  const [initialValues, setInitialValues] = useState(() => {
    const values = _.isObject(record) ? record : {};
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
    const { callback, name = 'queryById', params, defaultValues, key = 'id' } = initConfig;

    if (getAction() !== Action.ADD) {
      if (config.service && config.service[name]) {
        const _params = params || { [key]: _.isObject(record) ? record[key] : record };
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
    const { formKey, fieldsProp, callBack, action } = _props || {};
    const formConfig = schema.getFormInfo(config, formKey, fieldsProp, callBack, action);
    return { form, formConfig, initialValues };
  };

  const getModalBtns = (
    rAction?: string,
    options?: DialogOptions & {
      preHandle?: (values: any) => any;
    },
  ): any[] => {
    const { preHandle, ...restOptions } = options || {};
    const defaultOptions = {
      ...props,
      form,
      callBack: pageProps.callBack,
    };
    if (config.pageType === PageType.page) {
      defaultOptions.close = () => {
        umi.history?.go(-1);
      };
    }
    const buttons = [];
    const newAction = rAction || getAction();
    if (newAction === Action.ADD) {
      buttons.push({
        ...ToolButtons.formSubmit, // 提交按钮
        preHandle,
        options: {
          ...defaultOptions,
          ...restOptions,
        },
      });
    }
    if (newAction === Action.EDIT) {
      buttons.push({
        ...ToolButtons.formUpdate, // 更新按钮
        preHandle,
        options: {
          ...defaultOptions,
          ...restOptions,
        },
      });
    }
    buttons.push({
      ...ToolButtons.formBack, // 返回按钮
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
  };
}
