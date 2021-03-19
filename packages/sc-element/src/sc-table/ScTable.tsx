import * as React from 'react';
import { Table, Tooltip, Divider } from 'antd';
import { TableProps, TablePaginationConfig } from 'antd/lib/table/Table';
import { useUpdateEffect, useRequest } from '@umijs/hooks';
const { useState, useEffect, useRef } = React;

export interface ScTableProps<T> extends TableProps<T> {
  onSelectRow?: (selectedRowKeys: string[], selectedRows: any[]) => void; // 当选中时触发
  data?: { rows: any[]; total: number; current: number; size: number }; // 列表数据
  request?: (params: any) => Promise<any>; // 请求数据的远程方法
  onLoad?: (data: any) => any; // 数据加载完成后触发,会多次触发
  params?: any; // 请求的参数
  prefixCls?: string; // 表格容器的 class 名
  className?: string; // 样式
  pageSize?: number; // 每页显示多少数据
  autoload?: boolean; // 是否自动加载 配合request使用
  checkbox?: boolean; // 是否显示多选框
  rowKey?: string; // 数据中哪个值作为选中的key
  selectedRowKeys?: string[]; // 选中的key
  selectedRows?: any[]; // 选中的对象
  pagination?: false | TablePaginationConfig;
  saveRef?: any; // React.MutableRefObject<any> | ((saveRef: any) => void) 获取组件对外暴露的参数
  getRecord?: Function; // 获取选中行的表单对象
  rowSelected?: boolean; // 列选中
  onRowSelect?: (record: any) => void;
  onCustomRow?: (record: any, index: number) => {}; // 自定义行事件为了合并现有的方法
}

const getValue = (obj: any) =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const ScTable: React.FC<ScTableProps<any>> = (props: ScTableProps<any>) => {
  const {
    data,
    columns,
    rowKey = 'key',
    prefixCls = 'sc-table',
    className = '',
    checkbox = false,
    rowSelection = { type: 'checkbox' },
    getRecord,
    request,
    onLoad,
    onSelectRow,
    selectedRowKeys = [],
    saveRef,
    rowSelected = true,
    onCustomRow,
    onRowSelect,
    pagination,
    ...restPros
  } = props;

  const {
    selectedRows = [],
    params = null,
    pageSize = 10,
    autoload = false,
  } = restPros;
  const isGone = useRef(false);
  const { loading, run } = useRequest(
    request ||
      new Promise((resolve, reject) => {
        resolve(null);
      }),
    {
      manual: true,
    },
  );
  const [dataSource, setDataSource] = useState(data);
  const [rowKeys, setRowKeys] = useState(selectedRowKeys || []);
  const [rows, setRows] = useState<any[]>(selectedRows || []);
  const [innerPagination, setPagination] = useState({
    current: data ? data.current : 1,
    pageSize,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState({});

  const action = useRef<any>({
    rowKeys: selectedRowKeys || [],
    rows: selectedRows || [],
  });

  const getDataKeys = (_data: any[]) => {
    const dataKey = _data.map(item => item[rowKey]);
    dataKeys.current = new Set(dataKey);
  };

  const dataKeys = useRef<Set<any>>(new Set([]));

  const loadData = async () => {
    const { current, pageSize } = innerPagination;

    const payload = {
      size: pageSize,
      current,
      ...params,
      ...filters,
      ...sorter,
    };
    if (!request) {
      throw 'no remote request method';
    }

    let _data = await run(payload);
    if (isGone.current) return;
    if (_data) {
      if (onLoad) {
        _data = onLoad(_data);
      }
      setDataSource(_data);
      getDataKeys(_data.rows || []);
    }
  };

  const handleRowSelectChange = (_rowKeys: string[], _rows: any[] = []) => {
    const _dataKeys = dataKeys.current;

    let crowKeys = [...(action.current.rowKeys || [])];
    let crows = [...(action.current.rows || [])];
    // 先过滤掉当前有数据的选择项
    crowKeys = crowKeys.filter(item => !_dataKeys.has(item));
    crows = crows.filter(item => !_dataKeys.has(item[rowKey]));

    crowKeys = [...crowKeys, ..._rowKeys].filter(
      item => item !== undefined && item !== null,
    );
    const srowKeys = new Set(crowKeys);
    crows = [...crows, ..._rows].filter(
      item => item !== undefined && item !== null && srowKeys.has(item[rowKey]),
    );

    changeRowSelect(crowKeys, crows);
  };

  const changeRowSelect = (_rowKeys: string[], _rows: any[] = []) => {
    if (onSelectRow) {
      onSelectRow(_rowKeys, _rows);
    }
    action.current = {
      rowKeys: _rowKeys,
      rows: _rows,
    };
    setRowKeys(_rowKeys);
    setRows(_rows);
  };

  const updateAction = () => {
    const userAction = {
      pagination: innerPagination,
      data: dataSource,
      selectedRowKeys: action.current.rowKeys || rowKeys,
      selectedRows: action.current.rows || rows,
      reload: () => {
        loadData();
      },
    };
    if (saveRef && typeof saveRef === 'function') {
      saveRef(userAction);
    }
    if (saveRef && typeof saveRef !== 'function') {
      saveRef.current = userAction;
    }
  };

  useEffect(() => {
    updateAction();
    if (data) {
      getDataKeys(data.rows || []);
    }
    if (autoload) {
      loadData();
    }
    return () => {
      isGone.current = true;
    };
  }, []);

  useUpdateEffect(() => {
    if (innerPagination.current > 1) {
      setPagination({
        ...innerPagination,
        current: 1,
      });
    } else {
      loadData();
    }
  }, [params]);

  useUpdateEffect(() => {
    loadData();
  }, [innerPagination.current, innerPagination.pageSize]);

  useUpdateEffect(() => {
    if (data) {
      setDataSource(data);
    }
  }, [data]);

  const handleTableChange = (
    _pagination: any,
    _filtersArg: any,
    _sorter: any,
    extra: { currentDataSource: []; action: any },
  ) => {
    const _filters = Object.keys(_filtersArg).reduce(
      (obj: any, key: string) => {
        const newObj = { ...obj };
        if (_filtersArg[key]) {
          newObj[key] = getValue(_filtersArg[key]);
        }
        return newObj;
      },
      {},
    );
    setPagination(_pagination);
    setFilters(_filters);
    setSorter(_sorter);
  };

  const handleRowSelect = (record: any) => {
    const key = record[rowKey];
    let _rowKeys = [...(action.current.rowKeys || [])];
    let _rows = [...(action.current.rows || [])];
    if (key !== undefined && key !== null) {
      if (rowSelection?.type === 'radio') {
        _rowKeys = [key];
        _rows = [record];
      }
      if (rowSelection?.type === 'checkbox') {
        const index = _rowKeys.findIndex(item => item === key);
        if (index > -1) {
          _rowKeys = _rowKeys.filter(item => {
            return item !== key;
          });
          _rows = _rows.filter(item => {
            return item[rowKey] !== key;
          });
        } else {
          _rowKeys = _rowKeys.concat(key);
          _rows = _rows.concat(record);
        }
      }
    }
    changeRowSelect(_rowKeys, _rows);
    onRowSelect && onRowSelect(record);
  };

  const tableProp: any = () => {
    let _row = [];
    let total = 0;
    if (dataSource) {
      total = dataSource.total || 0;
      _row = dataSource.rows || [];
    }

    _row.forEach((item: any, index: number) => {
      item.key = index;
    });

    let paginationProps: any = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...innerPagination,
      total,
      showTotal: (rowTotal: any, range: any[]) => {
        return (
          <span>
            <Tooltip placement="top" title="刷新">
              <a
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  loadData();
                }}
              >
                刷新
              </a>
            </Tooltip>
            <Divider type="vertical" />
            {`共${rowTotal}条记录,当前${range[0]}-${range[1]}条`}
          </span>
        );
      },
    };

    if (pagination === false) {
      paginationProps = false;
    } else {
      paginationProps = {
        ...paginationProps,
        ...pagination,
      };
    }

    const _rowSelection = checkbox
      ? {
          selectedRowKeys: rowKeys,
          onChange: handleRowSelectChange,
          getCheckboxProps: (record: any) => ({
            disabled: record.disabled,
          }),
          onSelect: (
            record: any,
            selected: any,
            _selectedRows: any,
            nativeEvent: any,
          ) => {
            if (getRecord) {
              getRecord(record, selected, _selectedRows, nativeEvent);
            }
          },
          ...rowSelection,
        }
      : undefined;

    const key = rowKey || 'key';
    updateAction();
    return {
      onRow: (record: any, index: number) => {
        let result: any = onCustomRow && onCustomRow(record, index);
        if (result === undefined || result === null) {
          result = {};
        }
        if (result && rowSelected && checkbox) {
          result['onClick'] = (event: any) => {
            // 阻止合成事件间的冒泡
            event.stopPropagation();
            handleRowSelect(record);
          }; // 点击行
        }
        return {
          ...result,
        };
      },
      loading,
      rowKey: key,
      rowSelection: _rowSelection,
      dataSource: dataSource ? dataSource.rows : dataSource,
      columns,
      pagination: paginationProps,
      onChange: handleTableChange,
      ...restPros,
    };
  };

  return (
    <div className={prefixCls + className}>
      <Table {...tableProp()} />
    </div>
  );
};
export default ScTable;
