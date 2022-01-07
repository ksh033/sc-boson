/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { GetRowKey } from 'antd/es/table/interface';
import type { FormInstance } from 'antd/es/form/index';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import useLazyKVMap from 'antd/es/table/hooks/useLazyKVMap';
import { LoadingOutlined } from '@ant-design/icons';
import { message, Popconfirm } from 'antd';
import ReactDOM from 'react-dom';
import set from 'rc-util/lib/utils/set';
import useMountMergeState from '../_util/useMountMergeState';
import { removeDeletedData } from './utils';

export function genNonDuplicateID() {
  let str = '';
  str = Math.random().toString(36).substr(3);
  str += Date.now().toString(16).substr(4);
  return str;
}

export type RowEditableType = 'single' | 'multiple';

export type RecordKey = React.Key | React.Key[];

export const toNumber = (recordKey: string) => {
  if (recordKey.startsWith('0')) {
    return recordKey;
  }
  return Number.isNaN(recordKey as unknown as number) ? recordKey : Number(recordKey);
};

export const recordKeyToString = (rowKey: RecordKey): React.Key => {
  if (Array.isArray(rowKey)) return rowKey.join(',');
  return rowKey;
};

export type AddLineOptions = {
  recordKey?: RecordKey;
  newRecordType?: 'dataSource' | 'cache';
};

export type NewLineConfig<T> = {
  defaultValue: T | undefined;
  options: AddLineOptions;
};

export type ActionRenderFunction<T> = (
  row: T,
  config: ActionRenderConfig<T, NewLineConfig<T>>,
  defaultDoms: {
    save: React.ReactNode;
    delete: React.ReactNode;
    cancel: React.ReactNode;
  },
) => React.ReactNode[];

export type RowEditableConfig<T> = {
  /** @name 控制可编辑表格的 form */
  form?: FormInstance;
  /**
   * @type single | multiple
   * @name 编辑的类型，支持单选和多选
   */
  type?: RowEditableType;
  /** @name 正在编辑的列 */
  editableKeys?: React.Key[];
  /** 正在编辑的列修改的时候 */
  onChange?: (editableKeys: React.Key[], editableRows: T[] | T) => void;
  /** 正在编辑的列修改的时候 */
  onValuesChange?: (record: T, dataSource: T[], index: number) => void;
  /** @name 自定义编辑的操作 */
  actionRender?: ActionRenderFunction<T>;
  /** 行保存的时候 */
  onSave?: (
    key: RecordKey,
    row: T & { index?: number },
    newLineConfig?: NewLineConfig<T>,
  ) => Promise<any | void>;

  /** 行保存的时候 */
  onCancel?: (
    key: RecordKey,
    row: T & { index?: number },
    newLineConfig?: NewLineConfig<T>,
  ) => Promise<any | void>;

  /** 行删除的时候 */
  onDelete?: (key: RecordKey, row: T & { index?: number }) => Promise<any | void>;
  /** 删除行时的确认消息 */
  deletePopconfirmMessage?: React.ReactNode;
  /** 只能编辑一行的的提示 */
  onlyOneLineEditorAlertMessage?: React.ReactNode;
  /** 同时只能新增一行的提示 */
  onlyAddOneLineAlertMessage?: React.ReactNode;
};
export type ActionTypeText<T> = {
  deleteText?: React.ReactNode;
  cancelText?: React.ReactNode;
  saveText?: React.ReactNode;
  editorType?: 'Array' | 'Map';
  addEditRecord?: (row: T, options?: AddLineOptions) => boolean;
};

export type ActionRenderConfig<T, LineConfig = NewLineConfig<T>> = {
  editableKeys?: RowEditableConfig<T>['editableKeys'];
  recordKey: RecordKey;
  index?: number;
  form: FormInstance<any>;
  cancelEditable: (key: RecordKey) => void;
  onSave: RowEditableConfig<T>['onSave'];
  onCancel: RowEditableConfig<T>['onCancel'];
  onDelete?: RowEditableConfig<T>['onDelete'];
  deletePopconfirmMessage: RowEditableConfig<T>['deletePopconfirmMessage'];
  setEditableRowKeys: (value: React.Key[]) => void;
  newLineConfig?: LineConfig;
} & ActionTypeText<T>;

/**
 * 使用map 来删除数据，性能一般 但是准确率比较高
 *
 * @param params
 * @param action
 */
function editableRowByKey<RecordType>(
  params: {
    data: RecordType[];
    oldKeyMap: Map<React.Key, any>;
    childrenColumnName: string;
    containsDeletedData: boolean;
    getRowKey: GetRowKey<RecordType>;
    key: RecordKey;
    row: RecordType;
  },
  action: 'update' | 'delete',
) {
  const { getRowKey, row, data, childrenColumnName, oldKeyMap, containsDeletedData } = params;
  const key = recordKeyToString(params.key);
  const kvMap = new Map<
    React.Key,
    RecordType & { parentKey?: React.Key; editableAction?: string }
  >();
  /**
   * 打平这个数组
   *
   * @param records
   * @param parentKey
   */
  function dig(records: any[], map_row_parentKey?: React.Key) {
    records.forEach((record, index) => {
      const recordKey = `${getRowKey(record, index)}`;
      // children 取在前面方便拼的时候按照反顺序放回去
      if (record && typeof record === 'object' && childrenColumnName in record) {
        dig(record[childrenColumnName] || [], recordKey);
      }
      const newRecord = {
        ...record,
        map_row_key: recordKey,
        children: undefined,
        map_row_parentKey,
      };
      delete newRecord.children;
      if (!map_row_parentKey) {
        delete newRecord.map_row_parentKey;
      }
      kvMap.set(recordKey, newRecord);
    });
  }

  dig(data);
  const oldItem = kvMap.get(`${key}`);
  if (action === 'update') {
    if (oldKeyMap.get(`${key}`)) {
      if (typeof oldItem?.editableAction !== 'string') {
        kvMap.set(`${key}`, {
          ...kvMap.get(`${key}`),
          ...row,
          editableAction: 'UPDATE',
        });
      } else {
        kvMap.set(`${key}`, {
          ...kvMap.get(`${key}`),
          ...row,
        });
      }
    } else {
      kvMap.set(`${key}`, {
        ...kvMap.get(`${key}`),
        ...row,
      });
    }
  }
  if (action === 'delete') {
    if (oldKeyMap.get(`${key}`)) {
      if (typeof oldItem?.editableAction !== 'string' || oldItem?.editableAction === 'UPDATE') {
        kvMap.set(`${key}`, {
          ...kvMap.get(`${key}`),
          ...row,
          editableAction: 'DELETE',
        });
      } else {
        kvMap.delete(`${key}`);
      }
    } else {
      kvMap.delete(`${key}`);
    }
  }

  const fill = (map: Map<React.Key, RecordType & { map_row_parentKey?: React.Key }>) => {
    const kvArrayMap = new Map<React.Key, RecordType[]>();
    const kvSource: RecordType[] = [];
    map.forEach((value: any) => {
      if (value.map_row_parentKey) {
        // @ts-ignore
        const { map_row_parentKey, map_row_key, ...reset } = value;
        if (reset && kvArrayMap.has(map_row_key)) {
          reset[childrenColumnName] = kvArrayMap.get(map_row_key);
        }
        kvArrayMap.set(map_row_parentKey, [
          ...(kvArrayMap.get(map_row_parentKey) || []),
          reset as RecordType,
        ]);
        return;
      }

      if (!value.map_row_parentKey) {
        // @ts-ignore
        const { map_row_key, ...rest } = value;
        if (kvArrayMap.has(map_row_key)) {
          const item = {
            ...rest,
            [childrenColumnName]: kvArrayMap.get(map_row_key),
          };
          kvSource.push(item as RecordType);
          return;
        }
        kvSource.push(rest as RecordType);
      }
    });
    return kvSource;
  };
  let source = fill(kvMap);
  source = removeDeletedData(source, childrenColumnName, containsDeletedData);
  return source;
}

/**
 * 保存按钮的dom
 *
 * @param ActionRenderConfig
 */
export const SaveEditableAction: React.FC<ActionRenderConfig<any> & { row: any }> = ({
  recordKey,
  onSave,
  form,
  row,
  children,
  newLineConfig,
  editorType,
}) => {
  const [loading, setLoading] = useMountMergeState<boolean>(false);
  return (
    <a
      key="save"
      onClick={async () => {
        try {
          const isMapEditor = editorType === 'Map';
          const namePath = Array.isArray(recordKey) ? recordKey : [recordKey];
          setLoading(true);
          await form.validateFields(namePath);

          const fields = form.getFieldValue(namePath);
          const record = isMapEditor ? set(row, namePath, fields) : { ...row, ...fields };
          const res = await onSave?.(recordKey, record, newLineConfig);
          setLoading(false);
          return res;
        } catch (e) {
          setLoading(false);
          return null;
        }
      }}
    >
      {loading ? (
        <LoadingOutlined
          style={{
            marginRight: 8,
          }}
        />
      ) : null}
      {children || '保存'}
    </a>
  );
};

/**
 * 删除按钮 dom
 *
 * @param ActionRenderConfig
 */
export const DeleteEditableAction: React.FC<ActionRenderConfig<any> & { row: any }> = ({
  recordKey,
  onDelete,
  row,
  children,
  deletePopconfirmMessage,
  cancelEditable,
}) => {
  const [loading, setLoading] = useMountMergeState<boolean>(false);
  const onConfirm = async () => {
    try {
      setLoading(true);
      const res = await onDelete?.(recordKey, row);
      setLoading(false);
      setTimeout(() => {
        cancelEditable(recordKey);
      }, 0);
      return res;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      setLoading(false);
      return null;
    }
  };
  return children !== false ? (
    <Popconfirm key="delete" title={deletePopconfirmMessage} onConfirm={onConfirm}>
      <a>
        {loading ? (
          <LoadingOutlined
            style={{
              marginRight: 8,
            }}
          />
        ) : null}
        {children || '删除'}
      </a>
    </Popconfirm>
  ) : null;
};

export function defaultActionRender<T>(row: T, config: ActionRenderConfig<T, NewLineConfig<T>>) {
  const {
    recordKey,
    newLineConfig,
    form,
    onCancel,
    cancelEditable,
    saveText,
    cancelText,
    deleteText,
  } = config;
  return [
    <SaveEditableAction key="save" {...config} row={row}>
      {saveText}
    </SaveEditableAction>,
    newLineConfig?.options.recordKey !== recordKey ? (
      <DeleteEditableAction key="delete" {...config} row={row}>
        {deleteText}
      </DeleteEditableAction>
    ) : null,
    <a
      key="cancel"
      onClick={async () => {
        const namePath = Array.isArray(recordKey) ? recordKey : [recordKey];
        const fields = form.getFieldValue(namePath);
        const res = await onCancel?.(recordKey, fields, newLineConfig);
        cancelEditable(recordKey);
        return res;
      }}
    >
      {cancelText || '取消'}
    </a>,
  ];
}

/**
 * 一个方便的hooks 用于维护编辑的状态
 *
 * @param props
 */
function useEditableArray<RecordType>(
  props: RowEditableConfig<RecordType> & {
    /** @name 点击编辑 */
    clickEdit: boolean;
    containsDeletedData: boolean;
    rowKey: string;
    getRowKey: GetRowKey<RecordType>;
    dataSource: RecordType[];
    oldKeyMap: Map<React.Key, any>;
    onValuesChange?: (
      record: RecordType,
      dataSource: RecordType[],
      index: number,
      changeValue: RecordType,
    ) => void;
    childrenColumnName: string | undefined;
    setDataSource: (dataSource: RecordType[]) => void;
  },
) {
  const [newLineRecord, setNewLineRecord] = useState<NewLineConfig<RecordType> | undefined>(
    undefined,
  );

  const [fouceDataIndex, setFouceDataIndex] = useState<string>('');
  const newLineRecordRef = useRef<NewLineConfig<RecordType> | undefined>(undefined);
  const editComRef = useRef<any>();

  // 这里这么做是为了存上次的状态，不然每次存一下再拿
  newLineRecordRef.current = newLineRecord;

  const editableType = props.type || 'single';
  const [getRecordByKey] = useLazyKVMap(props.dataSource, 'children', props.getRowKey);

  const setAllEditable = useCallback(
    (rdata: any[]) => {
      if (editableType === 'multiple' && Array.isArray(rdata)) {
        return rdata.map((item: RecordType) => {
          return item[props.rowKey];
        });
      }
      return [];
    },
    [editableType],
  );

  const [editableKeys, setEditableRowKeys] = useMergedState<React.Key[]>([], {
    value: props.editableKeys || setAllEditable(props.dataSource),
    onChange: props.onChange
      ? (keys) => {
          props?.onChange?.(
            // 计算编辑的key
            keys,
            // 计算编辑的行
            keys.map((key) => getRecordByKey(key)),
          );
        }
      : undefined,
  });

  const setFouce = (dataIndex: string) => {
    ReactDOM.unstable_batchedUpdates(() => {
      setFouceDataIndex(dataIndex);
    });
  };

  useLayoutEffect(() => {
    if (Array.isArray(props.editableKeys) && props.editableKeys.length === 0 && props.clickEdit) {
      if (Array.isArray(props.dataSource) && props.dataSource.length > 0) {
        setEditableRowKeys([props.dataSource[0][props.rowKey]]);
      }
    }
  }, [props.clickEdit, JSON.stringify(props.dataSource), props.type]);

  /** 一个用来标志的set 提供了方便的 api 来去重什么的 */
  const editableKeysSet = useMemo(() => {
    const keys = editableType === 'single' ? editableKeys.slice(0, 1) : editableKeys;
    return new Set(keys);
  }, [editableKeys.join(','), editableType]);

  /** 这行是不是编辑状态 */
  const isEditable = useCallback(
    (row: RecordType & { index: number }) => {
      const recordKey = props.getRowKey(row, row.index);
      if (editableKeys.includes(recordKey))
        return {
          recordKey,
          isEditable: true,
        };
      return {
        recordKey,
        isEditable: false,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editableKeys.join(',')],
  );

  /**
   * 进入编辑状态
   *
   * @param recordKey
   */
  const startEditable = (recordKey: React.Key) => {
    // 如果是单行的话，不允许多行编辑
    if (editableKeysSet.size > 0 && editableType === 'single') {
      message.warn(props.onlyOneLineEditorAlertMessage || '只能同时编辑一行');
      return false;
    }
    // 防止多次渲染
    ReactDOM.unstable_batchedUpdates(() => {
      editableKeysSet.add(recordKey);
      setEditableRowKeys(Array.from(editableKeysSet));
    });

    return true;
  };

  /**
   * 退出编辑状态
   *
   * @param recordKey
   */
  const cancelEditable = (recordKey: RecordKey) => {
    // 防止多次渲染
    ReactDOM.unstable_batchedUpdates(() => {
      /** 如果这个是 new Line 直接删除 */
      if (newLineRecord && newLineRecord.options.recordKey === recordKey) {
        setNewLineRecord(undefined);
      }
      editableKeysSet.delete(recordKeyToString(recordKey));
      setEditableRowKeys(Array.from(editableKeysSet));
    });
    return true;
  };

  const onValuesChange = (value: RecordType, values: any) => {
    if (!props.onValuesChange) {
      return;
    }
    let { dataSource } = props;
    const childrenColumnName = props.childrenColumnName || 'children';
    // 这里是把正在编辑中的所有表单数据都修改掉
    // 不然会用 props 里面的 dataSource，数据只有正在编辑中的
    Object.keys(values).forEach((recordKey) => {
      const editRow = values[recordKey];
      dataSource = editableRowByKey(
        {
          childrenColumnName,
          containsDeletedData: props.containsDeletedData,
          oldKeyMap: props.oldKeyMap,
          data: dataSource,
          getRowKey: props.getRowKey,
          row: editRow,
          key: recordKey,
        },
        'update',
      );
    });

    const recordKey = Object.keys(value).pop() as string;
    if (recordKey === newLineRecord?.options.recordKey) {
      cancelEditable(recordKey);
      startEditable(recordKey);
    }
    let idx = 0;
    const editRow = dataSource.find((item, index) => {
      const key = props.getRowKey(item, index);
      if (key === recordKey) {
        idx = index;
      }
      return key === recordKey;
    }) || {
      ...newLineRecord?.defaultValue,
      ...values[recordKey],
    };

    props.onValuesChange(editRow, dataSource, idx, value);
  };

  /**
   * 同时只能支持一行,取消之后数据消息，不会触发 dataSource
   *
   * @param row
   * @param options
   * @name 增加新的行
   */
  const addEditRecord = (row: RecordType, options?: AddLineOptions) => {
    const tRow = {
      ...row,
      editableAction: 'ADD',
    };
    // 暂时不支持多行新增
    if (newLineRecordRef.current) {
      message.warn(props.onlyAddOneLineAlertMessage || '只能新增一行');
      return false;
    }
    // 如果是单行的话，不允许多行编辑
    if (editableKeysSet.size > 0 && editableType === 'single') {
      message.warn(props.onlyOneLineEditorAlertMessage || '只能同时编辑一行');
      return false;
    }

    // 防止多次渲染
    ReactDOM.unstable_batchedUpdates(() => {
      tRow[props.rowKey] = genNonDuplicateID();
      const recordKey = props.getRowKey(tRow, props.dataSource.length);
      if (props.clickEdit) {
        setEditableRowKeys([recordKey]);
      } else {
        editableKeysSet.add(recordKey);
        setEditableRowKeys(Array.from(editableKeysSet));
      }

      if (options?.newRecordType === 'dataSource') {
        props.setDataSource?.([...props.dataSource, tRow]);
      } else {
        setNewLineRecord({
          defaultValue: tRow,
          options: {
            ...options,
            recordKey,
          },
        });
      }
    });
    return true;
  };

  // Internationalization
  const saveText = '保存';
  const deleteText = '删除';
  const cancelText = '取消';

  const actionRender = (row: RecordType & { index: number }, form: FormInstance<any>) => {
    const key = props.getRowKey(row, row.index);
    const config = {
      saveText,
      cancelText,
      deleteText,
      addEditRecord,
      recordKey: key,
      cancelEditable,
      index: row.index,
      newLineConfig: newLineRecord,
      onCancel: async (
        recordKey: RecordKey,
        editRow: RecordType & {
          index?: number;
        },
        isNewLine?: NewLineConfig<RecordType>,
      ) => {
        const res = await props?.onCancel?.(recordKey, editRow, isNewLine);
        return res;
      },
      onDelete: async (
        recordKey: RecordKey,
        editRow: RecordType & {
          index?: number;
        },
      ) => {
        const actionProps = {
          data: props.dataSource,
          getRowKey: props.getRowKey,
          row: editRow,
          key: recordKey,
          childrenColumnName: props.childrenColumnName || 'children',
          oldKeyMap: props.oldKeyMap,
          containsDeletedData: props.containsDeletedData,
        };
        const res = await props?.onDelete?.(recordKey, editRow);

        props.setDataSource(editableRowByKey(actionProps, 'delete'));
        return res;
      },
      onSave: async (
        recordKey: RecordKey,
        editRow: RecordType & {
          index?: number;
        },
        isNewLine?: NewLineConfig<RecordType>,
      ) => {
        const res = await props?.onSave?.(recordKey, editRow, isNewLine);
        cancelEditable(recordKey);
        if (isNewLine) {
          props.setDataSource([...props.dataSource, editRow]);
          return res;
        }
        const actionProps = {
          data: props.dataSource,
          getRowKey: props.getRowKey,
          row: editRow,
          key: recordKey,
          childrenColumnName: props.childrenColumnName || 'children',
          oldKeyMap: props.oldKeyMap,
          containsDeletedData: props.containsDeletedData,
        };
        props.setDataSource(editableRowByKey(actionProps, 'update'));
        return res;
      },
      form,
      editableKeys,
      setEditableRowKeys,
      deletePopconfirmMessage: props.deletePopconfirmMessage || '删除此行？',
    };
    const defaultDoms = defaultActionRender<RecordType>(row, config);

    if (props.actionRender)
      return props.actionRender(row, config, {
        save: defaultDoms[0],
        delete: defaultDoms[1],
        cancel: defaultDoms[2],
      });
    return defaultDoms;
  };

  return {
    editableKeys,
    setEditableRowKeys,
    fouceDataIndex,
    setFouce,
    editComRef,
    isEditable,
    actionRender,
    startEditable,
    cancelEditable,
    addEditRecord,
    newLineRecord,
    onValuesChange,
  };
}

export type UseEditableType = typeof useEditableArray;

export type UseEditableUtilType = ReturnType<UseEditableType>;

export default useEditableArray;
