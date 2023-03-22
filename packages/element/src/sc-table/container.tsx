import type { FilterValue } from 'antd/es/table/interface';
import useMergedState from 'rc-util/es/hooks/useMergedState';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import type { DensitySize } from './components/ToolBar/DensityIcon';
import type { ScTableProps } from './index';
import type {
  ActionType,
  ColumnsState,
  ScProColumn,
  ScProColumnType,
  SorterItem,
  SortValue,
} from './typing';
import { genColumnKey } from './utils';

export type UseContainerProps = Pick<
  ScTableProps<any>,
  'columns' | 'params' | 'request' | 'columnsState' | 'defaultSort'
> & {
  columnsStateMap?: Record<string, ColumnsState>;
  onColumnsStateChange?: (map: Record<string, ColumnsState>) => void;
  size?: DensitySize;
  onSizeChange?: (size: DensitySize) => void;
};

export type SearchKeywordState = {
  dataIndex: string;
  order: any;
};

export type SortValueList = SortValue & {
  dataIndex: string;
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

    props.columns?.forEach(({ key, dataIndex, fixed, disable }: ScProColumnType<any>, index) => {
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
  // 计算默认排序
  const countDefaultSort = (_columns: ScProColumn<any>) => {
    const strSortList: Partial<SortValueList>[] = [];
    const objSortList: Partial<SortValueList>[] = [];
    if (Array.isArray(_columns)) {
      _columns?.forEach((item: ScProColumnType<any>, index) => {
        const columnKey = genColumnKey(item.key ?? (item.dataIndex as React.Key), index);
        if (item.sorter && item.defaultSortOrder != null) {
          if (typeof item.defaultSortOrder === 'string') {
            strSortList.push({
              value: item.defaultSortOrder,
              dataIndex: columnKey,
            });
          } else {
            objSortList.push({
              dataIndex: columnKey,
              ...item.defaultSortOrder,
            });
          }
        }
      });
    }
    // 寻找最大权重
    let maxWi = 1;
    if (objSortList.length > 0) {
      objSortList.sort((a, b) => {
        return Number(a.sort || 0) - Number(b.sort || 0);
      });
      maxWi = Number(objSortList[objSortList.length - 1].sort);
    }
    maxWi = maxWi + 1;
    const sorterMap: SorterItem = {};
    [...objSortList, ...strSortList].forEach((it, index) => {
      if (it.dataIndex) {
        let sort = it.sort;
        if (sort == null) {
          sort = maxWi;
          maxWi++;
        }
        sorterMap[it.dataIndex || ''] = {
          value: it.value || 'ascend',
          sort: sort,
          showNum: index + 1,
        };
      }
    });

    return sorterMap;
  };
  // 默认排序
  const innerDefaultSorterMap: SorterItem = useMemo(() => {
    if (props.columns) {
      return countDefaultSort(props.columns);
    }
    return {};
  }, [props.columns]);

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

  const [filtersArg, setFiltersArg] = useMergedState<Record<string, FilterValue | null>>({});

  const [sortOrderMap, setSortOrderMap] = useMergedState<SorterItem>(
    props.defaultSort || innerDefaultSorterMap,
  );

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
    defaultSorterMap: innerDefaultSorterMap,
  };
}

const Container = createContainer<ReturnType<typeof useContainer>, UseContainerProps>(useContainer);

export type ContainerType = typeof useContainer;

export { useContainer };

export default Container;
