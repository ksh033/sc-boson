import type { GetRowKey } from 'antd/es/table/interface';
import type { DataIndex } from 'rc-table/es/interface';
import type { ProTableEditableFnType } from './typing';

/** 判断可不可编辑 */
export function isEditableCell<T>(
  text: any,
  rowData: T,
  index: number,
  editable?: ProTableEditableFnType<T> | boolean,
  dataIndex?: DataIndex,
) {
  if (dataIndex === 'options') {
    return false;
  }
  if (editable === undefined || editable === null) {
    return true;
  }
  if (typeof editable === 'boolean') {
    return editable === false;
  }
  return editable?.(text, rowData, index) === false;
}

// 打平数组
type DigProps = {
  data: any[];
  getRowKey: GetRowKey<any>;
  childrenColumnName: string;
  map_row_parentKey?: React.Key;
  kvMap: Map<string, any & { parentKey?: React.Key; editableAction?: string }>;
};
export function dig(params: DigProps) {
  const { data, getRowKey, childrenColumnName, map_row_parentKey, kvMap } = params;
  data.forEach((record, index) => {
    const recordKey = `${getRowKey(record, index)}`;
    // children 取在前面方便拼的时候按照反顺序放回去
    if (record && typeof record === 'object' && childrenColumnName in record) {
      dig({
        ...params,
        data: record[childrenColumnName] || [],
        map_row_parentKey: recordKey,
      });
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

// 恢复数组
export function fill<RecordType>(
  map: Map<string, RecordType & { map_row_parentKey?: string; map_row_key?: string }>,
  childrenColumnName: string,
) {
  const kvArrayMap = new Map<string, RecordType[]>();
  const kvSource: RecordType[] = [];
  map.forEach((value) => {
    if (value.map_row_parentKey && !value.map_row_key) {
      const { map_row_parentKey, ...rest } = value;
      kvArrayMap.set(map_row_parentKey, [
        ...(kvArrayMap.get(map_row_parentKey) || []),
        rest as unknown as RecordType,
      ]);
    }
  });
  map.forEach((value) => {
    if (value.map_row_parentKey && value.map_row_key) {
      const { map_row_parentKey, map_row_key, ...rest } = value;
      if (kvArrayMap.has(map_row_key)) {
        rest[childrenColumnName] = kvArrayMap.get(map_row_key);
      }
      kvArrayMap.set(map_row_parentKey, [
        ...(kvArrayMap.get(map_row_parentKey) || []),
        rest as unknown as RecordType,
      ]);
    }
  });
  map.forEach((value) => {
    if (!value.map_row_parentKey) {
      const { map_row_key, ...rest } = value;
      if (map_row_key && kvArrayMap.has(map_row_key)) {
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
}

/**
 * 拼接用于编辑的 key
 *
 * @param base 基本的 key
 * @param dataIndex 需要拼接的key
 */
export const spellNamePath = (
  base: React.Key,
  dataIndex: React.Key | React.Key[] | any,
): React.Key[] => {
  if (Array.isArray(dataIndex)) {
    return [base, ...dataIndex];
  }
  return [base, dataIndex];
};

export function removeDeletedData(
  records: any[],
  childrenColumnName: string,
  containsDeletedData: boolean,
) {
  const list: any[] = [];
  records.forEach((record) => {
    const newValue = record;
    if (record && typeof record === 'object' && childrenColumnName in record) {
      newValue[childrenColumnName] = removeDeletedData(
        record[childrenColumnName] || [],
        childrenColumnName,
        containsDeletedData,
      );
    }
    if (containsDeletedData && record.editableAction !== 'DELETE') {
      list.push(newValue);
    } else if (!containsDeletedData) {
      list.push(newValue);
    }
  });
  return list;
}
