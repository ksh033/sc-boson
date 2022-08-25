import { PlusOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import type { ButtonProps } from 'antd/es/button/index';
import type { TablePaginationConfig, TableProps } from 'antd/es/table/Table';
import React, { useImperativeHandle, useRef } from 'react';
import type { ActionType, ProTableProps } from './typing';
import { useClickAway, useCreation, useMount, useSafeState, useSetState } from 'ahooks';
import type { SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
import isObject from 'lodash/isObject';
import ScTable from '../sc-table';
import { removeDeletedData } from './utils';
import { validateRules } from './validateUtil';
import TitleSet from './titleUtil';
import { useDeepCompareEffectDebounce } from '../_util/useDeepCompareEffect';
import NeEditTableCell from './components/NeEditTableCell';
import { useRefFunction } from '../_util/useRefFunction';
import Container from './container';
import useEditableArray from './useEditableArray';
import { useForm } from 'antd/es/form/Form';
import isEqual from 'lodash/isEqual';
import omitUndefinedAndEmptyArr from '../_util/omitUndefinedAndEmptyArr';
import { getTargetElement } from 'ahooks/es/utils/dom';
// import { useWhyDidYouUpdate } from 'ahooks';
import EditableCell from './components/EditableCell';
import BatchButton from './components/BatchButton';

type TargetElement = HTMLElement | Element | Document | Window;
let targetElement: TargetElement | null | undefined = null;
export type RecordCreatorProps<T> = {
  record: T | ((index: number) => T);
  newRecordType?: 'dataSource' | 'cache';
};

/** 如果是个方法执行一下它 */
export function runFunction<T extends any[]>(valueEnum: any, ...rest: T) {
  if (typeof valueEnum === 'function') {
    return valueEnum(...rest);
  }
  return valueEnum;
}

function getTargetNode(child: any, parent: any) {
  if (child && parent) {
    let parentNode = child.parentNode;
    while (parentNode) {
      if (parent === parentNode) {
        return true;
      }
      parentNode = parentNode.parentNode;
    }
  }
  return false;
}

export type BatchOptionsType =
  | false
  | {
      allClear: boolean;
      batchSelect: boolean;
    };

const defaultBatchOptions = { allClear: true, batchSelect: true };
export type EditableProTableProps<T> = Omit<ProTableProps<T>, 'rowKey'> & {
  value?: T[];
  onChange?: (value: T[]) => void;
  /** @name 点击编辑 */
  clickEdit?: boolean;
  /** @name 点击类型 */
  clickType?: 'row' | 'cell';
  /** @name 原先的 table OnChange */
  onTableChange?: TableProps<T>['onChange'];
  /** @name 是否包含删除数据 */
  containsDeletedData?: boolean;
  /** @name 新建按钮的设置 */
  recordCreatorProps?:
    | (RecordCreatorProps<T> &
        ButtonProps & {
          creatorButtonText?: React.ReactNode;
        })
    | false;
  /** 最大行数 */
  maxLength?: number;
  /** Table 的值发生改变，为了适应 Form 调整了顺序 */
  onValuesChange?: (values: T[], record: T, index: number, changeValue: T) => void;
  rowKey?: string; // 行key
  showIndex?: boolean; // 是否显示序号
  readonly?: boolean; // 是否只读
  needDeletePopcon?: boolean; //删除时是否询问
  dragSort?: boolean | string;
  onClickEditActive?: (recordKey: any) => void;
  batchOptions?: BatchOptionsType;
};

export type ErrorLineState = {
  field: string;
  index: number;
} | null;

const defaultScroll = { x: 'max-content', y: '600px' };

const OptionsName = 'options';

const TdCell = (props: any) => {
  // 去除不必要的函数处理
  const { onMouseEnter, onContextMenu, onDoubleClick, ...restProps } = props;
  return <td {...restProps} />;
};

function EditableTable<T extends Record<string, any>>(props: EditableProTableProps<T>) {
  const {
    actionRef: propsActionRef,
    rowKey = 'rowIndex',
    columns: propsColumns,
    rowSelection: propsRowSelection = false,
    clickEdit = false,
    containsDeletedData = false,
    recordCreatorProps = false,
    maxLength,
    pagination: propsPagination,
    editable,
    showIndex = false,
    readonly = false,
    scroll,
    onClickEditActive,
    onRow,
    batchOptions = defaultBatchOptions,
    ...rest
  } = props;
  const divRef = useRef<HTMLDivElement>(null);
  const container = Container.useContainer();
  const actionRef = useRef<ActionType>();
  const valueRef = useRef<T[]>([]);
  const tableId = useRef<string>('tableForm' + Math.ceil(Math.random() * 10));
  const [innerForm] = useForm(props.editable?.form);

  // 初始化的数据
  const oldValueRef = useRef<Map<React.Key, any> | undefined>();
  const isNeCell = clickEdit === true && props.editable?.type === 'multiple';

  // 状态集合
  const [pagination, setPagination] = useSetState({ current: 1, pageSize: 50 });
  const [checkbox, setCheckbox] = useSafeState(false);
  // const [value, setValue] = useState<any[]>([]);

  const value = useCreation(() => {
    let list = props.value || [];

    if (Array.isArray(props.value)) {
      list = props.value.map((it: T, idx: number) => {
        return {
          rowIndex: `${idx}`,
          ...it,
        };
      });
    }
    return list;
  }, [props.value]);

  const setValue = (list: any[]) => {
    console.log('setValue');
    props.onChange?.(list);
  };

  // const [value, setValue] = useMergedState<T[]>(() => props.value || [], {
  //   value: props.value,
  //   onChange: props.onChange,
  //   postState: (list: T[]) => {
  //     if (Array.isArray(list)) {
  //       return list.map((it: T, idx: number) => {
  //         return {
  //           rowIndex: idx,
  //           ...it,
  //         };
  //       });
  //     }
  //     return [];
  //   },
  // });
  useDeepCompareEffectDebounce(() => {
    valueRef.current = value;
  }, [value]);

  // ============================ RowKey ============================
  const getRowKey = React.useMemo<any>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: T, index: number) => (record as any)?.[rowKey as string] ?? index;
  }, [rowKey]);

  if (oldValueRef.current === undefined) {
    if (Array.isArray(props.value) && props.value.length > 0) {
      const kvMap = new Map<React.Key, any>();
      props.value.forEach((item, index) => {
        const recordKey = `${getRowKey(item, index)}`;
        kvMap.set(recordKey, item);
      });
      oldValueRef.current = kvMap;
    }
  }

  const onTabelRow = useRefFunction((selectedRowKeys: any[], selectedRows: any[]) => {
    container.selectedRef.current = {
      selectedRowKeys,
      selectedRows,
    };
  });

  useDeepCompareEffectDebounce(() => {
    if (propsPagination && Object.prototype.toString.call(propsPagination) === '[object Object]') {
      setPagination(propsPagination);
    }
  }, [JSON.stringify(propsPagination)]);

  /* 绑定actionRef */
  if (propsActionRef) {
    if (typeof propsActionRef === 'function' && actionRef.current) {
      propsActionRef(actionRef.current);
    } else {
      // @ts-ignore
      propsActionRef.current = actionRef.current;
    }
  }

  const setRowData = useRefFunction((key: string, data: any) => {
    if (Array.isArray(value) && value.length > 0 && isObject(data)) {
      const index = value.findIndex((it) => it[rowKey] === key);
      if (index > -1) {
        const newVlaue = JSON.parse(JSON.stringify(value));
        const newItem = {
          ...newVlaue[index],
          ...data,
        };
        newVlaue.splice(index, 1, newItem);
        editable?.form?.setFieldsValue({
          [key]: newItem,
        });
        setValue(newVlaue);
      }
    }
  });

  const omitEmpty = (list: any[]) => {
    let newList = [];
    if (Array.isArray(list) && list.length > 0) {
      newList = list.map((it) => omitUndefinedAndEmptyArr(it));
    }
    return newList;
  };

  const closeSave = useRefFunction(() => {
    const newValueRef = omitEmpty(valueRef.current);
    const newValue = omitEmpty(value);
    if (!isEqual(newValueRef, newValue)) {
      setValue(newValueRef);
    }
  });
  const TableDiv = window.document.querySelectorAll(`#${tableId.current} .ant-table-container`);
  console.log('TableDiv', TableDiv);
  const tableRef: HTMLElement | null = TableDiv.length > 0 ? (TableDiv[0] as HTMLElement) : null;
  useClickAway((event) => {
    const flag = getTargetNode(event.target, document.getElementById('root'));
    if (isNeCell && flag) {
      container.closePre();
    }
  }, tableRef);

  const setDataSource = useRefFunction((_data: any[]) => {
    if (isNeCell) {
      const currentRecordKey = container.curretEdit.current?.recordKey;
      if (currentRecordKey != null && currentRecordKey !== '') {
        const index = _data.findIndex((it) => {
          const recordKey = `${getRowKey(it, index)}`;
          return recordKey === currentRecordKey;
        });
        if (index === -1) {
          container.curretEdit.current = null;
        }
      }
    }
    props.editable?.onValuesChange?.(undefined as any, _data, 0);
    setValue(_data);
  });

  /** 可编辑行的相关配置 */
  const editableUtils = useEditableArray<any>({
    ...(props.editable || {}),
    clickEdit,
    containsDeletedData,
    getRowKey,
    rowKey,
    childrenColumnName: props.expandable?.childrenColumnName,
    dataSource: value || [],
    oldKeyMap: oldValueRef.current || new Map(),
    valueRef: valueRef,
    setValueRef: (_data: any[]) => {
      valueRef.current = _data;
      // if (isNeCell) {
      //   valueRef.current = _data;
      // } else {
      //   setValue(_data);
      // }
    },
    setDataSource: setDataSource,
  });

  const userAction: any = {
    ...editableUtils,
    clearAllEditKeysAndSetOne: (recordKey: string) => {
      container.appointEditable(recordKey);
    },
    setRowData,
    validateRules: (data: any[]) => {
      if (props.columns) {
        return validateRules(props.columns, data);
      }
      return Promise.resolve(true);
    },
  };

  actionRef.current = userAction;

  /** 绑定 action ref */
  useImperativeHandle(
    propsActionRef,
    () => {
      return actionRef.current;
    },
    [],
  );

  useMount(() => {
    return () => {
      actionRef.current = undefined;
    };
  });

  const save = async (key: React.Key) => {
    try {
      const row = (await innerForm.validateFields()) as any;
      const newData = [...value];
      const index = newData.findIndex((item) => key === item[rowKey]);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...(row[key] || {}),
        });
        setValue(newData);
      } else {
        newData.push(row);
      }
      valueRef.current = newData;
      // requestAnimationFrame(() => {
      //   props.onChange?.(newData);
      // });
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  useDeepCompareEffectDebounce(() => {
    // valueRef.current = props.value || [];
    // const newValueRef = omitEmpty(props.value || []);
    // const newValue = omitEmpty(valueRef.current);
    // console.log('useDeepCompareEffectDebounce isEqual', isEqual(newValueRef, newValue));
    // if (!isEqual(newValueRef, newValue)) {
    //   setValue(props.value || []);
    // }
    if (Array.isArray(value) && value.length > 0) {
      let editList: any[] = [];
      if (isNeCell) {
        if (container.curretEdit.current != null) {
          editList = value.filter((it) => {
            return it[rowKey] === container.curretEdit.current?.recordKey;
          });
        }
      } else {
        editList = value.filter((it) => {
          return editableUtils.editableKeys.indexOf(it[rowKey]) !== -1;
        });
      }
      if (editList.length > 0) {
        let fieldsValue = {};
        editList.forEach((it: any) => {
          fieldsValue = {
            ...fieldsValue,
            [it[rowKey]]: it,
          };
        });
        innerForm.setFieldsValue(fieldsValue);
      }
    }
  }, [props.value]);

  /** 如果有 ellipsis ，设置 tableLayout 为 fixed */
  const tableLayout = props.columns?.some((item) => item.ellipsis) ? 'fixed' : 'auto';

  const editableDataSource = useRefFunction((): T[] => {
    const { defaultValue: row } = editableUtils.newLineRecord || {};

    // 如果有分页的功能，我们加到这一页的末尾
    if (pagination && pagination?.current && pagination?.pageSize) {
      return [...value].splice(pagination?.current * pagination?.pageSize - 1, 0, row);
    }
    return [...value, row];
  });

  // 统一设置
  const onTotalSetChange = useRefFunction((dataIndex: string, rvalue: any) => {
    if (props.editable?.type === 'multiple') {
      if (Array.isArray(valueRef.current) && valueRef.current.length > 0) {
        const newData = valueRef.current.map((item: any) => {
          // eslint-disable-next-line no-param-reassign
          item[dataIndex] = rvalue;
          return item;
        });
        setValue(newData);
      }
    } else {
      if (Array.isArray(value) && value.length > 0) {
        const newData = value.map((item: any) => {
          // eslint-disable-next-line no-param-reassign
          item[dataIndex] = rvalue;
          return item;
        });
        setValue(newData);
      }
    }
  });

  const hasOptions = useCreation(() => {
    const index = propsColumns?.findIndex((it) => it.dataIndex === OptionsName);
    return index != null && index > -1;
  }, [propsColumns]);

  const newPropsColumns = propsColumns?.filter((it) => it.hidden !== true) || [];
  let columns: any[] = newPropsColumns?.map((rcolumnProps) => {
    const { totalSet, ...columnProps } = rcolumnProps;
    let newFixed: any = columnProps.fixed;
    let { width } = columnProps;

    let newDataIndex: string = '';
    if (Array.isArray(columnProps.dataIndex)) {
      newDataIndex = [...columnProps.dataIndex].join('-');
    } else {
      newDataIndex = String(columnProps.dataIndex);
    }

    if (columnProps.dataIndex === OptionsName) {
      if (columnProps.fixed === undefined || columnProps.fixed === null) {
        newFixed = 'right';
      }
    }
    if (width == null) {
      width = 90;
    }
    const newColumnProps = {
      ...columnProps,
      title: TitleSet(rcolumnProps, onTotalSetChange),
      fixed: newFixed,
      width,
    };
    if (!Boolean(rcolumnProps.editable) && newDataIndex !== OptionsName) {
      return newColumnProps;
    }

    if (isNeCell) {
      if (columnProps.render || Boolean(rcolumnProps.editable)) {
        newColumnProps.shouldCellUpdate = (prevRecord: any, nextRecord: any) => {
          if (Object.prototype.toString.call(nextRecord[newDataIndex]) === '[objet Object]') {
            return !isEqual(prevRecord[newDataIndex], nextRecord[newDataIndex]);
          } else {
            return prevRecord[newDataIndex] != nextRecord[newDataIndex];
          }
        };
      }
      return {
        ...newColumnProps,
        className: newDataIndex !== OptionsName ? 'sc-cell-td' : '',
        onHeaderCell: () => {
          return {
            onClick: () => {
              if (isNeCell) {
                closeSave();
              }
            }, // 点击表头行
          };
        },
        render(val: any, record: any, index: number) {
          const recordKey = getRowKey(record, index);
          const cellProps = {
            record,
            text: val,
            recordKey: recordKey,
            index: index,
            editableUtils: editableUtils,
            columnProps: columnProps,
            dataIndex: rcolumnProps.dataIndex || '',
            editable: Boolean(rcolumnProps.editable),
            readonly: readonly,
            closeSave: closeSave,
            save: save,
            onClickEditActive: onClickEditActive,
          };
          return <NeEditTableCell {...cellProps} />;
        },
      };
    } else {
      if (rcolumnProps.dataIndex === OptionsName) {
        newColumnProps.render = (text, record, index) => {
          return columnProps?.render?.(text, record, index, {
            ...editableUtils,
          });
        };
      }
      return {
        ...newColumnProps,
        onCell: () => {
          return {
            onMouseLeave: () => {
              if (Boolean(clickEdit) === false && props.editable?.type === 'multiple') {
                closeSave();
              }
            },
          };
        },
        render(val: any, record: any, index: number) {
          const cellProps = {
            record,
            index: index,
            text: val,
            columnProps: columnProps,
            editableUtils: editableUtils,
            readonly: readonly,
          };
          return <EditableCell {...cellProps} />;
        },
      };
    }

    // if (isNeCell) {
    //   if (!Boolean(rcolumnProps.editable) && rcolumnProps.dataIndex !== 'options') {
    //     return newColumnProps;
    //   }
    //   return {
    //     ...newColumnProps,
    //     onCell: (record: any, index: number) => {
    //       const recordKey = getRowKey(record, index);
    //       return {
    //         record,
    //         recordKey: recordKey,
    //         index: index,
    //         actionRender: editableUtils.actionRender,
    //         columnProps: columnProps,
    //         dataIndex: rcolumnProps.dataIndex,
    //         editable: rcolumnProps.editable,
    //         readonly: readonly,
    //         closeSave: closeSave,
    //         save: save,
    //       };
    //     },
    //   };
    // } else {
    //   if (rcolumnProps.dataIndex === 'options') {
    //     newColumnProps.render = (text, record, index) => {
    //       return columnProps?.render?.(text, record, index, {
    //         ...editableUtils,
    //       });
    //     };
    //   }
    //   return {
    //     ...newColumnProps,
    //     onCell: (record: any, index: number) => {
    //       return {
    //         record,
    //         index: index,
    //         columnProps: columnProps,
    //         editableUtils: editableUtils,
    //         readonly: readonly,
    //       };
    //     },
    //   };
    // }
  });

  if (showIndex) {
    columns.unshift({
      dataIndex: '_rowIndex',
      title: '序号',
      width: 60,
      fixed: true,
      render: (text: any, rowData: T, index: number) => {
        if (propsPagination) {
          return (pagination.current - 1) * pagination.pageSize + index + 1;
        }
        return index + 1;
      },
    });
  }
  if (readonly) {
    columns = columns.filter((it: { dataIndex: string }) => {
      return it.dataIndex !== OptionsName;
    });
  }

  const changeEnter = useRefFunction((event: any) => {
    if (event && event.keyCode === 9) {
      event.preventDefault();
      if (event.target && event.target.nodeName === 'INPUT') {
        if (event.target.blur) {
          event.target?.blur();
        }
      }
      const dataIndex = container.curretEdit.current?.dataIndex || '';
      const recordKey = container.curretEdit.current?.recordKey || '';
      container.closePre();
      container.startNext(dataIndex, recordKey);
    }
  });

  useDeepCompareEffectDebounce(() => {
    if (divRef.current == null) return;
    targetElement = getTargetElement(divRef.current, window)!;
    if (!targetElement.addEventListener || !isNeCell) {
      return;
    }
    targetElement.addEventListener('keydown', changeEnter, false);
    return () => {
      if (targetElement != null && targetElement.removeEventListener) {
        targetElement.removeEventListener('keydown', changeEnter, false);
      }
    };
  }, [divRef.current]);

  const paginationProps = useCreation(() => {
    if (pagination) {
      return {
        total: value.length,
        showTotal: (rowTotal: any, range: any[]) => {
          return <span>{`共${rowTotal}条记录,当前${range[0]}-${range[1]}条`}</span>;
        },
        ...pagination,
      };
    }
    return false;
  }, [JSON.stringify(pagination), value.length]);

  // 分页组件切换
  const onChangeRef = useRefFunction(
    (
      _pagination: TablePaginationConfig,
      filters: Record<string, (React.Key | boolean)[] | null>,
      sorter: SorterResult<any> | SorterResult<any>[],
      extra: TableCurrentDataSource<T>,
    ) => {
      setPagination({ current: _pagination.current, pageSize: _pagination.pageSize });
      if (rest.onTableChange) {
        rest.onTableChange(_pagination, filters, sorter, extra);
      }
    },
  );

  const {
    record,
    creatorButtonText,
    newRecordType = 'dataSource',
    ...restButtonProps
  } = recordCreatorProps || {
    onClick: () => {},
  };
  // 新增一行
  const createClick = useRefFunction((e: any) => {
    const _record = runFunction(record, value.length) || {};
    actionRef?.current?.addEditRecord(_record, { newRecordType });
    restButtonProps?.onClick?.(e);
  });

  const creatorButtonDom = useCreation(() => {
    if (maxLength && maxLength <= value?.length) {
      return false;
    }
    return (
      recordCreatorProps !== false && (
        <div>
          <Button
            type="dashed"
            style={{
              display: 'block',
              margin: '10px 0',
              width: '100%',
            }}
            icon={<PlusOutlined />}
            {...restButtonProps}
            onClick={createClick}
          >
            {creatorButtonText || '添加一行数据'}
          </Button>
        </div>
      )
    );
  }, [
    maxLength,
    value?.length,
    recordCreatorProps,
    restButtonProps,
    createClick,
    creatorButtonText,
  ]);

  const dataSource: any[] = useCreation(() => {
    let tData = editableUtils.newLineRecord ? editableDataSource() : value;
    tData = removeDeletedData(tData, props.childrenColumnName || 'children', containsDeletedData);
    return tData;
  }, [
    containsDeletedData,
    editableDataSource,
    editableUtils.newLineRecord,
    props.childrenColumnName,
    value,
  ]);

  const batchButtonDom = useCreation(() => {
    return recordCreatorProps === false &&
      propsPagination !== false &&
      dataSource.length > 0 &&
      hasOptions &&
      props.editable?.type === 'multiple' ? (
      <BatchButton
        checkbox={checkbox}
        setCheckbox={setCheckbox}
        batchOptions={batchOptions}
        onDeleteByKeys={editableUtils.onDeleteByKeys}
      />
    ) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(recordCreatorProps),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(propsPagination),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(batchOptions),
    dataSource.length,
    editableUtils.onDeleteByKeys,
    hasOptions,
    props.editable?.type,
    checkbox,
  ]);

  const onValuesChange = (changedValues: any, values: any) => {
    editableUtils.onValuesChange(changedValues, values);
  };

  // const CellCom = useMemo(() => {
  //   return isNeCell ? NeEditTableCell : EditableCell;
  // }, [isNeCell]);

  // const components = useMemo(() => {
  //   return {
  //     body: {
  //       cell: CellCom,
  //     },
  //   };
  // }, [CellCom]);

  const rowSelection = useCreation(() => {
    return propsRowSelection === false ? undefined : propsRowSelection;
  }, [propsRowSelection]);

  const tableScroll = useCreation(() => {
    return scroll ? scroll : defaultScroll;
  }, [scroll]);

  // useWhyDidYouUpdate('useWhyDidYouUpdateComponent', {
  //   ...props,
  //   ...editableUtils,
  //   pagination,
  //   ...container,
  // });
  console.log('TableRender');

  return (
    <div id={tableId.current} className="sc-editable-table" ref={divRef}>
      <Form
        component={false}
        form={innerForm}
        // 这里做三次
        onValuesChange={onValuesChange}
        key="table"
      >
        <ScTable
          bordered
          checkbox={checkbox}
          {...rest}
          columns={columns}
          rowSelection={rowSelection}
          dataSource={dataSource}
          pagination={paginationProps}
          onChange={onChangeRef}
          components={{
            body: { cell: TdCell },
          }}
          rowKey={rowKey}
          size="small"
          rowSelected={false}
          tableLayout={tableLayout}
          selectedRowKeys={container.selectedRef.current.selectedRowKeys}
          rowClassName={() => 'editable-row'}
          onSelectRow={onTabelRow}
          scroll={tableScroll}
        />
        {readonly || batchOptions === false ? null : batchButtonDom}
        {readonly ? null : creatorButtonDom}
      </Form>
    </div>
  );
}

const ProviderWarp = <T extends Record<string, any>>(props: EditableProTableProps<T>) => {
  return (
    <Container.Provider initialState={props}>
      <EditableTable {...props} />
    </Container.Provider>
  );
};
export default ProviderWarp;
