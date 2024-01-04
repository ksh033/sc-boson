/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-underscore-dangle */
import { useRequest, useSafeState, useSetState, useUpdateEffect } from 'ahooks';
import type { TablePaginationConfig } from 'antd';
import { Card, Divider, Table, Tooltip } from 'antd';
import * as React from 'react';
import useDeepCompareEffect from '../_util/useDeepCompareEffect';
import type { DropDataType } from './components/DraggableBodyRow/common';
import { moveRowData } from './components/DraggableBodyRow/common';
import Toolbar from './components/ToolBar';
import type { SortValueList } from './container';
import Container from './container';
import { genColumnKey, genColumnList, tableColumnSort } from './utils';
import isArray from 'lodash/isArray';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableBodyRow from './components/DraggableBodyRow';
import DraggableBodyCell from './components/DraggableBodyRow/DraggableBodyCell';
import { useRefFunction } from '../_util/useRefFunction';
import type { ActionType, ScTableProps, SorterItem } from './typing';
import type { FilterValue, TableCurrentDataSource } from 'antd/es/table/interface';
import { changeCountSort } from './countSort';

const { useEffect, useRef, useMemo } = React;

const ScTable: React.FC<ScTableProps<any>> = (props: ScTableProps<any>) => {
  const {
    data,
    columns: propsColumns = [],
    rowKey = 'key',
    prefixCls = 'sc-table',
    className = '',
    checkbox = false,
    rowSelection = { type: 'checkbox' },
    request,
    preLoadHandle,
    onLoad,
    onSelectRow,
    selectedRowKeys,
    saveRef,
    rowSelected = true,
    pagination,
    toolBarRender,
    options = false,
    headerTitle,
    style = {},
    scroll,
    tooltip,
    toolbar,
    cardProps,
    cardBordered = false,
    onChange,
    autoHeight = true,
    dragSort = false,
    multipleSort = true,
    dataSource: newdataSource,
    onRow,
    treeDataIndex,
    refresh,
    onDrop,
    //columnsState,
    components: componentsProps,
    ...restPros
  } = props;

  const { selectedRows, params = null, pageSize = 20, autoload = false } = restPros;
  const counter = Container.useContainer();

  const tableDomRef = useRef<HTMLDivElement>(null);


  const containerContext = useContext(ContainerContext) || {}
  const [autoHeightConfig, setAutoHeightConfig] = useState<{
    init: boolean,
    height?: number,
    scrollY?: number
  }>({ init: false })
  /** 创建排序的参数 */
  const createOrderParams = (sorterMap: SorterItem) => {
    const list: SortValueList[] = [];
    Object.keys(sorterMap).forEach((item: string) => {
      list.push({
        dataIndex: item,
        ...sorterMap[item],
      });
    });

    list.sort((a, b) => a.multiple - b.multiple);

    return list.map((item: SortValueList) => {
      return { column: item.dataIndex, asc: item.value === 'ascend' };
    });
  };
  /** 覆盖远程请求参数 */
  const remoteParams = useMemo(() => {
    const nparams = JSON.parse(JSON.stringify(params));
    if (nparams && nparams.size && nparams.current) {
      delete nparams.size;
      delete nparams.current;
    }

    if (counter.sortOrderMap) {
      if (nparams) {
        nparams.orders = createOrderParams(counter.sortOrderMap);
      }
    }

    return nparams;
  }, [JSON.stringify(params), JSON.stringify(counter.sortOrderMap)]);

  const newParams = Object.assign({}, remoteParams);

  const isGone = useRef(false);
  const { loading, runAsync } = useRequest<any, any>(
    request || emptyRequest
    ,
    {

      manual: true,
    },
  );
  const [dataSource, setDataSource] = useSafeState<any>(data || newdataSource);
  const [rowKeys, setRowKeys] = useSafeState(selectedRowKeys || []);
  const [rows, setRows] = useSafeState<any[]>(selectedRows || []);

  const [updateSource, setUpdateSource] = useSafeState<boolean>(false);

  const [innerPagination, setPagination] = useSetState<TablePaginationConfig>({
    current: 1,
    pageSize: pageSize,
  });

  const action = useRef<any>({
    rowKeys: rowKeys || [],
    rows: rows || [],
  });
  /** 表格每一行数据的key的集合 */
  const dataKeys = useRef<Set<any>>(new Set([]));
  /** 获取表格key的集合 */
  const getDataKeys = useRefFunction((_data: any[]) => {
    const dataKey = _data.map((item) => item[rowKey]);
    dataKeys.current = new Set(dataKey);
  });
  /** 表格拖拽重新计算表格数据 */
  const moveRow = (dropData: DropDataType) => {

    if (dropData.dragId === dropData.dropId)
      return;
    const moveResult = moveRowData(dataSource, dropData, rowKey);
    if (onDrop) {
      const retVal = onDrop(moveResult.dargNode, moveResult.dataSource, dataSource);
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
  /** 远程请求 */
  const loadData = async () => {
    if (counter.whetherRemote) {
      const { _filters, ...restParams } = newParams;
      const payload = {
        size: innerPagination.pageSize || pageSize,
        current: innerPagination.current || 1,
        ..._filters,
        ...restParams,
      };
      let flag = true;
      if (preLoadHandle) {
        flag = await preLoadHandle?.(payload);
      }
      if (flag) {
        let _data = await runAsync(payload);
        if (isGone.current) return;
        if (_data) {
          if (onLoad) {
            _data = onLoad(_data);
          }
          setDataSource(_data);
          if (Array.isArray(_data)) {
            getDataKeys(_data);
          } else {
            getDataKeys(_data.rows || []);
          }
        }
      }
    }
  };
  /** 选择框的默认属性配置 */
  const getCheckboxProps = useMemo(() => {
    if (rowSelection.getCheckboxProps) {
      return rowSelection.getCheckboxProps;
    }
    return (record: any) => ({
      disabled: record.disabled,
    });
  }, [rowSelection.getCheckboxProps]);

  /** 远程请求选中项发生变化时数据处理 */
  const changeRowSelect = useRefFunction((_rowKeys: string[], rrows: any[] = []) => {
    let nrows = [...(action.current.rows || [])];
    const map = new Map<string, any>();

    rrows.forEach((item) => {
      if (item != null) {
        map.set(item[rowKey], item);
      }
    });
    nrows = _rowKeys.map((key) => map.get(key));
    const _rows = nrows.filter((it) => it != null);
    if (onSelectRow) {
      // 过滤不可选择的数据
      const crows = _rows
        .filter((it) => it != null)
        .filter((item) => {
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
  });
  /** 选中项发生变化时的回调 */
  const handleRowSelectChange = useRefFunction((_rowKeys: string[], _rows: any[] = []) => {
    if (rowSelection?.type === 'radio') {
      changeRowSelect(_rowKeys, _rows);
      return;
    }
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
      crowKeys = Array.from(srowKeys);
      const map = new Map<string, any>();

      [...crows, ..._rows].forEach((item) => {
        if (item != null) {
          map.set(item[rowKey], item);
        }
      });
      crows = crowKeys.map((key) => map.get(key));
      changeRowSelect(crowKeys, crows);
    }
  });
  /** SaveRef数据 */
  const updateAction = () => {
    const userAction: ActionType = {
      pagination: innerPagination,
      data: dataSource,
      selectedRowKeys: action.current.rowKeys || rowKeys,
      selectedRows: action.current.rows || rows,
      reload: () => {
        loadData();
      },
      setFiltersArg: counter.setFiltersArg,
      setSortOrderMap: counter.setSortOrderMap,
      getSortOrders: () => {
        return createOrderParams(counter.sortOrderMap);
      },
      defaultSorterMap: counter.defaultSorterMap,
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

    return userAction;
  };

  if (saveRef && typeof saveRef === 'function') {
    saveRef(updateAction());
  }
  if (saveRef && typeof saveRef !== 'function') {
    saveRef.current = updateAction();
  }
  console.log("containerContext", containerContext)

  const autoTableHeight = (paginationHeight: number) => {


    let containerType: string | undefined = "page"

    let relativeDom: HTMLElement = document.body;

    let extraHeight = 0;


    if (containerContext) {
      containerType = containerContext.type
      if (containerContext.domRef && containerContext.domRef.current) {
        relativeDom = containerContext.domRef.current
        extraHeight = containerContext.extraHeight || 0
      }
    }


    if (!autoHeightConfig.init && !scroll?.y) {
      //alue.pageContainer.current
      const thead = tableDomRef.current?.getElementsByClassName('ant-table-thead')[0];
      const pagefooterList = document.body.getElementsByClassName("ant-pro-layout-has-footer");

      let relativeRect = relativeDom.getBoundingClientRect();
      // const pagination= tableDomRef.current?.getElementsByClassName('ant-pagination')[0];
      const react = thead?.getBoundingClientRect();
      if (react?.bottom) {
        if (pagefooterList.length > 0) {
          const footStyle = getComputedStyle(pagefooterList[0])
          console.log("footStyle", footStyle)

        }

        const height = relativeRect.height - (react?.bottom - relativeRect.top) - extraHeight;
        if (height > 0) {
          const scrollY = height - (paginationHeight) - react.height
          setAutoHeightConfig({ init: true, height, scrollY: scrollY })
        }


      }

    }

  }
  /** 绑定 action ref */
  React.useImperativeHandle(saveRef, updateAction);

  useEffect(() => {
    if (!Array.isArray(newParams.orders)) {
      if (counter.defaultSorterMap && JSON.stringify(counter.defaultSorterMap) !== '{}') {
        newParams.orders = createOrderParams(counter.defaultSorterMap);
      }
    }
    if (data) {
      getDataKeys(data.rows || []);
    }
    if (autoload) {
      loadData();
    }
    let pagination = 56
    let observer: any = null;
    if (autoHeight === true) {
      if (props.pagination === false) {
        pagination = 0;
      }
      autoTableHeight(pagination);
      //@ts-ignore
      let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
      if (tableDomRef.current?.parentNode) {
        observer = new MutationObserver((mutationList) => {
          if (mutationList.length > 0) {
            //@ts-ignore
            const dom: any = tableDomRef.current?.getElementsByClassName('ant-table-wrapper')[0]
            dom.style["height"] = ''
            autoTableHeight(pagination)
          }

        })
        observer.observe(tableDomRef.current?.parentNode, { characterData: true, childList: true })
      }
    }

    const reszieFn = () => {
      autoTableHeight(pagination)
    }
    window.addEventListener('resize', reszieFn)

    return () => {
      if (observer) {
        observer.disconnect()
      }
      window.removeEventListener('resize', reszieFn)
      isGone.current = true;
    };
  }, []);




  /** 监听远程请求数据变化 */
  useUpdateEffect(() => {
    if (innerPagination && Number(innerPagination.current || 0) > 1) {
      setPagination({
        ...innerPagination,
        current: 1,
      });
    } else {
      loadData();
    }
  }, [JSON.stringify(remoteParams)]);
  /** 监听外部传入的分页数据变化 */
  useEffect(() => {
    if (pagination && Object.prototype.toString.call(pagination) === '[object Object]') {
      setPagination(pagination);
    }
  }, [JSON.stringify(pagination)]);
  /** 监听内部分页数据变化 */
  useUpdateEffect(() => {
    if (innerPagination.current && innerPagination.pageSize) {
      loadData();
    }
  }, [innerPagination.current, innerPagination.pageSize]);
  /** 监听外部表格数据变化 */
  useUpdateEffect(() => {
    if (data) {
      setDataSource(data);
    }
  }, [data]);
  /** 监听内部表格数据变化 */
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

  /** 表格排序监听 */
  const handleTableChange = useRefFunction(
    (
      _pagination: TablePaginationConfig,
      _filtersArg: Record<string, FilterValue | null>,
      _sorter: any,
      extra: TableCurrentDataSource<any>,
    ) => {
      console.log('_sorter_sorter', _sorter);
      if (_pagination && _pagination.current && _pagination.pageSize) {
        setPagination({
          current: _pagination.current,
          pageSize: _pagination.pageSize,
        });
      }
      // 计算排序
      const obj = changeCountSort(_sorter, counter.sortOrderMap);

      counter.setFiltersArg(_filtersArg);
      console.log('ordersMap', obj.ordersMap);
      counter.setSortOrderMap(obj.ordersMap);

      if (onChange) {
        onChange(_pagination, _filtersArg, obj.innerSorter, extra);
      }
    },
  );

  // ---------- 列计算相关 start  -----------------
  const tableColumn = useMemo(() => {
    const newPropsColumns = propsColumns.filter((it) => it.hidden !== true);

    const cols = genColumnList({
      columns: newPropsColumns,
      map: counter.columnsMap,
      counter,
      multipleSort,
    }).sort(tableColumnSort(counter.columnsMap));
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
  }, [propsColumns, counter, dataSource, multipleSort]);
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

  /** 表格行是否可选择 */
  const cRowSelection = useMemo(() => {
    return checkbox
      ? {
        selectedRowKeys: rowKeys,
        onChange: handleRowSelectChange,
        ...rowSelection,
        getCheckboxProps,
      }
      : undefined;
  }, [JSON.stringify(rowKeys), handleRowSelectChange, getCheckboxProps, rowSelection]);

  /** 点击行选中处理 */
  const handleRowSelect = useRefFunction((record: any) => {
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
  });

  // const findRow = (id: any) => {
  //   const { row, index, parentIndex } = findFromData(dataSource, id, rowKey);
  //   return {
  //     row,
  //     rowIndex: index,
  //     rowParentIndex: parentIndex
  //   };
  // };
  /** 表格参数 */
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
    } else {
      paginationProps = {
        ...paginationProps,
        ...innerPagination,
      };
    }

    _row.forEach((it: any, index: number) => {
      if (request == null) {
        it.key = index;
      } else {
        if (paginationProps) {
          it.key =
            (Number(paginationProps.current || 1) - 1) * Number(paginationProps.pageSize || 10) +
            index +
            1;
        } else {
          it.key = index;
        }
      }
    });

    const key = rowKey || 'key';
    let components = componentsProps;
    if (dragSort) {
      components = {
        body: {
          row: DraggableBodyRow,
          cell: DraggableBodyCell,
        },
      };
    }

    const newStyle: any = { ...style };
    const newScroll = { ...scroll }

    if (autoHeight) {
      if (!newStyle.height) {
        newStyle.height = autoHeightConfig.height

      }
      if (!newStyle.y) {
        newScroll.y = autoHeightConfig.scrollY
      }
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

      style: newStyle,
      scroll: newScroll,
      loading,
      rowKey: key,
      rowSelection: cRowSelection,
      dataSource: _row,
      columns,
      pagination: paginationProps,
      components,
      size: counter.tableSize,
      onChange: handleTableChange,
      ...restPros,
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
    <div className={prefixCls + ' ' + className} ref={tableDomRef}>
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
