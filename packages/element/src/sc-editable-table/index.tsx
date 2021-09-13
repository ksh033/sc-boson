import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { TableProps } from 'antd/es/table/index';
import type { ProTableProps, ActionType, TableRowSelection } from './typing';
import type { ButtonProps } from 'antd/es/button/index';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { PlusOutlined } from '@ant-design/icons';
import { Form, Table, Button } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import type { SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
import { columnRender, removeDeletedData } from './utils';
import useEditableArray from './useEditableArray';
import useMountMergeState from '../_util/useMountMergeState';
import { useClickAway, useMount } from 'ahooks';
import { validateRules } from './validateUtil';

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
  onValuesChange?: (values: T[], record: T, index: number) => void;
  rowKey?: string;
};

function EditableTable<T extends Record<string, any>>(props: EditableProTableProps<T>) {
  const {
    actionRef: propsActionRef,
    rowKey = 'id',
    columns: propsColumns,
    rowSelection: propsRowSelection = false,
    clickEdit = false,
    containsDeletedData = false,
    recordCreatorProps = false,
    maxLength,
    pagination = false,
    editable,
    ...rest
  } = props;
  let tableId = 'tableForm';
  const actionRef = useRef<ActionType>();

  const oldValueRef = useRef<Map<React.Key, any> | undefined>();

  // ============================ RowKey ============================
  const getRowKey = React.useMemo<any>(() => {
    if (typeof rowKey === 'function') {
      return rowKey;
    }
    return (record: T, index: number) => (record as any)?.[rowKey as string] ?? index;
  }, [rowKey]);

  const [value, setValue] = useMergedState<T[]>(() => props.value || [], {
    value: props.value,
    onChange: props.onChange,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useMountMergeState<React.ReactText[]>([], {
    value: propsRowSelection ? propsRowSelection.selectedRowKeys : undefined,
  });
  const [selectedRows, setSelectedRows] = useMountMergeState<T[]>([]);

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

  /** 可编辑行的相关配置 */
  const editableUtils = useEditableArray<any>({
    ...props.editable,
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

  const columns = useMemo(() => {
    return propsColumns?.map((columnProps) => {
      return {
        ...columnProps,
        render: (text: any, rowData: T, index: number) => {
          const renderProps = {
            columnProps,
            text,
            rowData,
            index,
            editableUtils,
            clickEdit,
          };

          return columnRender<T>(renderProps);
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsColumns, editableUtils.editableKeys.join(','), editableUtils, clickEdit]);

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

  const getTableProps = () => {
    let tData = editableUtils.newLineRecord ? editableDataSource() : value;
    const childrenColumnName = props.childrenColumnName || 'children';
    tData = removeDeletedData(tData, childrenColumnName, false);
    return {
      ...rest,
      columns,
      rowSelection: propsRowSelection === false ? undefined : rowSelection,
      dataSource: tData,
      pagination,
      onChange: (
        changePagination: TablePaginationConfig,
        filters: Record<string, (React.Key | boolean)[] | null>,
        sorter: SorterResult<T> | SorterResult<T>[],
        extra: TableCurrentDataSource<T>,
      ) => {
        if (rest.onTableChange) {
          rest.onTableChange(changePagination, filters, sorter, extra);
        }
      },
      onRow: (record: T) => {
        return {
          onClick: () => {
            if (clickEdit) {
              if (editableUtils.editableKeys.length > 0) {
                editableUtils.cancelEditable(editableUtils.editableKeys[0]);
                editableUtils.startEditable(record[rowKey]);
              } else {
                editableUtils.startEditable(record[rowKey]);
              }
            }
          },
        };
      },
    };
  };

  useClickAway(
    () => {
      props.editable?.form?.setFields([{ name: 'quantity', errors: ['123'] }]);
      if (clickEdit && editableUtils.editableKeys.length > 0) {
        editableUtils.editableKeys.forEach((key) => {
          editableUtils.cancelEditable(key);
        });
      }
    },
    () => document.getElementById(tableId),
  );

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
  ]);

  return (
    <div id={tableId}>
      <Form
        component={false}
        form={props.editable?.form}
        onValuesChange={editableUtils.onValuesChange}
        key="table"
      >
        <Table {...getTableProps()} rowKey={rowKey} tableLayout={tableLayout} />
        {creatorButtonDom}
      </Form>
    </div>
  );
}

export default EditableTable;
