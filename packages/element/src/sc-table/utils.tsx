import React from 'react';
import type { TablePaginationConfig, TableColumnType } from 'antd';
import { Space, Form, Typography } from 'antd';

import {ActionType} from './typing'
import get from 'rc-util/lib/utils/get';
import omitUndefinedAndEmptyArr from '../_util/omitUndefinedAndEmptyArr'
import omitBoolean from '../_util/omitBoolean'
import isNil from '../_util/isNil'

import type { ColumnsState, useContainer } from './container';

/**
 * 检查值是否存在 为了 避开 0 和 false
 *
 * @param value
 */
export const checkUndefinedOrNull = (value: any) => value !== undefined && value !== null;

/**
 * 根据 key 和 dataIndex 生成唯一 id
 *
 * @param key 用户设置的 key
 * @param dataIndex 在对象中的数据
 * @param index 序列号，理论上唯一
 */
export const genColumnKey = (key?: React.ReactText | undefined, index?: number): string => {
  if (key) {
    return Array.isArray(key) ? key.join('-') : key.toString();
  }
  return `${index}`;
};

/**
 * 生成 Copyable 或 Ellipsis 的 dom
 *
 * @param dom
 * @param item
 * @param text
 */
export const genCopyable = (dom: React.ReactNode, item: any, text: string) => {
  if (item.copyable || item.ellipsis) {
    return (
      <Typography.Text
        style={{
          maxWidth: '100%',
          margin: 0,
          padding: 0,
        }}
        title=""
        copyable={
          item.copyable && text
            ? {
                text,
                tooltips: ['', ''],
              }
            : undefined
        }
        ellipsis={item.ellipsis && text ? { tooltip: text } : false}
      >
        {dom}
      </Typography.Text>
    );
  }
  return dom;
};



/**
 * 获取用户的 action 信息
 *
 * @param actionRef
 * @param counter
 * @param onCleanSelected
 */
export function useActionType<T>(
  ref: React.MutableRefObject<ActionType | undefined>,
  action: any,
  props: {
    fullScreen: () => void;
    onCleanSelected: () => void;
    resetAll: () => void;
    editableUtils: any;
  },
) {
  /** 这里生成action的映射，保证 action 总是使用的最新 只需要渲染一次即可 */
  const userAction: ActionType = {
    ...props.editableUtils,
    pageInfo: action.pageInfo,
    reload: async (resetPageIndex?: boolean) => {
      // 如果为 true，回到第一页
      if (resetPageIndex) {
        await props.onCleanSelected();
      }
      action?.reload();
    },
    reloadAndRest: async () => {
      // reload 之后大概率会切换数据，清空一下选择。
      props.onCleanSelected();
      await action.setPageInfo({
        current: 1,
      });
      await action?.reload();
    },
    reset: async () => {
      await props.resetAll();
      await action?.reset?.();
      await action?.reload();
    },
    fullScreen: () => props.fullScreen(),
    clearSelected: () => props.onCleanSelected(),
  };
  // eslint-disable-next-line no-param-reassign
  ref.current = userAction;
}

type PostDataType<T> = (data: T) => T;

/**
 * 一个转化的 pipeline 列表
 *
 * @param data
 * @param pipeline
 */
export function postDataPipeline<T>(data: T, pipeline: PostDataType<T>[]) {
  if (pipeline.filter((item) => item).length < 1) {
    return data;
  }
  return pipeline.reduce((pre, postData) => {
    return postData(pre);
  }, data);
}

export const tableColumnSort = (columnsMap: Record<string, ColumnsState>) => (a: any, b: any) => {
  const { fixed: aFixed, index: aIndex } = a;
  const { fixed: bFixed, index: bIndex } = b;
  if ((aFixed === 'left' && bFixed !== 'left') || (bFixed === 'right' && aFixed !== 'right')) {
    return -2;
  }
  if ((bFixed === 'left' && aFixed !== 'left') || (aFixed === 'right' && bFixed !== 'right')) {
    return 2;
  }
  // 如果没有index，在 dataIndex 或者 key 不存在的时候他会报错
  const aKey = a.key || `${aIndex}`;
  const bKey = b.key || `${bIndex}`;
  if (columnsMap[aKey]?.order || columnsMap[bKey]?.order) {
    return (columnsMap[aKey]?.order || 0) - (columnsMap[bKey]?.order || 0);
  }
  return (a.index || 0) - (b.index || 0);
};



export const defaultOnFilter = (value: string, record: any, dataIndex: string | string[]) => {
  const recordElement = Array.isArray(dataIndex)
    ? get(record, dataIndex as string[])
    : record[dataIndex];
  const itemValue = String(recordElement) as string;

  return String(itemValue) === String(value);
};

/** 转化列的定义 */
type ColumnRenderInterface<T> = {
  columnProps: any;
  text: any;
  rowData: T;
  index: number;
  columnEmptyText?: any;
  type: any;
  counter: ReturnType<typeof useContainer>;
  editableUtils: any;
};

const isMergeCell = (
  dom: any, // 如果是合并单元格的，直接返回对象
) => dom && typeof dom === 'object' && dom?.props?.colSpan;


/**
 * 转化 columns 到 pro 的格式 主要是 render 方法的自行实现
 *
 * @param columns
 * @param map
 * @param columnEmptyText
 */
export function genColumnList<T>(props: {
  columns: any[];
  map: Record<string, ColumnsState>;
  counter: ReturnType<typeof useContainer>;
}): (TableColumnType<T> & { index?: number })[] {
  const { columns, map, counter } = props;
  return (columns
    .map((columnProps, columnsIndex) => {
      const {
        key,
        dataIndex,
        valueEnum,
        valueType,
        children,
        onFilter,
        filters = [],
      } = columnProps;
      const columnKey = genColumnKey(key, columnsIndex);
      // 这些都没有，说明是普通的表格不需要 pro 管理
      const noNeedPro = !dataIndex && !valueEnum && !valueType && !children;
      if (noNeedPro) {
        return {
          index: columnsIndex,
          ...columnProps,
        };
      }
      const { propsRef } = counter;
      const config = map[columnKey] || { fixed: columnProps.fixed };

      const genOnFilter = () => {
        if (!propsRef.current?.request || onFilter === true) {
          return (value: string, row: T) => defaultOnFilter(value, row, dataIndex as string[]);
        }
        return omitBoolean(onFilter);
      };
      const tempColumns = {
        index: columnsIndex,
        ...columnProps,
       // title: renderColumnsTitle(columnProps),
        filters,
       // ellipsis: false,
        fixed: config.fixed,
        width: columnProps.width || (columnProps.fixed ? 200 : undefined),
        children: (columnProps).children
          ? genColumnList({
              ...props,
              columns: (columnProps)?.children,
            })
          : undefined
      };
      return omitUndefinedAndEmptyArr(tempColumns);
    })
    .filter((item) => !item.hideInTable) as unknown) as (TableColumnType<T> & {
    index?: number;
  })[];
}
