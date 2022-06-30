import type { FilterValue } from 'antd/es/table/interface';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import type { DensitySize } from './components/ToolBar/DensityIcon';
import type { ScTableProps } from './index';
import type { ColumnsState } from './ScTable';
import type { ActionType } from './typing';
import { genColumnKey } from './utils';

export type UseContainerProps = {
  columnsStateMap?: Record<string, ColumnsState>;
  onColumnsStateChange?: (map: Record<string, ColumnsState>) => void;
  size?: DensitySize;
  onSizeChange?: (size: DensitySize) => void;
  params?: any;
  request?: (params: any) => Promise<any>; // 请求数据的远程方法
  columns?: any[];
  columnsState?: ScTableProps<any>['columnsState'];
};

export type SearchKeywordState = {
  dataIndex: string;
  order: any;
};

function useContainer(props: UseContainerProps = {}) {
  const actionRef = useRef<ActionType>();
  const propsRef = useRef<ScTableProps<any>>();
  const whetherRemote = props.request !== undefined && props.request !== null;
  const defaultColumnsStateMap = useMemo(() => {
    return props.columnsState && props.columnsState.defaultValue
      ? props.columnsState.defaultValue
      : {};
  }, []);

  const defaultColumnKeyMap = useMemo(() => {
    const columnKeyMap = {};
    props.columns?.forEach(({ key, dataIndex, fixed, disable }, index) => {
      const columnKey = genColumnKey(key ?? (dataIndex as React.Key), index);
      if (columnKey) {
        if (props.columnsState?.defaultValue) {
          const state = defaultColumnsStateMap[columnKey] || {};
          columnKeyMap[columnKey] = {
            show: false,
            fixed,
            disable,
            ...state,
          };
        } else {
          columnKeyMap[columnKey] = {
            show: true,
            fixed,
            disable,
          };
        }
      }
    });
    return columnKeyMap;
  }, [props.columns, props.columnsState?.defaultValue, defaultColumnsStateMap]);
  console.log(defaultColumnKeyMap);

  // 共享状态比较难，就放到这里了
  const [keyWords, setKeyWords] = useState<string | undefined>('');
  // 用于排序的数组
  const sortKeyColumns = useRef<string[]>([]);

  // const [tableSize, setTableSize] = useMergedState<DensitySize>(props.size || 'middle', {
  //   value: props.size,
  //   onChange: props.onSizeChange,
  // });

  const [tableSize, setTableSize] = useState<DensitySize>(props.size || 'middle');

  useEffect(() => {
    setTableSize(props.size);
  }, [props.size]);

  const [columnsMap, setColumnsMap] = useMergedState<Record<string, ColumnsState>>(
    () => {
      return props.columnsState?.value || defaultColumnKeyMap;
    },
    {
      value: props.columnsState?.value,
      onChange: props.columnsState?.onChange,
    },
  );
  console.log(columnsMap);

  const [filtersArg, setFiltersArg] = useMergedState<Record<string, FilterValue | null>>({});

  const [sortOrderMap, setSortOrderMap] = useMergedState<Record<string, string>>({});
  return {
    action: actionRef,
    setAction: (newAction?: ActionType) => {
      actionRef.current = newAction;
    },
    sortKeyColumns,
    setSortKeyColumns: (keys: string[]) => {
      sortKeyColumns.current = keys;
    },
    propsRef,
    columnsMap,
    keyWords,
    setKeyWords: (k: string | undefined) => setKeyWords(k),
    setTableSize,
    tableSize,
    setColumnsMap,
    filtersArg,
    setFiltersArg,
    sortOrderMap,
    setSortOrderMap,
    whetherRemote,
  };
}

const Container = createContainer<ReturnType<typeof useContainer>, UseContainerProps>(useContainer);

export type ContainerType = typeof useContainer;

export { useContainer };

export default Container;
