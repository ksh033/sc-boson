/* eslint-disable @typescript-eslint/no-unused-vars */
import { SearchOutlined } from '@ant-design/icons';
import type { TableColumnType } from 'antd';
import { Button, Input, Space, Typography } from 'antd';
import { cloneElement } from 'antd/es/_util/reactNode';
import get from 'rc-util/es/utils/get';
import React from 'react';
import LabelIconTip from '../_util/LabelIconTip';
import omitUndefinedAndEmptyArr from '../_util/omitUndefinedAndEmptyArr';
import type { useContainer } from './container';
import type { ColumnsState } from './ScTable';
import type { ActionType } from './typing';

export const { isValidElement } = React;

export const renderColumnsTitle = (item: any) => {
  const { title } = item;
  if (title && typeof title === 'function') {
    return title(item, 'table', <LabelIconTip label={title} tooltip={item.tooltip || item.tip} />);
  }
  // if (React.isValidElement(title)) {
  //   return title;
  // }
  return <LabelIconTip label={title} tooltip={item.tooltip || item.tip} />;
};

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
export function useActionType(
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

export const getColumnSearchProps = (
  dataIndex: string,
  columnProps: any,
  counter: ReturnType<typeof useContainer>,
) => {
  let { onFilter } = columnProps;
  if (onFilter === undefined || onFilter === null) {
    onFilter = counter.whetherRemote
      ? undefined
      : (value: string, record: any) =>
          record[dataIndex]
            ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
            : '';
  }

  if (columnProps.filters) {
    return {
      filteredValue: counter.filtersArg[dataIndex] || null,
      onFilter,
    };
  }

  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
      let dom = (
        <Input
          placeholder={`请输入`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
          }}
          onPressEnter={() => {
            confirm();
          }}
        />
      );
      if (columnProps.customSearchComponent) {
        const cprops = {
          value: selectedKeys[0],
          onChange: (value: string) => {
            setSelectedKeys(value ? [value] : []);
          },
        };
        dom = isValidElement(columnProps.customSearchComponent)
          ? cloneElement(columnProps.customSearchComponent, cprops)
          : columnProps.customSearchComponent(cprops);
      }

      return (
        <div style={{ padding: 8 }}>
          <div style={{ marginBottom: 8, display: 'block' }}>{dom}</div>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                confirm();
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              查询
            </Button>
            <Button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              重置
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    filteredValue: counter.filtersArg[dataIndex] || null,
    onFilter,
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        // setTimeout(() => this.searchInput.select(), 100);
      }
    },
  };
};

function isNumber(val: any) {
  return typeof val === 'number' && !isNaN(val);
}

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
  multipleSort: boolean;
}): (TableColumnType<T> & { index?: number })[] {
  const { columns, map, counter, multipleSort } = props;
  return columns
    .map((columnProps, columnsIndex) => {
      const {
        dataIndex,
        valueEnum,
        valueType,
        children,
        filters = [],
        canSearch,
        key,
      } = columnProps;
      const columnKey = genColumnKey(dataIndex || key, columnsIndex);
      // 这些都没有，说明是普通的表格不需要 pro 管理
      const noNeedPro = !dataIndex && !valueEnum && !valueType && !children;
      if (noNeedPro) {
        return {
          index: columnsIndex,
          ...columnProps,
        };
      }
      const config = map[columnKey] || { fixed: columnProps.fixed };
      let extraProps = {};
      if (canSearch) {
        extraProps = getColumnSearchProps(dataIndex, columnProps, counter);
      }
      let sorterProps = {};
      const sortOrder = counter.sortOrderMap[dataIndex] ? counter.sortOrderMap[dataIndex] : false;
      if (columnProps.sorter && typeof columnProps.sorter === 'boolean') {
        if (counter.whetherRemote) {
          sorterProps = {
            sorter: multipleSort
              ? {
                  multiple: columnsIndex + 1,
                }
              : true,
            sortOrder: columnProps.sortOrder ? columnProps.sortOrder : sortOrder,
          };
        } else {
          sorterProps = {
            sorter: multipleSort
              ? {
                  compare: (a: any, b: any) => {
                    if (isNumber(a[dataIndex])) {
                      return Number(a[dataIndex]) - Number(b[dataIndex]);
                    }
                    const as: string = String(a[dataIndex]);
                    const bs: string = String(b[dataIndex]);
                    return as.localeCompare(bs, 'zh-CN');
                  },
                  multiple: columnsIndex + 1,
                }
              : (a: any, b: any) => {
                  if (isNumber(a[dataIndex])) {
                    return Number(a[dataIndex]) - Number(b[dataIndex]);
                  }
                  const as: string = String(a[dataIndex]);
                  const bs: string = String(b[dataIndex]);
                  return as.localeCompare(bs, 'zh-CN');
                },
            sortOrder: columnProps.sortOrder ? columnProps.sortOrder : sortOrder,
          };
        }
      } else {
        sorterProps = {
          ...columnProps.sorter,
          sortOrder: columnProps.sortOrder ? columnProps.sortOrder : sortOrder,
        };
      }

      const tempColumns: any = {
        key: columnKey,
        index: columnsIndex,
        ...extraProps,
        ...columnProps,
        ...sorterProps,
        title: renderColumnsTitle(columnProps),
        filters,
        fixed: config.fixed,
        width: columnProps.width || (columnProps.fixed ? 200 : undefined),
        children: columnProps.children
          ? genColumnList({
              ...props,
              columns: columnProps?.children,
            })
          : undefined,
      };
      return omitUndefinedAndEmptyArr(tempColumns);
    })
    .filter((item) => !item.hideInTable) as unknown as (TableColumnType<T> & {
    index?: number;
  })[];
}
