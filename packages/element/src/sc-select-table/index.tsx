/* eslint-disable react-hooks/exhaustive-deps */
import type { FC } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useMemo, useState } from 'react';
import ScSelect from '../sc-select';
import ScTable from '../sc-table';
import type { ScSelectProps } from '../sc-select';
import type { ScTableProps } from '../sc-table/ScTable';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import type { CheckboxProps } from 'antd/es/checkbox';

export interface AreaDataProps {
  areaCode: string;
  areaLevel: string;
  areaName: string;
}

export type ScSelectTableProps = ScSelectProps & {
  dropdownRenderProps: ScTableProps<any>;
  getCheckboxProps?: (record: any) => Partial<Omit<CheckboxProps, 'checked' | 'defaultChecked'>>;
};

const ScSelectTable: FC<ScSelectTableProps> = (props) => {
  const {
    dropdownRenderProps,
    onLoad,
    mode,
    textField = 'text',
    valueField = 'value',
    labelInValue = true,
    value,
    getCheckboxProps = (record: any) => ({
      disabled: record.disabled || false,
    }),
    ...restProps
  } = props;

  const [cvalue, setValue] = useMergedState<any>(() => props.value, {
    value: props.value,
    onChange: props.onChange,
  });

  const [dropdownOpen, setOpen] = useState<boolean>(false);

  const [dataSource, setDataSource] = useState(props.data || []);
  const [currentRowKey, setCurrentRowKey] = useState<any>('');

  const effectiveData = useMemo(() => {
    if (Array.isArray(dataSource)) {
      return dataSource.filter((it) => {
        const disabled = getCheckboxProps(it).disabled;
        return !disabled;
      });
    }
    return [];
  }, [JSON.stringify(dataSource), getCheckboxProps]);

  const initCurrentRowKeys = (list: any) => {
    if (Array.isArray(list)) {
      const newList = list.filter((it) => {
        const disabled = getCheckboxProps(it).disabled;
        return !disabled;
      });
      if (newList.length > 0) {
        setCurrentRowKey(newList[0][valueField]);
      }
    }
  };

  const action = useRef<any>({
    rowKeys: [],
    rows: [],
  });

  const type = useMemo(() => {
    return mode === 'multiple' || mode === 'tags' ? 'checkbox' : 'radio';
  }, [mode]);

  useEffect(() => {
    if (!props.request && Array.isArray(props.data) && props.data.length > 0) {
      initCurrentRowKeys(props.data);
      setDataSource(props.data || []);
    }
  }, [JSON.stringify(props.data)]);

  const getType = (val: any) => {
    return Object.prototype.toString.call(val);
  };

  const handleRowSelect = (record: any) => {
    if (getType(record) === '[object Object]') {
      const key = record[valueField] || record.value;
      let _rowKeys = [...(action.current.rowKeys || [])];
      let _rows = [...(action.current.rows || [])];
      if (key !== undefined && key !== null) {
        if (type === 'radio') {
          _rowKeys = [key];
          _rows = [record];
        }
        if (type === 'checkbox') {
          let checkConfig: any = { disabled: false };
          if (typeof getCheckboxProps === 'function') {
            checkConfig = getCheckboxProps(record);
          }
          if (checkConfig?.disabled) {
            return;
          }
          const index = _rowKeys.findIndex((item) => item === key);
          if (index > -1) {
            _rowKeys = _rowKeys.filter((item) => {
              return item !== key;
            });
            _rows = _rows.filter((item) => {
              return item[valueField] !== key;
            });
          } else {
            _rowKeys = _rowKeys.concat(key);
            _rows = _rows.concat(record);
          }
        }
      }
      action.current = {
        rowKeys: _rowKeys,
        rows: _rows,
      };
    }
  };

  const getRecord = (key: any) => {
    if (Array.isArray(dataSource) && dataSource.length > 0) {
      const item = dataSource.find((it) => it[valueField] === key);
      return item;
    }
    return null;
  };

  useEffect(() => {
    if (props.value !== undefined && props.value !== null) {
      const typeValue = getType(props.value);
      if (typeValue === '[object Object]') {
        const key = props.value[valueField] || props.value.value;
        handleRowSelect(getRecord(key));
      }
      if (typeValue === '[object String]' || typeValue === '[object Number]') {
        handleRowSelect(getRecord(props.value));
      }
      if (typeValue === '[object Array]' && props.value.length > 0) {
        if (labelInValue) {
          props.value.forEach((it: any) => {
            const key = it[valueField] || it.value;
            handleRowSelect(getRecord(key));
          });
        } else {
          props.value.forEach((it: any) => {
            handleRowSelect(getRecord(it));
          });
        }
      }
    }
  }, [JSON.stringify(props.value), labelInValue]);

  const handleLoad = (cdata: any) => {
    let rdata: any = cdata;
    if (onLoad) {
      rdata = onLoad(cdata);
    }
    if (Array.isArray(rdata)) {
      initCurrentRowKeys(rdata);
      setDataSource(rdata);
      return rdata;
    } else {
      setDataSource([]);
      return [];
    }
  };

  const newValue = useMemo(() => {
    if (labelInValue && Object.prototype.toString.call(cvalue) === '[object Object]') {
      return {
        value: cvalue[valueField],
        label: cvalue[textField],
        ...cvalue,
      };
    }
    return cvalue;
  }, [JSON.stringify(cvalue), labelInValue]);

  const onDropdownVisibleChange = (open: boolean) => {
    setOpen(open);
  };

  const getRowKey = (currentIndex: number, nextIndex: number) => {
    const maxIndex = effectiveData.length - 1;
    let newNextIndex = nextIndex;
    if (nextIndex <= maxIndex && nextIndex >= 0) {
      newNextIndex = nextIndex;
    } else {
      if (nextIndex < 0) {
        newNextIndex = maxIndex;
      } else if (nextIndex > maxIndex) {
        newNextIndex = 0;
      }
    }
    const item = effectiveData[newNextIndex];
    setCurrentRowKey(item[valueField]);
  };

  const onInputKeyDown = (event: any) => {
    const { key } = event;
    if (currentRowKey && currentRowKey !== '') {
      const currentIndex = effectiveData.findIndex((it) => it[valueField] === currentRowKey);
      if (key === 'ArrowDown') {
        getRowKey(currentIndex, currentIndex + 1);
      }
      if (key === 'ArrowUp') {
        getRowKey(currentIndex, currentIndex - 1);
      }
      if (key === 'Enter') {
        const record = getRecord(currentRowKey);
        setValue(record);
        setOpen(false);
        handleRowSelect(record);
      }
    }
  };

  const onClear = () => {
    setValue(null);
    initCurrentRowKeys(dataSource);
    action.current = {
      rowKeys: [],
      rows: [],
    };
  };

  return (
    <ScSelect
      {...restProps}
      valueField={valueField}
      textField={textField}
      value={newValue}
      onLoad={handleLoad}
      labelInValue={labelInValue}
      open={dropdownOpen}
      onDropdownVisibleChange={onDropdownVisibleChange}
      onInputKeyDown={onInputKeyDown}
      onClear={onClear}
      dropdownRender={() => {
        return (
          <ScTable
            {...dropdownRenderProps}
            dataSource={dataSource}
            pagination={false}
            size="small"
            checkbox
            rowKey={valueField}
            rowClassName={(record) => {
              const key = record[valueField] || '';
              const index = action.current.rowKeys.indexOf(key);
              return key === currentRowKey && index === -1 ? 'sc-select-table-item-active' : '';
            }}
            onRow={(record: any) => {
              return {
                onClick: (event: any) => {
                  // 阻止合成事件间的冒泡
                  event.stopPropagation();
                  const config = getCheckboxProps(record);
                  if (!config.disabled) {
                    setValue(record);
                    setOpen(false);
                    handleRowSelect(record);
                  }
                },
              };
            }}
            rowSelection={{
              type: type,
              selectedRowKeys: action.current.rowKeys,
              // renderCell: () => {
              //   return null;
              // },
              getCheckboxProps,
              ...dropdownRenderProps.rowSelection,
            }}
          />
        );
      }}
    />
  );
};

export default ScSelectTable;
