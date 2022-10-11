/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-underscore-dangle */
import { useOutletContext ,useLocation} from '@umijs/renderer-react';
import { useMount, useSetState, useUnmount, useUpdateEffect } from 'ahooks';
import assign from 'lodash/assign';
import isObject from 'lodash/isObject';
import type { Location } from "history";

import { useRef } from 'react';
import { useSchemaContext } from '../context';
import type { Result } from '../event/BindEventUtil';
import { bindEvent, bindEvents, formatUseReq,setHistory } from '../event/BindEventUtil';
import type { FormSearchItem, HButtonType, ProColumn, ProColumnType } from '../interface';
import { PageConfig, PageType } from '../interface';
import type { SearchInfoProps } from '../page/SearchInfo';
import SearchInfo from '../page/SearchInfo';
import type { TableInfoProps } from '../page/TableInfo';
import TableInfo from '../page/TableInfo';
import schema from '../pageConfigUitls';

export { PageConfig, PageType };
export { setLocalSearchParams };
export interface SearchConfig {
  tableKey?: string;

  /** 直接合并不行时使用此方法 */
  callback?: ((column: FormSearchItem) => void) | undefined;
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
  bindEvent: (button: HButtonType) => HButtonType;
  /** 批量绑定默认事件 */
  bindEvents: (buttons: HButtonType[]) => HButtonType[];
  /** 获取useRequest */
  formatUseReq: <R = any, P extends any[] = any>(serviveName: string) => Result<R, P> | null;

  setParams: (value: any) => void;
  getPageParam: () => any;

  setData: (data: Partial<S>) => any;
  getData: (key: keyof S) => Partial<S>;
  data: S;
  // reload: () => void;
  reload: () => void;
}

const setLocalSearchParams = (key: string | number, params: any) => {
  const searchParam = JSON.parse(sessionStorage.getItem('SEARCH_PARAMS') || '{}');
  const oldParams = searchParam[key] || {};
  searchParam[key] = {
    ...oldParams,
    ...(params || {}),
  };
  sessionStorage.setItem('SEARCH_PARAMS', JSON.stringify(searchParam));
};

export default function ListPage<S>(config: PageConfig, props: any): UseListPageProp<S> {
  const { service, pageType = 'listpage' } = config;
  
 //let location:Location;
 const layoutContext = useOutletContext<any>();
 console.log(layoutContext)
 const {location}=layoutContext
//  try{

//        location=useLocation()
//     }catch(ex){
//         // @ts-ignore
//       location=window.location
      
//     }
  // 查询表单
  const searchForm = useRef<any>();
  // 查询表格保存表单
  const saveRef = useRef<any>();

  const filterRef = useRef<any>({});
  const ordersRef = useRef<any>({});
  const submitRef = useRef<any>({});
  const searchInitParams = useRef<any>();

  const schemaContext = useSchemaContext();
    setHistory(schemaContext.umi.history)
  const getSearchParams = () => {
    if (!location) {
      return null;
    }
    const { pathname, search } = location;
    const key = pathname + search;
    const searchParam = JSON.parse(sessionStorage.getItem('SEARCH_PARAMS') || '{}');
    return searchParam[key];
  };

  const [pageData, setPageData] = useSetState<any>({});

  const getValue = (obj: any) =>
    Object.keys(obj)
      .map((key) => obj[key])
      .join(',');

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
    if (_params && _params.current && _params.size) {
      return {
        current: _params && _params.current,
        pageSize: _params && _params.size,
      };
    }
    return null;
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
    const newParams = _params;
    newParams.orders = ordersRef.current;
    newParams._filters = filterRef.current;

    if (JSON.stringify(newParams) !== JSON.stringify(state.params)) {
      setState({
        params: _params,
        pagination: { ...state.pagination, current: 1 },
      });
    } else {
      if (state.pagination != null && state.pagination.current !== 1) {
        setState({
          pagination: { ...state.pagination, current: 1 },
        });
      } else {
        reload();
      }
    }
  };

  const onReset = (_params: any) => {
    filterRef.current = {};
    ordersRef.current = [];
    saveRef.current?.setFiltersArg({});
    saveRef.current?.setSortOrderMap({});
    onSubmitSearchForm(_params);
  };

  const pageChange = (_pagination: any, _filtersArg: any, _sorter: any) => {
    const filters = Object.keys(_filtersArg).reduce((obj: any, key: string) => {
      const newObj = { ...obj };
      if (_filtersArg[key]) {
        newObj[key] = getValue(_filtersArg[key]);
      }
      return newObj;
    }, {});

    let orders: any[] = [];
    if (Array.isArray(_sorter)) {
      _sorter.forEach((it) => {
        if (it.order) {
          orders.push({
            asc: it.order === 'ascend',
            column: it.field,
          });
        }
      });
    }
    if (Object.prototype.toString.call(_sorter) === '[object Object]' && _sorter !== null) {
      const { field, order } = _sorter;
      if (order) {
        orders = [
          {
            asc: order === 'ascend',
            column: field,
          },
        ];
      }
    }
    if (JSON.stringify(orders) !== JSON.stringify(ordersRef.current)) {
      ordersRef.current = orders;
      onSubmitSearchForm({
        ...state.params,
        orders,
      });
    }
    if (JSON.stringify(filters) !== JSON.stringify(filterRef.current)) {
      filterRef.current = filters;
      onSubmitSearchForm({
        ...state.params,
        _filters: filters,
      });
    }
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
          } else if (isObject(item.formItemProps.defaultValue)) {
            assign(initParams_, item.formItemProps.defaultValue);
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
      onReset,
      submitRef,
      initialValues: initValue,
    };
  };

  const initFiltersArg = (vals: any) => {
    if (vals && vals._filters) {
      const { _filters } = vals;
      const newFiltersArg = Object.keys(_filters).reduce((obj: any, key: string) => {
        const newObj = { ...obj };
        if (_filters[key]) {
          newObj[key] = [_filters[key]];
        }
        return newObj;
      }, {});
      filterRef.current = vals._filters;
      saveRef.current?.setFiltersArg(newFiltersArg);
    } else {
      filterRef.current = {};
    }
  };

  const initSorter = (vals: any) => {
    if (vals && Array.isArray(vals.orders) && vals.orders.length > 0) {
      const { orders } = vals;
      const newOrderMap = {};
      orders.forEach((obj: any) => {
        newOrderMap[obj.column] = obj.asc ? 'ascend' : 'descend';
      });
      ordersRef.current = vals.orders;
      saveRef.current?.setSortOrderMap(newOrderMap);
    } else {
      ordersRef.current = [];
      saveRef.current?.setSortOrderMap({});
    }
  };

  const searchEvent = (event: any) => {
    if (event && event.target) {
      const { key, target } = event;
      if (target.nodeName === 'INPUT') {
        if (key === 'Enter') {
          if (submitRef.current && submitRef.current.click) {
            submitRef.current.click();
          }
        }

        if (event.stopPropagation) {
          event.stopPropagation();
        }
      }
    }
  };
  useMount(() => {
    const locSearchParams = getSearchParams();
    initSorter(locSearchParams);
    initFiltersArg(locSearchParams);

    if (searchForm.current && searchForm.current.setFieldsValue) {
      searchForm.current.setFieldsValue(locSearchParams);
    }
    const [pageCon] = document.getElementsByClassName('ant-pro-page-container');
    if (pageCon && pageType === 'listpage') {
      pageCon.addEventListener('keydown', searchEvent);
    }
  });
  useUnmount(() => {
    const [pageCon] = document.getElementsByClassName('ant-pro-page-container');
    if (pageCon && pageType === 'listpage') {
      pageCon.removeEventListener('keydown', searchEvent);
    }
  });
  useUpdateEffect(() => {
    if (location) {
      setSearchParams(state.params, state.pagination);
    }
  }, [JSON.stringify(state.params), JSON.stringify(state.pagination)]);
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
      // current: pagination?.current,
      //size: pagination?.pageSize,
    };
    let request = null;
    if (config.service?.queryPage) {
      request = config.service?.queryPage;
    }
    return {
      columns: newCol,
      params: JSON.stringify(_params) !== JSON.stringify(state.params) ? _params : state.params,
      saveRef,
      size: 'small',
      pagination,
      request,
      onChange: pageChange,
      toolbar: [],
      scroll: { x: '100%' },
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
