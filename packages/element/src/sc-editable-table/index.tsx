/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { TableProps, TablePaginationConfig } from 'antd/es/table/Table';
import type { ProTableProps, ActionType, TableRowSelection } from './typing';
import type { ButtonProps } from 'antd/es/button/index';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import { PlusOutlined } from '@ant-design/icons';
import { Form, Button } from 'antd';

import type { SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
import { columnRender, removeDeletedData } from './utils';
import useEditableArray from './useEditableArray';
import useMountMergeState from '../_util/useMountMergeState';
import { useEventListener, useMount, useSetState, useThrottleFn } from 'ahooks';
import { validateRules } from './validateUtil';
import Container from '../sc-table/container';
import { genColumnList, tableColumnSort } from '../sc-table/utils';
import ScTable from '../sc-table';
import isObject from 'lodash/isObject';

export type RecordCreatorProps<T> = {
  record: T | ((index: number) => T);
  /**
   * 新增一行的类型
   *
   * @augments dataSource 将会新增一行数据到 dataSource 中，不支持取消，只能删除
   * @augments cache 将会把数据放到缓存中，取消后消失
   */
  newRecordType?: 'dataSource' | 'cache';
};

/** 如果是个方法执行一下它 */
export function runFunction<T extends any[]>(valueEnum: any, ...rest: T) {
  if (typeof valueEnum === 'function') {
    return valueEnum(...rest);
  }
  return valueEnum;
}

export type EditableProTableProps<T> = Omit<ProTableProps<T>, 'rowKey'> & {
  value?: T[];
  onChange?: (value: T[]) => void;
  /** @name 点击编辑 */
  clickEdit?: boolean;
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
};

export type ErrorLineState = {
  field: string;
  index: number;
} | null;

// const defaultEffectOptions = {
//   wait: 500,
// };

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
    pagination = false,
    editable,
    showIndex = false,
    readonly = false,
    scroll = { x: 'max-content' },
    onRow,
    ...rest
  } = props;
  let tableId = 'tableForm';
  const divRef = useRef<HTMLDivElement>(null);

  const counter = Container.useContainer();
  const actionRef = useRef<ActionType>();
  const oldValueRef = useRef<Map<React.Key, any> | undefined>();

  // ============================ RowKey ============================
  const getRowKey = React.useMemo<any>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: T, index: number) => (record as any)?.[rowKey as string] ?? index;
  }, [rowKey]);
  const [innerPagination, setPagination] = useSetState({
    current: pagination && pagination.current ? pagination.current : 1,
    pageSize: pagination && pagination.pageSize ? pagination.pageSize : 10,
  });
  const [value, setValue] = useMergedState<T[]>(() => props.value || [], {
    value: props.value,
    onChange: props.onChange,
    postState: (list: T[]) => {
      if (Array.isArray(list)) {
        return list.map((it: T, idx: number) => {
          return {
            rowIndex: idx,
            ...it,
          };
        });
      }
      return [];
    },
  });
  // 处理默认聚焦
  // const [fouceDataIndex, setFouceDataIndex] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useMountMergeState<React.ReactText[]>([], {
    value: propsRowSelection ? propsRowSelection.selectedRowKeys : undefined,
  });
  const [selectedRows, setSelectedRows] = useMountMergeState<T[]>([]);
  const [errorLine, setErrorLine] = useMountMergeState<ErrorLineState>(null);

  const setSelectedRowsAndKey = useCallback(
    (keys: React.ReactText[], rows: T[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    [setSelectedRowKeys, setSelectedRows],
  );

  useMount(() => {
    tableId += Math.ceil(Math.random() * 10);
  });

  useEffect(() => {
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
  }, [props.value]);

  /* 绑定actionRef */

  useEffect(() => {
    if (typeof propsActionRef === 'function' && actionRef.current) {
      propsActionRef(actionRef.current);
    }
  }, [propsActionRef]);

  if (propsActionRef) {
    // @ts-ignore
    propsActionRef.current = actionRef.current;
  }

  const setRowData = (key: string, data: any) => {
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
  };

  /** 可编辑行的相关配置 */
  const editableUtils = useEditableArray<any>({
    ...{
      ...props.editable,
      clickEdit,
    },
    containsDeletedData,
    getRowKey,
    rowKey,
    childrenColumnName: props.expandable?.childrenColumnName,
    dataSource: value || [],
    oldKeyMap: oldValueRef.current || new Map(),
    setDataSource: (_data) => {
      props.editable?.onValuesChange?.(undefined as any, _data, 0);
      setValue(_data);
    },
  });

  const userAction: ActionType = {
    ...editableUtils,
    selectedRows,
    setRowData,
    validateRules: (data: any[]) => {
      if (props.columns) {
        return validateRules(props.columns, data, setErrorLine);
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

  useEffect(() => {
    return () => {
      actionRef.current = undefined;
    };
  }, []);

  /** 如果有 ellipsis ，设置 tableLayout 为 fixed */
  const tableLayout = props.columns?.some((item) => item.ellipsis) ? 'fixed' : 'auto';

  const editableDataSource = (): T[] => {
    const { defaultValue: row } = editableUtils.newLineRecord || {};

    // 如果有分页的功能，我们加到这一页的末尾
    if (pagination && pagination?.current && pagination?.pageSize) {
      return [...value].splice(pagination?.current * pagination?.pageSize - 1, 0, row);
    }
    return [...value, row];
  };

  const firstEditable = propsColumns?.find((it) => it.editable);
  const lastEditItem = propsColumns?.filter((it) => it.editable).pop();

  const rowIndexRender = (text: any, rowData: T, index: number) => {
    if (pagination) {
      return (innerPagination.current - 1) * innerPagination.pageSize + index + 1;
    }
    return index + 1;
  };

  const columns = useMemo(() => {
    const newPropsColumns = propsColumns?.filter((it) => it.hidden !== true);
    let newColumns: any = newPropsColumns?.map((columnProps) => {
      let newFixed: any = columnProps.fixed;
      let { width } = columnProps;
      if (columnProps.dataIndex === 'options') {
        if (columnProps.fixed === undefined || columnProps.fixed === null) {
          newFixed = 'right';
        }
        if (width === undefined || width === null) {
          width = 90;
        }
      }

      return {
        ...columnProps,
        fixed: newFixed,
        width,
        onCell(data: any, index?: number | undefined) {
          const cellProps: any = columnProps.onCell ? columnProps.onCell(data, index) : {};
          return {
            ...cellProps,
            onClick: (e: any) => {
              if (cellProps && cellProps?.onClick) {
                cellProps?.onClick(e);
              }
              if (columnProps.editable) {
                editableUtils.setFouce(String(columnProps.dataIndex));
              } else if (firstEditable) {
                editableUtils.setFouce(String(firstEditable.dataIndex));
              }
            },
          };
        },
        render: (text: any, rowData: T, index: number) => {
          if (readonly) {
            if (columnProps.render) {
              const renderDom = columnProps.render(text, rowData, index, {
                ...editableUtils,
              });
              return renderDom;
            }
            return text;
          }

          const renderProps = {
            columnProps,
            text,
            rowData,
            index,
            editableUtils,
            clickEdit,
            errorLine,
          };
          const { isEditable } = editableUtils.isEditable(rowData);
          if (
            errorLine?.index === rowData.rowIndex &&
            errorLine?.field === columnProps.dataIndex &&
            !isEditable
          ) {
            return (
              <span className="ant-input-affix-wrapper ant-input ant-input-status-error">
                {columnRender<T>(renderProps)}
              </span>
            );
          }
          return columnRender<T>(renderProps);
        },
      };
    });
    if (Array.isArray(newColumns)) {
      newColumns = genColumnList<any>({
        columns: newColumns,
        map: counter.columnsMap,
        counter,
      }).sort(tableColumnSort(counter.columnsMap));
    }
    if (showIndex) {
      newColumns.unshift({
        dataIndex: '_rowIndex',
        title: '序号',
        width: 60,
        fixed: true,
        render: rowIndexRender,
      });
    }
    if (readonly) {
      newColumns = newColumns.filter((it: { dataIndex: string }) => {
        return it.dataIndex !== 'options';
      });
    }
    return newColumns;
  }, [
    propsColumns,
    editableUtils.editableKeys.join(','),
    editableUtils.fouceDataIndex,
    clickEdit,
    JSON.stringify(errorLine),
    JSON.stringify(counter),
    JSON.stringify(innerPagination),
    showIndex,
    readonly,
  ]);

  /** 行选择相关的问题 */
  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    ...propsRowSelection,
    onChange: (keys, rows) => {
      if (propsRowSelection && propsRowSelection.onChange) {
        propsRowSelection.onChange(keys, rows);
      }
      setSelectedRowsAndKey(keys, rows);
    },
  };
  const paginationProps = useMemo(() => {
    let lPagination: any = {
      showQuickJumper: true,
      total: value.length,
    };

    if (pagination === false) {
      lPagination = false;
    } else if (typeof pagination === 'object' && pagination !== null) {
      lPagination = {
        ...lPagination,
        ...pagination,
      };
    } else {
      lPagination = {
        ...lPagination,
        ...innerPagination,
      };
    }
    return lPagination;
  }, [JSON.stringify(innerPagination), JSON.stringify(pagination), value.length]);

  const getTableProps = () => {
    let tData = editableUtils.newLineRecord ? editableDataSource() : value;
    const childrenColumnName = props.childrenColumnName || 'children';
    tData = removeDeletedData(tData, childrenColumnName, false);
    return {
      ...rest,
      columns,
      rowSelection: propsRowSelection === false ? undefined : rowSelection,
      dataSource: tData,
      pagination: paginationProps,
      onChange: (
        changePagination: TablePaginationConfig,
        filters: Record<string, (React.Key | boolean)[] | null>,
        sorter: SorterResult<any> | SorterResult<any>[],
        extra: TableCurrentDataSource<T>,
      ) => {
        counter.setFiltersArg(filters);
        const ordersMap = {};
        if (Array.isArray(sorter)) {
          sorter.forEach((it: any) => {
            ordersMap[it.field] = it.order;
          });
        } else if (
          Object.prototype.toString.call(sorter) === '[object Object]' &&
          sorter !== null
        ) {
          const { field, order } = sorter;
          if (field) {
            const rkey: string = `${field}`;
            ordersMap[rkey] = order;
          }
        }
        counter.setSortOrderMap(ordersMap);
        setPagination({
          current: changePagination.current,
          pageSize: changePagination.pageSize,
        });
        if (rest.onTableChange) {
          rest.onTableChange(changePagination, filters, sorter, extra);
        }
      },
      onRow: (record: T, index?: number) => {
        let result: any = onRow && onRow(record, index);
        if (result === undefined || result === null) {
          result = {};
        }
        if (result) {
          const customClick = result.onClick;
          result.onClick = (event: any) => {
            event.stopPropagation(); // 阻止合成事件间的冒泡
            if (typeof customClick === 'function') {
              customClick(event);
            }
            if (clickEdit) {
              if (editableUtils.editableKeys.length > 0) {
                editableUtils.clearAllEditKeysAndSetOne(record[rowKey]);
              } else {
                editableUtils.startEditable(record[rowKey]);
              }
            }
          }; // 点击行
        }
        return {
          ...result,
        };
      },
    };
  };

  const changeEnter = useCallback(
    (event: any) => {
      const { editableKeys } = editableUtils;
      if (clickEdit && Array.isArray(editableKeys) && editableKeys.length > 0) {
        if (event && event.target) {
          const { key, target } = event;
          if (key === 'Tab') {
            const dataIndex = lastEditItem?.dataIndex;
            const itemId = `${editableKeys[0]}_${dataIndex}`;
            if (target.nodeName === 'INPUT') {
              if (target.blur) {
                target?.blur();
              }
            }
            if (target.id && target.id === itemId) {
              const index = value.findIndex((it) => it[rowKey] === editableKeys[0]);
              if (index !== -1 && value.length > index + 1) {
                editableUtils.setFouce(String(firstEditable?.dataIndex));
                editableUtils.clearAllEditKeysAndSetOne(value[index + 1][rowKey]);
              }
            }
          }
        }
      }
    },
    [
      JSON.stringify(value),
      editableUtils.editableKeys.join(','),
      JSON.stringify(firstEditable?.dataIndex),
    ],
  );

  useEventListener('keydown', changeEnter);

  const {
    record,
    creatorButtonText,
    newRecordType = 'dataSource',
    ...restButtonProps
  } = recordCreatorProps || {
    onClick: () => {},
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createClick = (e: any) => {
    // eslint-disable-next-line no-underscore-dangle
    const _record = runFunction(record, value.length) || {};
    actionRef?.current?.addEditRecord(_record, { newRecordType });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    restButtonProps.onClick && restButtonProps.onClick(e);
  };

  const creatorButtonDom = useMemo(() => {
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
    counter,
  ]);

  const { run } = useThrottleFn(editableUtils.onValuesChange, { wait: 300 });

  return (
    <div id={tableId} className="sc-editable-table" ref={divRef}>
      <Form component={false} form={props.editable?.form} onValuesChange={run} key="table">
        <ScTable
          {...getTableProps()}
          rowKey={rowKey}
          tableLayout={tableLayout}
          size="small"
          rowClassName={() => 'editable-row'}
          scroll={scroll}
        />
        {readonly ? null : creatorButtonDom}
      </Form>
    </div>
  );
}

/**
 * 🏆 Use Ant Design Table like a Pro! 更快 更好 更方便
 *
 * @param props
 */
const ProviderWarp = <T extends Record<string, any>>(props: EditableProTableProps<T>) => {
  return (
    <Container.Provider initialState={props}>
      <EditableTable {...props} />
    </Container.Provider>
  );
};
export default ProviderWarp;
