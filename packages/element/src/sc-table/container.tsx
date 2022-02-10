import { createContainer } from 'unstated-next';
import { useState, useRef } from 'react';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import type { FixedType } from 'rc-table/es/interface';
import type { ScTableProps } from './index';
import type { DensitySize } from './components/ToolBar/DensityIcon';
import type { ActionType } from './typing';
import type { FilterValue } from 'antd/es/table/interface';

export type ColumnsState = {
  show?: boolean;
  fixed?: FixedType;
  order?: number;
};

export type UseContainerProps = {
  columnsStateMap?: Record<string, ColumnsState>;
  onColumnsStateChange?: (map: Record<string, ColumnsState>) => void;
  size?: DensitySize;
  onSizeChange?: (size: DensitySize) => void;
  params?: any;
  request?: (params: any) => Promise<any>; // 请求数据的远程方法
};

export type SearchKeywordState = {
  dataIndex: string;
  order: any;
};

function useContainer(props: UseContainerProps = {}) {
  const actionRef = useRef<ActionType>();
  const propsRef = useRef<ScTableProps<any>>();
  const whetherRemote = props.request !== undefined && props.request !== null;

  // 共享状态比较难，就放到这里了
  const [keyWords, setKeyWords] = useState<string | undefined>('');
  // 用于排序的数组
  const sortKeyColumns = useRef<string[]>([]);

  const [tableSize, setTableSize] = useMergedState<DensitySize>(props.size || 'middle', {
    value: props.size,
    onChange: props.onSizeChange,
  });

  const [columnsMap, setColumnsMap] = useMergedState<Record<string, ColumnsState>>(
    props.columnsStateMap || {},
    {
      value: props.columnsStateMap,
      onChange: props.onColumnsStateChange,
    },
  );

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
