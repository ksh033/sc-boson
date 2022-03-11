/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from 'react';
import ScTable from '../sc-table';

import type { TransferProps } from 'antd/es/transfer';
import type { TransferListBodyProps } from 'antd/es/transfer/ListBody';
import type { TransferDirection } from 'antd/es/transfer';

import { Transfer } from 'antd';
import Search from './search';

import difference from 'lodash/difference';
import isArray from 'lodash/isArray';

import { useSetState } from 'ahooks';
import type { ScTableProps } from '../sc-table';
import type { ScSearchBarProps } from '../sc-search-bar';
import ScSearchBar from '../sc-search-bar';
import './style';

export type DataSource =
  | {
      rows: any[];
      total: number;
      current: number;
      size: number;
    }
  | any[];

type ScSearchBarType = Omit<ScSearchBarProps, 'queryList'> & {
  queryList: any[];
};

export interface ScTableTransferfProps<T>
  extends Omit<TransferProps<T>, 'dataSource' | 'rowKey' | 'onChange' | 'filterOption'> {
  leftTable: ScTableProps<T>;
  rightTable: ScTableProps<T>;
  rowKey?: string;
  dataSource?: DataSource;
  targetDataSource?: any[];
  targetKeys?: string[];
  lefteSearch?: ScSearchBarType;
  filterOption?: (inputValue: string, item: any, direction: TransferDirection) => boolean;

  searchField?: string;
  onChange?: (changeData: {
    nextTargetKeys: string[];
    direction: string;
    moveKeys: string[];
    targetDataSource: any[];
  }) => void;
  prefixCls?: string;
}

export interface ScTableTransferfState {
  targetKeys: string[];
  dataSource: any[];
  targetDataSource: any[];
  total: number;
  leftFilterValue: string;
  rightFilterValue: string;
}
const ScTableTransfer: React.FC<ScTableTransferfProps<any>> = (props) => {
  const [state, setState] = useSetState<ScTableTransferfState>({
    targetKeys: [],
    total: 0,
    targetDataSource: [],
    dataSource: [],
    leftFilterValue: '',
    rightFilterValue: '',
  });
  const {
    leftTable,
    rightTable,
    dataSource,
    rowKey = 'key',
    targetKeys,
    showSearch,
    lefteSearch,
    filterOption,
    onChange,
    targetDataSource,
    searchField = 'label',
    prefixCls = 'sc-table-transfer',
    ...restProps
  } = props;
  const setDataSouce = (data?: DataSource) => {
    if (data) {
      if (isArray(data)) {
        setState({ dataSource: data, total: data.length });
      } else {
        setState({ dataSource: data.rows, total: data.total || data.rows.length });
      }
    }
  };

  const setTargetKeys = (keys: any, tdataSource?: any[]) => {
    if (tdataSource) {
      const tkeys = tdataSource.map((item) => item[rowKey]);

      setState({ targetKeys: tkeys, targetDataSource });
    } else if (keys) {
      setState({ targetKeys: keys });
    }
  };
  useEffect(() => {
    setTargetKeys(targetKeys, targetDataSource);
  }, [targetKeys, targetDataSource]);

  useEffect(() => {
    // updateAction();
    setDataSouce(dataSource);
  }, []);

  useEffect(() => {
    // updateAction();
    setDataSouce(dataSource);
  }, [dataSource]);

  const selectedChange = (nextTargetKeys: string[], direction: string, moveKeys: string[]) => {
    let changData: any[] = [];
    if (direction === 'right') {
      // state.targetKeys?.includes(item[rowKey])
      const selectDatas = state.dataSource?.filter((item) => {
        return moveKeys.includes(item[rowKey]);
      });
      changData = [...state.targetDataSource, ...selectDatas];
    } else {
      const selectDatas = state.targetDataSource?.filter((item) => {
        return nextTargetKeys.includes(item[rowKey]);
      });
      changData = selectDatas;
    }

    setState({ targetKeys: nextTargetKeys, targetDataSource: changData });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onChange && onChange({ nextTargetKeys, direction, moveKeys, targetDataSource: changData });
  };

  const matchFilter = useCallback(
    (text: string, item: any, filter: string, direction: TransferDirection) => {
      if (filterOption) {
        return filterOption(filter, item, direction);
      }
      return text.indexOf(filter) >= 0;
    },
    [filterOption],
  );

  const getFilterdData = (direction: string) => {
    const {
      dataSource: leftDataSource,
      targetDataSource: rightDataSouce,
      leftFilterValue,
      rightFilterValue,
    } = state;

    let filterData = [];
    if (direction === 'right') {
      filterData = rightDataSouce;
      if (rightFilterValue && rightFilterValue.trim()) {
        filterData = filterData.filter((item: any) => {
          return matchFilter(item[searchField] || '', item, rightFilterValue, direction);
        });
      }
    } else if (direction === 'left') {
      filterData = leftDataSource;
      if (leftFilterValue && leftFilterValue.trim()) {
        filterData = filterData.filter((item: any) => {
          return matchFilter(item[searchField] || '', item, leftFilterValue, direction);
        });
      }
    }
    return filterData;
  };

  const handleFilter = (direction: TransferDirection, e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ [`${direction}FilterValue`]: e.target.value });
  };

  const handleClear = useCallback((direction: TransferDirection) => {
    setState({ [`${direction}FilterValue`]: '' });
  }, []);
  const handleLeftClear = () => handleClear('left');
  const handleRightClear = () => handleClear('right');

  const rightSearchCmp = showSearch ? (
    <div className={`${prefixCls}-search-wrapper`}>
      <Search
        prefixCls={`ant-transfer-list-search`}
        onChange={(e) => {
          handleFilter('right', e);
        }}
        handleClear={handleRightClear}
        value={state.rightFilterValue}
      />
    </div>
  ) : null;
  const leftSearchCmp =
    showSearch && !lefteSearch ? (
      <div className={`${prefixCls}-search-wrapper`}>
        <Search
          prefixCls={`${prefixCls}-search`}
          onChange={(e) => {
            handleFilter('right', e);
          }}
          handleClear={handleLeftClear}
          value={state.leftFilterValue}
        />
      </div>
    ) : null;

  return (
    <div className={`${prefixCls}`}>
      <Transfer
        {...restProps}
        showSearch={!lefteSearch && showSearch}
        dataSource={state.dataSource}
        rowKey={(record) => record[rowKey]}
        targetKeys={state.targetKeys}
        showSelectAll={false}
        onChange={selectedChange}
      >
        {(renderProps: TransferListBodyProps<any>) => {
          const {
            direction,
            // dataSource,
            onItemSelectAll,
            onItemSelect,
            selectedKeys: listSelectedKeys,
            disabled: listDisabled,
          } = renderProps;
          let tableProps = {};

          let search = null;
          const rowSelection: any = {
            type: 'checkbox',
            getCheckboxProps: (item: any) => ({ disabled: listDisabled || item.disabled }),
            onSelectAll(selected: any, selectedRows: any) {
              const treeSelectedKeys = selectedRows
                .filter((item: any) => item)
                .filter((item: any) => !item.disabled)
                .map((record: any) => record[rowKey]);
              const diffKeys = selected
                ? difference(treeSelectedKeys, listSelectedKeys)
                : difference(listSelectedKeys, treeSelectedKeys);
              onItemSelectAll(diffKeys, selected);
            },
            onSelect(record: any, selected: any) {
              const key = record[rowKey];

              onItemSelect(key, selected);
            },
            selectedRowKeys: listSelectedKeys,
          };

          if (direction === 'left') {
            let filterData = [];
            let { total } = state;

            filterData = getFilterdData(direction);
            filterData = filterData?.map((item) => ({
              ...item,
              disabled: state.targetKeys?.includes(item[rowKey]),
            }));
            if (!lefteSearch) {
              total = filterData.length;
            }

            rowSelection.selectedRowKeys = listSelectedKeys;
            if (showSearch) {
              search = lefteSearch ? <ScSearchBar lightFilter {...lefteSearch} /> : leftSearchCmp;
            }
            getFilterdData(direction);
            tableProps = {
              ...leftTable,
              rowKey,
              onSelectRow: () => {},
              data: {
                rows: filterData,
                total,
              },
              pagination: { ...leftTable.pagination, simple: true,onChange:function(){
                onItemSelectAll(listSelectedKeys, false);
              } },
              onLoad: leftTable.request
                ? (data: any) => {
                    if (data && data.rows) {
                      setState({ dataSource: data.rows, total: data.total });
                    }
                    return [];
                  }
                : null,
            };
          }
          if (direction === 'right') {
            search = showSearch ? rightSearchCmp : null;

            const filterData = getFilterdData(direction);
            tableProps = {
              ...rightTable,
              rowKey,
              pagination: { pageSize: 10, simple: true },
              data: {
                rows: filterData,
                total: filterData.length,
              },
            };
          }

          return (
            <div>
              {search}
              <ScTable
                {...tableProps}
                style={{ width: 'inherit' }}
                rowSelection={rowSelection}
                // dataSource={filteredItems}
                // pagination={direction === "left" ? pagination : true}
                size="small"
                scroll={undefined}
                checkbox
                // style={{ pointerEvents: listDisabled ? 'none' : null }}
                onRow={(rowData: any) => ({
                  onClick: () => {
                    const { disabled: itemDisabled } = rowData;
                    const key = rowData[rowKey];

                    if (itemDisabled || listDisabled) return;
                    onItemSelect(key, !listSelectedKeys.includes(key));
                  },
                })}
              />
            </div>
          );
        }}
      </Transfer>
    </div>
  );
};

export default ScTableTransfer;
