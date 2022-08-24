import { useMemo, useRef } from 'react';
import { createContainer } from 'unstated-next';
import type { ProColumns } from './typing';
import type { DataIndex } from 'rc-table/es/interface';
import { useRefFunction } from '../_util/useRefFunction';
import { useCreation } from 'ahooks';

type EditableProTableContext = {
  value?: any[];
  columns?: ProColumns<any>[];
  rowKey?: string; // 行key
  containsDeletedData?: boolean;
};

type ColType = {
  dataIndex?: DataIndex;
  recordKey: string;
  startEditable: (() => void) | null;
  endEditable: (() => void) | null;
};

type ColIndexType = {
  fisColIndex: number;
  secColIndex: number;
};

type CurretEditType = {
  recordKey: string;
  dataIndex: string;
} | null;

function useContainer(props: EditableProTableContext = {}) {
  // 二维数组集合
  const groupRef = useRef<ColType[][]>([]);
  // 全部可编辑数据的集合
  const groupRecordKeyMap = useRef<Record<string, ColIndexType>>({});
  // 可编辑列的集合
  const editableMap = useRef<Record<string, number>>({});
  // 当前编辑项
  const curretEdit = useRef<CurretEditType>(null);
  // 需要聚焦的dataIndex
  const fouceDataIndexRef = useRef<string>('');
  // 初始处于编辑态的信息
  const initStartRef = useRef<CurretEditType>(null);
  // 选择的值
  const selectedRef = useRef<{
    selectedRowKeys: string[];
    selectedRows: any[];
  }>({
    selectedRowKeys: [],
    selectedRows: [],
  });
  // 数据
  const dataSource = useMemo(() => {
    let list = Array.isArray(props.value) ? props.value : [];
    if (Array.isArray(props.value)) {
      list = props.value.map((it: any, idx: number) => {
        return {
          rowIndex: `${idx}`,
          ...it,
        };
      });
    }
    return props.containsDeletedData ? list.filter((it) => it.editableAction !== 'DELETE') : list;
  }, [props.value, props.containsDeletedData]);
  // 获取列值
  const getDataIndex = useRefFunction((dataIndex: DataIndex) => {
    let name: string = '';
    if (Array.isArray(dataIndex)) {
      name = [...dataIndex].join('-');
    } else {
      name = String(dataIndex);
    }
    return name;
  });

  const editableList = useMemo(() => {
    if (Array.isArray(props.columns)) {
      return props.columns?.filter((it) => it.editable);
    }
    return [];
  }, [props.columns]);

  const editableListLength = editableList.length;

  const getEditableMap = useMemo(() => {
    const map: Record<string, number> = {};
    editableList.forEach((col, index: number) => {
      const name: string = getDataIndex(col.dataIndex || '');
      map[name] = index;
    });
    return map;
  }, [editableList.length]);

  const editItemMap = useCreation(() => {
    const map: Record<string, ProColumns<any>> = {};
    editableList.forEach((col) => {
      const name: string = getDataIndex(col.dataIndex || '');
      map[name] = col;
    });
    return map;
  }, [editableList]);

  // 初始化
  const initCreateTwoDimension = useRefFunction(() => {
    const length = dataSource.length;
    const group: ColType[][] = [];
    const groupMap: Record<string, ColIndexType> = {};
    for (let i = 0; i < length; i++) {
      const editableGroup: ColType[] = [];
      const recordKey = props.rowKey ? dataSource[i][props.rowKey] : i;
      for (let j = 0; j < editableList.length; j++) {
        const name: string = getDataIndex(editableList[j].dataIndex || '');
        editableGroup.push({
          dataIndex: editableList[j].dataIndex,
          recordKey: recordKey,
          startEditable: null,
          endEditable: null,
        });
        groupMap[`${name}-${recordKey}`] = {
          fisColIndex: i,
          secColIndex: j,
        };
      }
      group.push(editableGroup);
    }
    if (initStartRef.current == null && length > 0 && editableListLength > 0) {
      const recordKey = props.rowKey ? dataSource[0][props.rowKey] : 0;
      const newDataIndex = getDataIndex(editableList[0].dataIndex || '');
      initStartRef.current = {
        dataIndex: newDataIndex,
        recordKey: recordKey,
      };
    }
    if (length === 0 || editableListLength === 0) {
      initStartRef.current = null;
    }
    // console.log('group', group);
    // console.log('groupMap', groupMap);
    groupRef.current = group;
    groupRecordKeyMap.current = groupMap;
    editableMap.current = getEditableMap;
  });
  // 开始下一个编辑
  const startNext = useRefFunction((dataIndex: string, recordKey: string) => {
    const name: string = getDataIndex(dataIndex || '');
    const key = `${name}-${recordKey}`;
    const groupMapItem = groupRecordKeyMap.current[key];
    if (groupMapItem == null) return;

    const length = dataSource.length;
    const index = groupMapItem.fisColIndex;
    const mapIndex = editableMap.current[dataIndex];
    if (index === length - 1 && mapIndex === editableListLength - 1) return;
    let startEditable = null;
    if (mapIndex === editableListLength - 1) {
      const nextIndex = index + 1;
      startEditable = groupRef.current[nextIndex][0].startEditable;
    } else {
      const nextDataIndex = mapIndex + 1;
      startEditable = groupRef.current[index][nextDataIndex].startEditable;
    }

    if (typeof startEditable === 'function') {
      startEditable();
    }
  });
  // 指定可编辑
  const appointEditable = useRefFunction((recordKey: string, editIndex: number = 0) => {
    const name: string = getDataIndex(editableList[editIndex].dataIndex || '');
    const key = `${name}-${recordKey}`;
    const groupMapItem = groupRecordKeyMap.current[key];
    let startEditable = null;
    if (groupMapItem != null) {
      startEditable =
        groupRef.current[groupMapItem.fisColIndex][groupMapItem.secColIndex].startEditable;
    }
    if (typeof startEditable === 'function') {
      startEditable();
    }
  });

  // 关闭前一个编辑组件
  const closePre = useRefFunction(() => {
    if (curretEdit.current == null) return;
    const name: string = getDataIndex(curretEdit.current.dataIndex || '');
    const key = `${name}-${curretEdit.current.recordKey}`;
    const groupMapItem = groupRecordKeyMap.current[key];

    let endEditable = null;

    if (groupMapItem != null) {
      endEditable =
        groupRef.current[groupMapItem.fisColIndex][groupMapItem.secColIndex].endEditable;
    }
    // console.log('endEditable', endEditable);
    // console.log('typeof endEditable ', typeof endEditable === 'function');
    if (typeof endEditable === 'function') {
      endEditable();
    }
  });

  //自动绑定
  initCreateTwoDimension();
  return {
    fouceDataIndexRef: fouceDataIndexRef,
    group: groupRef,
    editableMap: editableMap,
    startNext,
    closePre,
    curretEdit: curretEdit,
    appointEditable,
    getDataIndex,
    initStartRef,
    selectedRef,
    groupRecordKeyMap,
    editItemMap,
  };
}

const Container = createContainer<ReturnType<typeof useContainer>, EditableProTableContext>(
  useContainer,
);

export type ContainerType = typeof useContainer;

export { useContainer };

export default Container;
