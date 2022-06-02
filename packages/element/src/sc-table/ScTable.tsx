/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-underscore-dangle */
import * as React from 'react';
import type { CardProps } from 'antd';
import { Table, Tooltip, Divider, Card } from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd/es/table/Table';
import { useUpdateEffect, useRequest, useSetState } from 'ahooks';
import type { OptionConfig, ToolBarProps } from './components/ToolBar';
import Toolbar from './components/ToolBar';
import Container from './container';
import type { ListToolBarProps } from './components/ListToolBar';
import { genColumnList, tableColumnSort, genColumnKey } from './utils';
import useDeepCompareEffect from '../_util/useDeepCompareEffect';
import type { ColumnType } from 'antd/es/table';
import type { FilterValue, TableCurrentDataSource } from 'antd/es/table/interface';
import type { DropDataType } from './components/DraggableBodyRow/common';
import { moveRowData } from './components/DraggableBodyRow/common';

import isArray from 'lodash/isArray';
import DraggableBodyRow from './components/DraggableBodyRow';
import DraggableBodyCell from './components/DraggableBodyRow/DraggableBodyCell';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

const { useState, useEffect, useRef, useMemo } = React;
export type { ColumnsType } from 'antd/es/table/Table';

export interface CustomSearchComponentProps {
  value?: any;
  onChange?: (e: any) => void;
}

export declare type CustomSearchComponent =
  | React.ReactNode
  | ((props: CustomSearchComponentProps) => React.ReactNode);
export interface ScProColumnType<RecordType> extends ColumnType<RecordType> {
  canSearch?: boolean;
  customSearchComponent?: CustomSearchComponent;
  /** @deprecated 你可以使用 tooltip，这个更改是为了与 antd 统一 */
  tip?: string;
  /** @deprecated 是否隐藏 */
  hidden?: boolean;
}

export interface ScProColumnGroupType<RecordType>
  extends Omit<ScProColumnType<RecordType>, 'dataIndex'> {
  children: ScProColumn<RecordType>;
}

export declare type ScProColumn<RecordType = unknown> = (
  | ScProColumnGroupType<RecordType>
  | ScProColumnType<RecordType>
)[];

export interface ScTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  onSelectRow?: (selectedRowKeys: string[], selectedRows: any[]) => void; // 当选中时触发
  data?: { rows: any[]; total: number; current: number; size: number }; // 列表数据
  request?: (params: any) => Promise<any>; // 请求数据的远程方法
  onLoad?: (data: any) => any; // 数据加载完成后触发,会多次触发
  refresh?: () => void; // 点击刷新数据
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
  getRecord?: (record: any, selected: any, _selectedRows: any, nativeEvent: any) => any; // 获取选中行的表单对象
  rowSelected?: boolean; // 列选中
  onCustomRow?: (record: any, index: number) => any; // 自定义行事件为了合并现有的方法
  /** @name 渲染操作栏 */
  toolBarRender?: ToolBarProps<T>['toolBarRender'] | false;
  /** @name 左上角的 title */
  headerTitle?: React.ReactNode;
  /** @name 操作栏配置 */
  options?: OptionConfig | false;
  /** @name 标题旁边的 tooltip */
  tooltip?: string;
  /** @name ListToolBar 的属性 */
  toolbar?: ListToolBarProps;
  /** @name 查询表单和 Table 的卡片 border 配置 */
  cardBordered?: boolean;
  /** @name table 外面卡片的设置 */
  cardProps?: CardProps;
  /** @name table 列属性 */
  columns?: ScProColumn<T>;
  treeDataIndex?: string;
  onDrop?: (dargNode: any) => Promise<any> | boolean | void;
  dragSort?: boolean | string;
}

const ScTable: React.FC<ScTableProps<any>> = (props: ScTableProps<any>) => {
  const {
    data,
    columns: propsColumns = [],
    rowKey = 'key',
    prefixCls = 'sc-table',
    className = '',
    checkbox = false,
    rowSelection = { type: 'checkbox' },
    getRecord,
    request,
    onLoad,
    onSelectRow,
    selectedRowKeys,
    saveRef,
    rowSelected = true,
    onCustomRow,
    pagination,
    toolBarRender,
    options = false,
    headerTitle,
    tooltip,
    toolbar,
    cardProps,
    cardBordered = false,
    onChange,
    dragSort = false,
    dataSource: newdataSource,
    onRow,
    treeDataIndex,
    refresh,
    onDrop,
    ...restPros
  } = props;

  const { selectedRows, params = null, pageSize = 10, autoload = false } = restPros;

  const newParams = useMemo(() => {
    const nparams = JSON.parse(JSON.stringify(params));
    if (nparams && nparams.size && nparams.current) {
      delete nparams.size;
      delete nparams.current;
    }

    return nparams;
  }, [JSON.stringify(params)]);

  const counter = Container.useContainer();

  const isGone = useRef(false);
  const { loading, run } = useRequest(
    request ||
      new Promise((resolve) => {
        resolve(null);
      }),
    {
      manual: true,
    },
  );
  const [dataSource, setDataSource] = useState<any>(data || newdataSource);
  const [rowKeys, setRowKeys] = useState(selectedRowKeys || []);
  const [rows, setRows] = useState<any[]>(selectedRows || []);

  const [updateSource, setUpdateSource] = useState<boolean>(false);

  const [innerPagination, setPagination] = useSetState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });

  const action = useRef<any>({
    rowKeys: rowKeys || [],
    rows: rows || [],
  });

  const dataKeys = useRef<Set<any>>(new Set([]));

  const getDataKeys = (_data: any[]) => {
    const dataKey = _data.map((item) => item[rowKey]);
    dataKeys.current = new Set(dataKey);
  };
  const moveRow = (dropData: DropDataType) => {
    const moveResult = moveRowData(dataSource, dropData, rowKey);
    if (onDrop) {
      const retVal = onDrop(moveResult.dargNode);
      if (retVal !== undefined) {
        if (typeof retVal === 'boolean') {
          if (retVal === true) {
            setDataSource(moveResult.dataSource);
          }
        } else if (retVal.then) {
          retVal.then(() => {
            setDataSource(moveResult.dataSource);
          });
        }
      }
    } else {
      setDataSource(moveResult.dataSource);
    }
  };
  const loadData = async () => {
    if (counter.whetherRemote) {
      const { _filters, ...restParams } = newParams;
      const payload = {
        size: innerPagination.pageSize || pageSize,
        current: innerPagination.current || 1,
        ..._filters,
        ...restParams,
      };
      let _data = await run(payload);
      if (isGone.current) return;
      if (_data) {
        if (onLoad) {
          _data = onLoad(_data);
        }
        setDataSource(_data);
        getDataKeys(_data.rows || []);
      }
    }
  };

  const getCheckboxProps = useMemo(() => {
    if (rowSelection.getCheckboxProps) {
      return rowSelection.getCheckboxProps;
    }
    return (record: any) => ({
      disabled: record.disabled,
    });
  }, [rowSelection.getCheckboxProps]);

  const changeRowSelect = (_rowKeys: string[], _rows: any[] = []) => {
    if (onSelectRow) {
      // 过滤不可选择的数据
      const crows = _rows.filter((item) => {
        let checkConfig: any = { disabled: false };
        if (typeof getCheckboxProps === 'function') {
          checkConfig = getCheckboxProps(item);
        }
        if (checkConfig?.disabled) {
          return false;
        }
        return true;
      });

      let crowKeys = crows.map((item) => item[`${rowKey}`]);
      crowKeys = [...new Set(crowKeys)];

      onSelectRow(crowKeys, crows);
    }
    action.current = {
      rowKeys: _rowKeys,
      rows: _rows,
    };
    setRowKeys(_rowKeys);
    setRows(_rows);
  };

  const handleRowSelectChange = (_rowKeys: string[], _rows: any[] = []) => {
    const _dataKeys = dataKeys.current;
    let crowKeys = [...(action.current.rowKeys || [])];
    let crows = [...(action.current.rows || [])];
    if (pagination === false || request === undefined || request === null) {
      changeRowSelect(_rowKeys, _rows);
    } else {
      // 先过滤掉当前有数据的选择项
      crowKeys = crowKeys.filter((item) => !_dataKeys.has(item));
      crows = crows.filter((item) => !_dataKeys.has(item[rowKey]));

      crowKeys = [...crowKeys, ..._rowKeys].filter((item) => item !== undefined && item !== null);
      const srowKeys = new Set(crowKeys);
      crows = [...crows, ..._rows].filter(
        (item) => item !== undefined && item !== null && srowKeys.has(item[rowKey]),
      );

      changeRowSelect(crowKeys, crows);
    }
  };

  const userAction = {
    pagination: innerPagination,
    data: dataSource,
    selectedRowKeys: action.current.rowKeys || rowKeys,
    selectedRows: action.current.rows || rows,
    reload: () => {
      loadData();
    },
    setFiltersArg: counter.setFiltersArg,
    setSortOrderMap: counter.setSortOrderMap,
    columnsMap: counter.columnsMap,
    getColumnsMap: () => {
      return counter.columnsMap;
    },
    clearRowKeys: () => {
      action.current = {
        rowKeys: [],
        rows: [],
      };
      setRowKeys([]);
      setRows([]);
      if (onSelectRow) {
        onSelectRow([], []);
      }
    },
  };

  if (saveRef) {
    // @ts-ignore
    saveRef.current = userAction;
  }

  /** 绑定 action ref */
  React.useImperativeHandle(
    saveRef,
    () => {
      return userAction;
    },
    [],
  );

  useEffect(() => {
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
    if (innerPagination && Number(innerPagination.current || 0) > 1) {
      setPagination({
        ...innerPagination,
        current: 1,
      });
    } else {
      loadData();
    }
  }, [JSON.stringify(newParams)]);

  useEffect(() => {
    if (pagination && Object.prototype.toString.call(pagination) === '[object Object]') {
      setPagination(pagination);
    }
  }, [pagination]);

  useUpdateEffect(() => {
    if (innerPagination.current && innerPagination.pageSize) {
      loadData();
    }
  }, [innerPagination.current, innerPagination.pageSize]);

  useUpdateEffect(() => {
    if (data) {
      setDataSource(data);
    }
  }, [data]);

  useUpdateEffect(() => {
    if (newdataSource && updateSource === false) {
      setDataSource(newdataSource);
    } else {
      if (updateSource) {
        setUpdateSource(false);
      }
    }
  }, [newdataSource]);

  //外部选中更新
  useUpdateEffect(() => {
    if (selectedRowKeys) {
      setRowKeys(selectedRowKeys);
      action.current.rowKeys = selectedRowKeys;
    }
    if (selectedRows) {
      setRows(selectedRows);
      action.current.rows = selectedRows;
    }
  }, [selectedRowKeys]);

  const handleTableChange = (
    _pagination: TablePaginationConfig,
    _filtersArg: Record<string, FilterValue | null>,
    _sorter: any,
    extra: TableCurrentDataSource<any>,
  ) => {
    if (_pagination && _pagination.current && _pagination.pageSize) {
      setPagination({
        current: _pagination.current,
        pageSize: _pagination.pageSize,
      });
    }

    counter.setFiltersArg(_filtersArg);
    const ordersMap = {};
    if (Array.isArray(_sorter)) {
      _sorter.forEach((it) => {
        ordersMap[it.field] = it.order;
      });
    }
    if (Object.prototype.toString.call(_sorter) === '[object Object]' && _sorter !== null) {
      const { field, order } = _sorter;
      ordersMap[field] = order;
    }
    counter.setSortOrderMap(ordersMap);

    if (onChange) {
      onChange(_pagination, _filtersArg, _sorter, extra);
    }
  };

  // ---------- 列计算相关 start  -----------------
  const tableColumn = useMemo(() => {
    const newPropsColumns = propsColumns.filter((it) => it.hidden !== true);

    const cols = genColumnList({
      columns: newPropsColumns,
      map: counter.columnsMap,
      counter,
    }).sort(tableColumnSort(counter.columnsMap));
    // .map(({ onCell, ...props }: any) => {
    //   props.onCell = (record: any, rowIndex: any) => {
    //     let colProp = onCell && onCell(record, rowIndex);
    //     if (!colProp) {
    //       colProp = {};
    //     }
    //     if (dragSort) {
    //       colProp = {
    //         ...colProp,
    //         record,
    //         rowIndex,
    //         moveRow: moveRow,
    //         index: rowIndex,
    //         treeDataIndex,
    //         dataIndex: props.dataIndex,
    //       };
    //     }
    //     return colProp;
    //   };
    //   return props;
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (treeDataIndex) {
      cols.find((col) => {
        if (col.dataIndex === treeDataIndex) {
          col.onCell = (record: any, rowIndex: any): any => {
            return {
              record,
              rowIndex,
              moveRow: moveRow,
              index: rowIndex,
              treeDataIndex,
              rowKey,
              dataIndex: col.dataIndex,
            };
          };
        }
      });
    }

    return cols;
  }, [propsColumns, counter, dataSource]);
  /** Table Column 变化的时候更新一下，这个参数将会用于渲染 */

  useDeepCompareEffect(() => {
    if (tableColumn && tableColumn.length > 0) {
      // 重新生成key的字符串用于排序
      const columnKeys = tableColumn.map((item) => genColumnKey(item.key, item.index));
      counter.setSortKeyColumns(columnKeys);
    }
  }, [tableColumn]);
  const columns = useMemo(() => {
    const filterCols = tableColumn.filter((item) => {
      // 删掉不应该显示的
      const columnKey = genColumnKey(item.key, item.index);
      const config = counter.columnsMap[columnKey];
      if (config && config.show === false) {
        return false;
      }
      return true;
    });

    return filterCols;
  }, [counter.columnsMap, tableColumn, dragSort]);

  const cRowSelection = useMemo(() => {
    return checkbox
      ? {
          selectedRowKeys: rowKeys,
          onChange: handleRowSelectChange,
          onSelect: (record: any, selected: any, _selectedRows: any, nativeEvent: any) => {
            if (getRecord) {
              getRecord(record, selected, _selectedRows, nativeEvent);
            }
          },
          ...rowSelection,
          getCheckboxProps,
        }
      : undefined;
  }, [JSON.stringify(rowKeys), handleRowSelectChange, getRecord, getCheckboxProps, rowSelection]);

  const handleRowSelect = (record: any) => {
    let checkConfig: any = { disabled: false };
    if (typeof getCheckboxProps === 'function') {
      checkConfig = getCheckboxProps(record);
    }
    if (checkConfig?.disabled) {
      return;
    }
    const key = record[rowKey];
    let _rowKeys = [...(action.current.rowKeys || [])];
    let _rows = [...(action.current.rows || [])];
    if (key !== undefined && key !== null) {
      if (rowSelection?.type === 'radio') {
        _rowKeys = [key];
        _rows = [record];
      }
      if (rowSelection?.type === 'checkbox') {
        const index = _rowKeys.findIndex((item) => item === key);
        if (index > -1) {
          _rowKeys = _rowKeys.filter((item) => {
            return item !== key;
          });
          _rows = _rows.filter((item) => {
            return item[rowKey] !== key;
          });
        } else {
          _rowKeys = _rowKeys.concat(key);
          _rows = _rows.concat(record);
        }
      }
    }
    changeRowSelect(_rowKeys, _rows);
  };

  // const findRow = (id: any) => {
  //   const { row, index, parentIndex } = findFromData(dataSource, id, rowKey);
  //   return {
  //     row,
  //     rowIndex: index,
  //     rowParentIndex: parentIndex
  //   };
  // };
  const tableProp: any = () => {
    let _row = [];
    let total = 0;
    if (dataSource) {
      if (isArray(dataSource)) {
        total = dataSource.length;
        _row = dataSource;
      } else {
        total = dataSource.total || 0;
        _row = dataSource.rows || dataSource;
      }
    }

    _row.forEach((it: any, index: number) => {
      it.key = index;
    });

    let paginationProps: any = {
      showSizeChanger: true,
      showQuickJumper: true,
      total,
      showTotal: (rowTotal: any, range: any[]) => {
        return (
          <span>
            <Tooltip placement="top" title="刷新">
              <a
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  refresh?.();
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
    } else if (Object.prototype.toString.call(pagination) === '[object Object]') {
      paginationProps = {
        ...paginationProps,
        ...pagination,
      };
    } else {
      paginationProps = {
        ...paginationProps,
        ...innerPagination,
      };
    }

    const key = rowKey || 'key';
    let components = null;
    if (dragSort) {
      components = {
        body: {
          row: DraggableBodyRow,
          cell: DraggableBodyCell,
        },
      };
    }
    return {
      onRow: (record: any, index: number) => {
        let result: any = onRow && onRow(record, index);
        if (result === undefined || result === null) {
          result = {};
        }
        if (result && rowSelected && checkbox) {
          const customClick = result.onClick;
          result.onClick = (event: any) => {
            event.stopPropagation(); // 阻止合成事件间的冒泡
            if (typeof customClick === 'function') {
              customClick(event);
            }
            handleRowSelect(record);
          }; // 点击行
        }

        let onRowProps = result;
        if (dragSort) {
          onRowProps = {
            ...onRowProps,
            record,
            index,
            treeDataIndex,
            moveRow,
            // findRow,
            rowKey,
          };
        }
        return onRowProps;
      },

      loading,
      rowKey: key,
      rowSelection: cRowSelection,
      dataSource: _row,
      columns,
      pagination: paginationProps,
      ...restPros,
      components,
      size: counter.tableSize,
      onChange: handleTableChange,
    };
  };

  const toolbarDom = React.useMemo(() => {
    // 不展示 toolbar
    if (toolBarRender === false) {
      return null;
    }
    if (options === false && !headerTitle && !toolBarRender && !toolbar) {
      return null;
    }
    /** 根据表单类型的不同决定是否生成 toolbarProps */
    const toolbarProps = toolbar;

    return (
      <Toolbar
        tooltip={tooltip}
        columns={tableColumn || []}
        options={options}
        headerTitle={headerTitle}
        action={saveRef}
        // onSearch={rows}
        selectedRows={selectedRows}
        selectedRowKeys={rowKeys}
        toolBarRender={toolBarRender}
        toolbar={toolbarProps}
      />
    );
  }, [tooltip, saveRef, headerTitle, options, rows, rowKeys, tableColumn, toolBarRender, toolbar]);
  counter.setAction(saveRef?.current);
  counter.propsRef.current = props;

  /** Table 区域的 dom，为了方便 render */
  const tableAreaDom = (
    <Card
      bordered={cardBordered}
      style={{
        height: '100%',
        padding: 0,
      }}
      bodyStyle={
        toolbarDom
          ? {
              paddingTop: 0,
              paddingBottom: 0,
            }
          : {
              padding: 0,
            }
      }
      {...cardProps}
    >
      {toolbarDom}

      <Table {...tableProp()} />
    </Card>
  );
  return (
    <div className={prefixCls + className}>
      <DndProvider backend={HTML5Backend}>{tableAreaDom}</DndProvider>
    </div>
  );
};

/**
 * 🏆 Use Ant Design Table like a Pro! 更快 更好 更方便
 *
 * @param props
 */
const ProviderWarp = <T extends Record<string, any>>(props: ScTableProps<T>) => {
  return (
    <Container.Provider initialState={props}>
      <ScTable {...props} />
    </Container.Provider>
  );
};
export default ProviderWarp;
