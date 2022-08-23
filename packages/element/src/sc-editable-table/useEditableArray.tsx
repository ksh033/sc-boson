/* eslint-disable react-hooks/exhaustive-deps */
import { LoadingOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm } from 'antd';
import type { FormInstance } from 'antd/es/form/index';
import useLazyKVMap from 'antd/es/table/hooks/useLazyKVMap';
import type { GetRowKey } from 'antd/es/table/interface';
import set from 'rc-util/es/utils/set';
import React, { useMemo, useRef } from 'react';
import { useDeepCompareEffectDebounce } from '../_util/useDeepCompareEffect';
import { useRefFunction } from '../_util/useRefFunction';
import { fill, dig } from './utils';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import { useDebounceFn, useSafeState } from 'ahooks';
import isEqual from 'lodash/isEqual';

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
  needDeletePopcon: boolean; //删除时是否询问
  isNeCell: boolean;
} & ActionTypeText<T>;

function removeRowByKey<RecordType>(params: {
  data: RecordType[];
  oldKeyMap: Map<React.Key, any>;
  childrenColumnName: string;
  containsDeletedData: boolean;
  getRowKey: GetRowKey<RecordType>;
  deleteList?: RecordKey[] | true;
}) {
  const {
    getRowKey,
    deleteList = true,
    data,
    childrenColumnName,
    oldKeyMap,
    containsDeletedData,
  } = params;
  let removeList: RecordKey[] = [];
  if (deleteList === true) {
    removeList = data.map((record, index) => `${getRowKey(record, index)}`);
  } else if (Array.isArray(deleteList) && deleteList.length > 0) {
    removeList = deleteList;
  }

  if (removeList.length > 0) {
    const kvMap = new Map<string, any & { editableAction?: string }>();
    /**
     * 打平这个数组
     *
     * @param records
     * @param parentKey
     */
    dig({
      data: data,
      getRowKey,
      childrenColumnName,
      kvMap,
    });
    // 开始删除
    removeList.forEach((itKey) => {
      const key = recordKeyToString(itKey);
      const keyItem = kvMap.get(`${key}`);
      if (containsDeletedData) {
        if (keyItem?.editableAction != null) {
          if (keyItem?.editableAction === 'UPDATE') {
            kvMap.set(`${key}`, {
              ...kvMap.get(`${key}`),
              editableAction: 'DELETE',
            });
          } else if (keyItem?.editableAction === 'ADD') {
            kvMap.delete(`${key}`);
          }
        } else {
          if (oldKeyMap.get(`${key}`)) {
            kvMap.set(`${key}`, {
              ...kvMap.get(`${key}`),
              editableAction: 'DELETE',
            });
          } else {
            kvMap.delete(`${key}`);
          }
        }
      } else {
        kvMap.delete(`${key}`);
      }
    });
    const source = fill(kvMap, childrenColumnName);

    return source;
  }
  return data;
}

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
  const kvMap = new Map<string, RecordType & { parentKey?: React.Key; editableAction?: string }>();

  /**
   * 打平这个数组
   *
   * @param records
   * @param parentKey
   */
  dig({
    data: data,
    getRowKey,
    childrenColumnName,
    kvMap,
  });
  const keyItem = kvMap.get(`${key}`);

  // oldKeyMap.get(`${key}`)
  if (action === 'update') {
    if (containsDeletedData && oldKeyMap.get(`${key}`)) {
      // 有标识就加标识
      if (keyItem?.editableAction != null) {
        kvMap.set(`${key}`, {
          ...kvMap.get(`${key}`),
          ...row,
        });
      } else {
        kvMap.set(`${key}`, {
          ...kvMap.get(`${key}`),
          ...row,
          editableAction: 'UPDATE',
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
    if (containsDeletedData) {
      if (keyItem?.editableAction != null) {
        if (keyItem?.editableAction === 'UPDATE') {
          kvMap.set(`${key}`, {
            ...kvMap.get(`${key}`),
            ...row,
            editableAction: 'DELETE',
          });
        } else if (keyItem?.editableAction === 'ADD') {
          kvMap.delete(`${key}`);
        }
      } else {
        if (oldKeyMap.get(`${key}`)) {
          kvMap.set(`${key}`, {
            ...kvMap.get(`${key}`),
            ...row,
            editableAction: 'DELETE',
          });
        } else {
          kvMap.delete(`${key}`);
        }
      }
    } else {
      kvMap.delete(`${key}`);
    }
  }
  const source = fill(kvMap, childrenColumnName);
  // source = removeDeletedData(source, childrenColumnName, containsDeletedData);

  return source;
}

/**
 * 保存按钮的dom
 *
 * @param ActionRenderConfig
 */
export const SaveEditableAction: React.FC<
  ActionRenderConfig<any> & { row: any; children?: React.ReactNode }
> = ({ recordKey, onSave, form, row, children, newLineConfig, editorType }) => {
  const [loading, setLoading] = useSafeState<boolean>(false);
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
export const DeleteEditableAction: React.FC<
  ActionRenderConfig<any> & { row: any; children?: React.ReactNode }
> = ({
  recordKey,
  onDelete,
  row,
  children,
  deletePopconfirmMessage,
  needDeletePopcon,
  cancelEditable,
  isNeCell,
}) => {
  const [loading, setLoading] = useSafeState<boolean>(false);
  const onConfirm = async () => {
    try {
      setLoading(true);
      const res = await onDelete?.(recordKey, row);
      setLoading(false);
      if (!isNeCell) {
        setTimeout(() => {
          cancelEditable(recordKey);
        }, 0);
      }
      return res;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      setLoading(false);
      return null;
    }
  };

  if (needDeletePopcon) {
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
  } else {
    return children !== false ? (
      <Button type="link" onClick={onConfirm}>
        {loading ? (
          <LoadingOutlined
            style={{
              marginRight: 8,
            }}
          />
        ) : null}
        {children || '删除'}
      </Button>
    ) : null;
  }
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

type UseEditableArrayProps<RecordType> = RowEditableConfig<RecordType> & {
  /** @name 点击编辑 */
  clickEdit: boolean;
  containsDeletedData: boolean;
  rowKey: string;
  getRowKey: GetRowKey<RecordType>;
  dataSource: RecordType[];
  oldKeyMap: Map<React.Key, any>;
  valueRef: React.MutableRefObject<RecordType[]>;
  onValuesChange?: (
    record: RecordType,
    dataSource: RecordType[],
    index: number,
    changeValue: RecordType,
  ) => void;
  childrenColumnName: string | undefined;
  setDataSource: (dataSource: RecordType[]) => void;
  needDeletePopcon?: boolean; //删除时是否询问
  setValueRef: (dataSource: RecordType[]) => void;
};

/**
 * 一个方便的hooks 用于维护编辑的状态
 *
 * @param props
 */
function useEditableArray<RecordType>(props: UseEditableArrayProps<RecordType>) {
  const editableType = props.type || 'single';
  const [newLineRecord, setNewLineRecord] = useSafeState<NewLineConfig<RecordType> | undefined>(
    void 0,
  );
  const newLineRecordRef = useRef<NewLineConfig<RecordType> | undefined>(newLineRecord);
  // 这里这么做是为了存上次的状态，不然每次存一下再拿
  newLineRecordRef.current = newLineRecord;
  const isNeCell = props.clickEdit === true && editableType === 'multiple';
  const [getRecordByKey] = useLazyKVMap(props.dataSource, 'children', props.getRowKey);

  const [editableKeys, setEditableRowKeys] = useMergedState<React.Key[]>([], {
    value: props.editableKeys,
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
  // 如果是全部编辑则走全部编辑策略
  useDeepCompareEffectDebounce(() => {
    if (Boolean(props.clickEdit) === false && editableType === 'multiple') {
      let allEditKeys: React.Key[] = [];
      if (Array.isArray(props.dataSource)) {
        allEditKeys = props.dataSource.map((item: RecordType) => {
          return props.getRowKey(item);
        });
      }
      setEditableRowKeys(allEditKeys);
    }
  }, [props.clickEdit, props.dataSource.length]);

  /** 一个用来标志的set 提供了方便的 api 来去重什么的 */
  const editableKeysSet = useMemo(() => {
    const keys = editableType === 'single' ? editableKeys.slice(0, 1) : editableKeys;
    return new Set(keys);
  }, [(editableKeys || []).join(','), editableType]);

  const onDeleteByKeys = useRefFunction((deleteList?: RecordKey[] | true) => {
    const dataSource = removeRowByKey({
      deleteList,
      childrenColumnName: props.childrenColumnName || '',
      containsDeletedData: props.containsDeletedData,
      oldKeyMap: props.oldKeyMap,
      data: props.dataSource,
      getRowKey: props.getRowKey,
    });
    props.setDataSource(dataSource);
  });

  /** 这行是不是编辑状态 */
  const isEditable = useRefFunction((row: RecordType & { index: number }) => {
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
  });

  /**
   * 进入编辑状态
   *
   * @param recordKey
   */
  const startEditable = useRefFunction((recordKey: React.Key) => {
    // 如果是单行的话，不允许多行编辑
    if (editableKeysSet.size > 0 && editableType === 'single') {
      message.warn(props.onlyOneLineEditorAlertMessage || '只能同时编辑一行');
      return false;
    }
    editableKeysSet.add(recordKey);
    setEditableRowKeys(Array.from(editableKeysSet));

    return true;
  });
  /**
   * 退出编辑状态
   *
   * @param recordKey
   */
  const cancelEditable = useRefFunction((recordKey: RecordKey) => {
    if (newLineRecord && newLineRecord.options.recordKey === recordKey) {
      setNewLineRecord(undefined);
    }
    editableKeysSet.delete(recordKeyToString(recordKey));
    setEditableRowKeys(Array.from(editableKeysSet));
    return true;
  });

  const propsOnValuesChange = useDebounceFn(
    async (...rest: any[]) => {
      //@ts-ignore
      props.onValuesChange?.(...rest);
    },
    {
      wait: 64,
    },
  );

  const onValuesChange = useRefFunction((value: RecordType, values: any) => {
    let dataSource = props.dataSource;
    const childrenColumnName = props.childrenColumnName || 'children';
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

    // if (recordKey === newLineRecord?.options.recordKey) {
    //   cancelEditable(recordKey);
    //   startEditable(recordKey);
    // }

    if (editableType === 'multiple') {
      props.setValueRef(dataSource);
      return;
    }

    const recordKey = Object.keys(value).pop()?.toString() as string;
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

    propsOnValuesChange.run(editRow, dataSource, idx, value);
    // if (editableType === 'multiple') {
    //   props.setValueRef(dataSource);
    // }
  });

  /**
   * 同时只能支持一行,取消之后数据消息，不会触发 dataSource
   *
   * @param row
   * @param options
   * @name 增加新的行
   */
  const addEditRecord = useRefFunction((row: RecordType, options?: AddLineOptions) => {
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
    const tRow = {
      ...row,
      editableAction: 'ADD',
    };

    tRow[props.rowKey] = genNonDuplicateID();
    const recordKey = props.getRowKey(tRow, props.dataSource.length);
    editableKeysSet.add(recordKey);
    setEditableRowKeys(Array.from(editableKeysSet));

    if (options?.newRecordType === 'dataSource') {
      if (
        Array.isArray(props.valueRef.current) &&
        !isEqual(props.valueRef.current, props.dataSource)
      ) {
        props.setDataSource?.([...props.valueRef.current, tRow]);
      } else {
        props.setDataSource?.([...props.dataSource, tRow]);
      }
    } else {
      setNewLineRecord({
        defaultValue: tRow,
        options: {
          ...options,
          recordKey,
        },
      });
    }
    return true;
  });

  // Internationalization
  const saveText = '保存';
  const deleteText = '删除';
  const cancelText = '取消';

  const actionSaveRef = useRefFunction(
    async (
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
  );

  const actionDeleteRef = useRefFunction(
    async (
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
  );

  const actionCancelRef = useRefFunction(
    async (
      recordKey: RecordKey,
      editRow: RecordType & {
        index?: number;
      },
      isNewLine?: NewLineConfig<RecordType>,
    ) => {
      const res = await props?.onCancel?.(recordKey, editRow, isNewLine);
      return res;
    },
  );

  const actionRender = useRefFunction(
    (row: RecordType & { index: number }, form: FormInstance<any>) => {
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
        onCancel: actionCancelRef,
        onDelete: actionDeleteRef,
        onSave: actionSaveRef,
        form,
        editableKeys,
        setEditableRowKeys,
        deletePopconfirmMessage: props.deletePopconfirmMessage || '删除此行？',
        needDeletePopcon: props.needDeletePopcon || false,
        isNeCell: isNeCell,
      };
      const defaultDoms = defaultActionRender<RecordType>(row, config);

      if (props.actionRender)
        return props.actionRender(row, config, {
          save: defaultDoms[0],
          delete: defaultDoms[1],
          cancel: defaultDoms[2],
        });
      return defaultDoms;
    },
  );

  return {
    editableKeys,
    setEditableRowKeys,
    isEditable,
    actionRender,
    startEditable,
    cancelEditable,
    addEditRecord,
    newLineRecord,
    onValuesChange,
    onDeleteByKeys,
  };
}

export type UseEditableType = typeof useEditableArray;

export type UseEditableUtilType = ReturnType<UseEditableType>;

export default useEditableArray;
