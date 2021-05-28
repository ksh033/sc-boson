/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-underscore-dangle */
import  { useRef } from 'react';
import type {
  ProColumn,
  FormItem,
  ProColumnType,
  HButtonType,
} from '../interface';
import type { BaseResult } from '../event/BindEventUtil';
import { bindEvent, bindEvents, formatUseReq } from '../event/BindEventUtil';
import { useSchemaContext } from '../context';
import { PageType, PageConfig } from '../interface';
import { useSetState, useUpdateEffect, useMount } from 'ahooks';
import type { TableInfoProps } from '../page/TableInfo';
import type { SearchInfoProps } from '../page/SearchInfo';
import TableInfo from '../page/TableInfo';
import SearchInfo from '../page/SearchInfo';
import _ from 'lodash';
import schema from '../pageConfigUitls';

export { PageConfig, PageType };
export interface SearchConfig {
  tableKey?: string;

  /** 直接合并不行时使用此方法 */
  callback?: ((column: FormItem<any>) => void) | undefined;
  /** 当前页状态 */
  action?: string;
  /** 合并配置参数 */
  mergeProps?: Record<string, ProColumn>;
  /** 初始查询参数 */
  initialValues?: any;
}

export interface TableConfig {
  getOperateColumn?: () => ProColumn | any; // 操作列
  mergeCol?: Record<string, ProColumn>; // 合并列
  tableKey?: string; // 多表格数据
  callback?: (item: any) => any; // 每列的回调
  defaultParams?: any;
  action?: string; //
}

const OpColKey = '_OperateKey';

export interface UseListPageProp<S> {
  /** 获取表单配置 */
  getSearchConfig: (searchConfig?: SearchConfig | undefined) => SearchInfoProps;
  /** 获取表格配置 */
  getTableConfig: (tableConfig: TableConfig) => TableInfoProps;
  /** 获取表格对象 */
  getTable: (tableConfig?: TableConfig) => TableInfo;
  /** 获取查询对象 */
  getSearch: (searchConfig?: SearchConfig | undefined) => SearchInfo;
  /** 绑定默认事件 */
  bindEvent: (button: HButtonType) => any;
  /** 批量绑定默认事件 */
  bindEvents: (buttons: HButtonType[]) => any;
  /** 获取useRequest */
  formatUseReq: <R = any, P extends any[] = any>(serviveName: string) => BaseResult<R, P> | null;

  setParams: (value: any) => void;
  getPageParam: () => any;

  setData: (data: Partial<S>) => any;
  getData: (key: keyof S) => Partial<S>;
  data: S;
  // reload: () => void;
  reload: () => void;
}

export default function ListPage<S>(config: PageConfig, props: any): UseListPageProp<S> {
  const { service } = config;
  const { location } = props || {};
  // 查询表单
  const searchForm = useRef<any>();
  // 查询表格保存表单
  const saveRef = useRef<any>();

  const searchInitParams = useRef<any>();
  const schemaContext = useSchemaContext();
  const getSearchParams = () => {
    if (!location) {
      return null;
    }
    const { pathname, search } = location;
    const key = pathname + search;
    const searchParam = JSON.parse(sessionStorage.getItem('SEARCH_PARAMS') || '{}');
    return searchParam[key];
  };

  const [pageData, setPageData] = useSetState<any>();

  const setData = (data: any) => {
    setPageData(data);
  };

  const getData = (key: any): Partial<any> => {
    return pageData[key];
  };
  const reload = () => {
    saveRef.current?.reload();
  };

  const getPagination = () => {
    const _params = getSearchParams();
    return {
      current: _params && _params.current ? _params.current : 1,
      pageSize: _params && _params.size ? _params.size : 10,
    };
  };
  const setSearchParams = (_params: any, _pagination: any) => {
    if (!location) {
      return;
    }
    const { pathname, search } = location;
    const key = pathname + search;
    const searchParam = JSON.parse(sessionStorage.getItem('SEARCH_PARAMS') || '{}');
    searchParam[key] = {
      ..._params,
      ...{
        current: _pagination.current,
        size: _pagination.pageSize,
      },
    };
    sessionStorage.setItem('SEARCH_PARAMS', JSON.stringify(searchParam));
  };

  const [state, setState] = useSetState<any>({
    params: getSearchParams(),
    pagination: getPagination(),
  });

  const onSubmitSearchForm = (_params: any) => {
    if (JSON.stringify(_params) !== JSON.stringify(state.params)) {
      setState({
        params: _params,
        pagination: { ...state.pagination, current: 1 },
      });
    } else {
      reload();
    }
  };

  const onLoad = (data: any) => {
    let newData = {};
    if (data) {
      let rows = data.records || data.rows || [];
      const { current = 1, size = 10 } = data;
      rows = rows.map((item: any, index: number) => {
        const titem = item;
        titem.index = index + 1 + (current - 1) * size;
        return titem;
      });
      newData = {
        rows,
        total: data.total,
        current,
        size,
      };
    } else {
      newData = {
        total: 0,
        rows: [],
      };
    }
    return newData;
  };
  const pageChange = (_pagination: any) => {
    setState({
      pagination: {
        current: _pagination.current,
        pageSize: _pagination.pageSize,
      },
    });
  };
  /** 获取查询条件配置 */
  const getSearchConfig = (searchConfig?: SearchConfig) => {
    const { tableKey, callback, mergeProps, initialValues } = searchConfig || {
      tableKey: undefined,
      callback: undefined,
      action: undefined,
    };
    const initParams_ = {};
    // const action = this.action;
    const searchInfo = schema.getSearchInfo(config, tableKey, callback, '');
    let newSearchInfo: any = [];
    if (mergeProps) {
      searchInfo.forEach((item: any) => {
        const { name, id } = item;
        // 合并
        if (mergeProps && mergeProps[name || id || '']) {
          const _mergeCol = mergeProps[name || id || ''];
          newSearchInfo.push({ ...item, ..._mergeCol });
        } else {
          newSearchInfo.push(item);
        }
        // 获取查询初始值
        if (item.formItemProps && item.formItemProps.defaultValue) {
          if (item.name || item.id) {
            initParams_[name || id] = item.formItemProps.defaultValue;
          } else if (_.isObject(item.formItemProps.defaultValue)) {
            _.assign(initParams_, item.formItemProps.defaultValue);
          }
        }
      });
    } else {
      newSearchInfo = [...searchInfo];
    }
    const initValue = { ...initParams_, ...initialValues };
    // searchInitialValues=initValue;
    // const _initParams = getInitialValues(newSearchInfo);
    if (!searchInitParams.current) {
      searchInitParams.current = initValue;
    }
    return {
      queryList: newSearchInfo,
      form: searchForm,
      onSubmit: onSubmitSearchForm,
      initialValues: initValue,
    };
  };

  useMount(() => {
    const locSearchParams = getSearchParams();
    if (searchForm.current && searchForm.current.setFieldsValue) {
      searchForm.current.setFieldsValue(locSearchParams);
    }
  });

  useUpdateEffect(() => {
    if (location) {
      setSearchParams(state.params, state.pagination);
    }
  }, [JSON.stringify(state)]);
  /** 获取网格列 */
  const getTableConfig = (tableConfig: TableConfig = {}) => {
    const { getOperateColumn, mergeCol, tableKey, callback, action } = tableConfig;
    const columns = schema.getTableInfo(config, tableKey, callback, action);
    let newCol: any = [];

    columns.forEach((col: ProColumnType<any>) => {
      if (mergeCol && mergeCol[col.dataIndex || '']) {
        const temcol = mergeCol[col.dataIndex || ''];
        newCol.push({ ...col, ...temcol });
      } else {
        newCol.push({ ...col });
      }
    });

    if (getOperateColumn) {
      const opCol = getOperateColumn();
      opCol.dataIndex = OpColKey;
      newCol = newCol.concat(getOperateColumn());
    }
    const { pagination } = state;
    const _params = {
      ...searchInitParams.current,
      ...state.params,
      ...(tableConfig.defaultParams ? tableConfig.defaultParams : {}),
      // locSearchParams,
      current: pagination.current,
      size: pagination.pageSize,
    };
    let request = null;
    if (config.service?.queryPage) {
      request = config.service?.queryPage;
    }
    return {
      columns: newCol,
      params: JSON.stringify(_params) !== JSON.stringify(state.params) ? _params : state.params,
      onLoad,
      saveRef,
      size: 'small',
      pagination,
      request,
      onChange: pageChange,
      toolbar: [],
      scroll: { x: 900 },
    };
  };

  const getTable = (tableConfig?: TableConfig) => {
    const tableInfo = getTableConfig(tableConfig);

    return new TableInfo(tableInfo, config, schemaContext.tableOpColCmp, reload);
  };

  const getSearch = (searchConfig?: SearchConfig) => {
    const search = getSearchConfig(searchConfig);

    return new SearchInfo(search);
  };
  const getPageParam = () => {
    // @ts-ignore
    if (location && location.query) {
      // @ts-ignore
      return location.query;
    }
    return '';
  };
  const setParams = (_params: any) => {
    setState({
      params: _params,
    });
  };

  return {
    getSearchConfig,
    getTableConfig,
    getTable,
    bindEvent: (button: HButtonType) => {
      return bindEvent(button, config, reload);
    },
    bindEvents: (buttons: HButtonType[]) => {
      return bindEvents(buttons, config, reload);
    },
    formatUseReq: (serviceName: string) => {
      return formatUseReq(serviceName, service);
    },
    getSearch,
    getPageParam,
    setParams,
    setData,
    getData,
    data: pageData,
    reload,
  };
}
