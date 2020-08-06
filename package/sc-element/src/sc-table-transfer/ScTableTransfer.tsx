import * as React from 'react';
import { ColumnProps } from 'antd/es/table';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import ScTable from '../sc-table';
import Search from './search';
import './style';
const { useState, useCallback, useEffect } = React;

export interface DataSource {
  rows: any[];
  total: number;
  current: number;
  size: number;
}

export interface ScTableTransferfProps<T> {
  columns?: ColumnProps<T>[];
  data: DataSource;
  targetData: DataSource;
  targetType: string;
  pagination: any;
  showSearch: boolean;
  modelKey: string;
  filterOption?: (filterText: any, item: any) => boolean;
  targetKey: string;
  maxHeight: number;
  valueField: string;
  searchField: string;
  selectedKeys?: string[];
  targetKeys?: string[];
  prefixCls: string;
  remoteSearch: boolean;
  onSearchChange?: (
    direction: TransferDirection,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  value: string[];
  onChange: any;
  titles: any;
  onMove: any;
  onCustomSearch: any;
  placeholder: string;
  rowKey: string;
}

export type TransferDirection = 'left' | 'right';

const ScTableTransfer: React.FC<ScTableTransferfProps<any>> = props => {
  const {
    data = { rows: [], total: 0 },
    targetData = { rows: [], total: 0 },
    pagination = { size: 'small', hideOnSinglePage: true },
    showSearch = false,
    maxHeight = 200,
    valueField = 'key',
    searchField = 'label',
    prefixCls = 'sc-table-transfer',
    remoteSearch = true,
    onMove = (_value: any) => {
      console.log(_value);
    },
    onCustomSearch = false,
    placeholder = '',
    selectedKeys = [],
    targetKeys = [],
    value,
    onSearchChange,
    onChange,
    filterOption,
    columns,
    titles,
  } = props;

  const [state, setState] = useState({
    leftFilter: '',
    rightFilter: '',
    sourceSelectedKeys: selectedKeys.filter(
      key => targetKeys.indexOf(key) === -1,
    ),
    targetSelectedKeys: selectedKeys.filter(
      key => targetKeys.indexOf(key) > -1,
    ),
    leftData: data,
    rightData: targetData,
    leftParams: null,
    rightParams: null,
    value: value,
  });

  useEffect(() => {
    setState(oldState => ({
      ...oldState,
      ...{
        leftData: data,
      },
    }));
  }, [data]);

  useEffect(() => {
    setState(oldState => ({
      ...oldState,
      ...{
        rightData: targetData,
      },
    }));
    const _value = getValue(targetData.rows);
    triggerChange(_value);
  }, [targetData]);

  const handleLeftSelect = (selectedItems: any[]) => {
    return handleSelect('left', selectedItems);
  };
  const handleRightSelect = (selectedItems: any[]) => {
    return handleSelect('right', selectedItems);
  };

  const handleSelect = (direction: TransferDirection, selectedItems: any[]) => {
    let holder = selectedItems.map((item: any) => {
      return item && item[valueField];
    });

    if (!props.selectedKeys) {
      let key = getSelectedKeysName(direction);
      let _data: any = {};
      _data[key] = holder;
      setState(oldState => ({
        ...oldState,
        ..._data,
      }));
    }
  };

  const getValue = (_data: any[]) => {
    let selectValues: string[] = [];
    _data.forEach((item: any) => {
      selectValues.push(item[valueField]);
    });
    return selectValues;
  };

  const moveTo = (direction: TransferDirection) => {
    const {
      leftData,
      rightData,
      sourceSelectedKeys,
      targetSelectedKeys,
    } = state;

    let _leftData = { ...{}, ...leftData };
    let _rightData = { ...{}, ...rightData };

    const dataSource: any[] = [..._leftData.rows];
    const targetSource: any[] = [..._rightData.rows];

    const moveKeys =
      direction === 'right' ? sourceSelectedKeys : targetSelectedKeys;
    if (moveKeys.length) {
      const newMoveKeys = moveKeys.filter(
        (key: string) =>
          !dataSource.some(
            dataItem => !!(key === dataItem[valueField] && dataItem.disabled),
          ),
      );

      const newTargetKeys: string[] = newMoveKeys.filter(
        (key: string) =>
          !targetSource.some(
            dataItem => !!(key === dataItem[valueField] && dataItem.disabled),
          ),
      );

      let newData: any[] = [];
      let opData: any[] = direction === 'right' ? dataSource : targetSource;
      let tgData: any[] = direction === 'right' ? targetSource : dataSource;

      newTargetKeys.forEach(key => {
        const newItem = opData.find((item: any) => {
          return (
            item[valueField] === key &&
            tgData.findIndex(innerItem => innerItem[valueField] === key) === -1
          );
        });
        if (newItem) {
          newData.push(newItem);
        }
        opData.splice(
          opData.findIndex(item => item[valueField] === key),
          1,
        );
      });
      if (direction === 'right') {
        _rightData.rows = [..._rightData.rows, ...newData];
        _leftData.rows = opData;
      } else {
        _leftData.rows = [..._leftData.rows, ...newData];
        _rightData.rows = opData;
      }
      // const oppositeDirection = direction === 'right' ? 'left' : 'right'

      setState(oldState => ({
        ...oldState,
        ...{
          sourceSelectedKeys: [],
          targetSelectedKeys: [],
          rightData: _rightData,
          leftData: _leftData,
          value: getValue(_rightData.rows),
        },
      }));
      triggerChange(value);
      onMove(value);
    }
  };

  const moveToLeft = () => moveTo('left');
  const moveToRight = () => moveTo('right');
  const handleLeftFilter = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleFilter('left', e);
  const handleRightFilter = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleFilter('right', e);
  const handleFilter = (
    direction: TransferDirection,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (onCustomSearch) {
      onCustomSearch(direction, e.target.value);
      setState(oldState => ({
        ...oldState,
        ...{
          [`${direction}Filter`]: e.target.value,
        },
      }));
      return;
    }
    let params: any = null;
    if (onSearchChange) {
      params = onSearchChange(direction, e);
    }
    setState(oldState => ({
      ...oldState,
      ...{
        [`${direction}Filter`]: e.target.value,
        [`${direction}Params`]: params,
      },
    }));
  };
  const handleLeftClear = () => handleClear('left');
  const handleRightClear = () => handleClear('right');
  const handleClear = useCallback((direction: string) => {
    setState(oldState => ({
      ...oldState,
      ...{
        [`${direction}Filter`]: '',
      },
    }));
  }, []);
  const triggerChange = useCallback(
    (changedValue: any) => {
      if (onChange) {
        onChange(changedValue);
      }
    },
    [onChange],
  );

  const getFilterdData = () => {
    let { leftData, rightData, leftFilter, rightFilter } = state;
    if (remoteSearch) {
      return { leftData, rightData };
    }

    const _leftData = { ...{}, ...leftData };
    const _rightData = { ...{}, ...rightData };
    const dataSource: any[] = [..._leftData.rows];
    const targetSource: any[] = [..._rightData.rows];

    let letfFilterData: any[] = dataSource;
    let rightFilterData: any[] = targetSource;

    if (leftFilter && leftFilter.trim()) {
      letfFilterData = dataSource
        .map((item: any) => {
          if (!matchFilter(item[searchField], item, leftFilter)) {
            return null;
          }
          return item;
        })
        .filter((item: any) => {
          return item;
        });
    }

    if (rightFilter && rightFilter.trim()) {
      rightFilterData = targetSource
        .map((item: any) => {
          if (!matchFilter(item[searchField], item, rightFilter)) {
            return null;
          }
          return item;
        })
        .filter((item: any) => {
          return item;
        });
    }
    _leftData.rows = letfFilterData;
    _rightData.rows = rightFilterData;

    return { leftData: _leftData, rightData: _rightData };
  };

  const matchFilter = useCallback(
    (text: string, item: any, filter: string) => {
      if (filterOption) {
        return filterOption(filter, item);
      }
      return text.indexOf(filter) >= 0;
    },
    [filterOption],
  );

  const getSelectedKeysName = (direction: TransferDirection) => {
    return direction === 'left' ? 'sourceSelectedKeys' : 'targetSelectedKeys';
  };

  const {
    sourceSelectedKeys,
    targetSelectedKeys,
    leftFilter,
    rightFilter,
    leftParams,
    rightParams,
  } = state;
  let filterData: any = getFilterdData();
  let pri_leftPrams = null,
    pri_rightParams = null;
  if (remoteSearch) {
    pri_leftPrams = leftParams;
    pri_rightParams = rightParams;
  }
  const { leftData, rightData } = filterData;
  const leftSearch = showSearch ? (
    <div className={`${prefixCls}-search-wrapper`}>
      <Search
        prefixCls={`${prefixCls}-search`}
        onChange={handleLeftFilter}
        handleClear={handleLeftClear}
        value={leftFilter}
        placeholder={placeholder}
      />
    </div>
  ) : null;
  const rightSearch = showSearch ? (
    <div className={`${prefixCls}-search-wrapper`}>
      <Search
        prefixCls={`${prefixCls}-search`}
        onChange={handleRightFilter}
        handleClear={handleRightClear}
        value={rightFilter}
      />
    </div>
  ) : null;
  const leftTitle =
    titles && titles[0] ? (
      <div className={`${prefixCls}-title`}>{titles[0]}</div>
    ) : null;
  const rightTitle =
    titles && titles[1] ? (
      <div className={`${prefixCls}-title`}>{titles[1]}</div>
    ) : null;

  return (
    <div className={`${prefixCls}`}>
      <div className={`${prefixCls}-list`} style={{ height: 'auto' }}>
        {leftTitle}
        {leftSearch}
        <ScTable
          params={pri_leftPrams}
          autoload={true}
          selectedRowKeys={sourceSelectedKeys}
          pagination={pagination}
          data={leftData}
          columns={columns}
          onSelectRow={handleLeftSelect}
          scroll={{ y: maxHeight }}
          checkbox={true}
        />
      </div>
      <div className={'sc-table-transfer-operation'}>
        <Button
          type="primary"
          size="small"
          icon={<LeftOutlined />}
          onClick={moveToLeft}
        ></Button>
        <Button
          type={'primary'}
          size="small"
          icon={<RightOutlined />}
          onClick={moveToRight}
        ></Button>
      </div>
      <div className={'sc-table-transfer-list'} style={{ height: 'auto' }}>
        {rightTitle}
        {false ? rightSearch : null}
        <ScTable
          params={pri_rightParams}
          autoload={true}
          selectedRowKeys={targetSelectedKeys}
          pagination={pagination}
          onSelectRow={handleRightSelect}
          data={rightData}
          columns={columns}
          checkbox={true}
        />
      </div>
    </div>
  );
};

export default ScTableTransfer;
