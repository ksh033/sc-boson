import React, { useRef } from 'react';
import { TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd/lib/tree-select/index';
import type  { TreeNodeProps } from 'rc-tree-select/lib/TreeNode';
import { useUpdateEffect } from '@umijs/hooks';
import useFetchData from '../_util/useFetchData';

const { useState, useEffect, useMemo, useCallback } = React;
export interface ScTreeSelectProps extends TreeSelectProps<TreeNodeProps> {
  request?: (params: any) => Promise<void>;
  onLoad?: (dataSource: any) => void;
  data: any[];
  root: any;
  dispatch: any;
  textField?: string;
  pIdField?: string;
  keyField?: string;
  valueField?: string;
  params: any;
  autoload: boolean;
  nodeTransform?: Function;
}

const defaultKey = 'key';
const defaultText = 'title';

const ScTreeSelect: React.FC<ScTreeSelectProps> = props => {
  const {
    data,
    textField = 'title',
    valueField = 'key',
    params = null,
    root = null,
    autoload = false,
    nodeTransform = null,
    request,
    onLoad,
    ...restProps
  } = props;
  const isGone = useRef(false);
  const formatTreeData = (_data: any) => {
    return _data.map((item: any, index: number) => {
      const value = valueField ? item[valueField] : item[defaultKey];
      // const key = keyField ? item[keyField] : 1 + '_' + index
      const title = textField ? item[textField] : item[defaultText];

      let nodeProps = {};
      if (nodeTransform) {
        nodeProps = nodeTransform(item);
      }
      let children = item.children;
      if (children && children.length > 0) {
        children = formatTreeData(children);
      }
      return {
        ...item,
        title,
        value,
        key: value,
        children,
        ...nodeProps,
      };
    });
  };

  const getData = (_data: any) => {
    let privateData = [];
    if (root) {
      if (Array.isArray(_data) && _data.length > 0) {
        root.children = _data;
      }
      privateData.push(root);
    } else {
      privateData = _data;
    }
    return privateData;
  };

  const [treeData, setTreeData] = useState(() => {
    return formatTreeData(getData(data));
  });

  useUpdateEffect(() => {
    if (!autoload) {
      setTreeData(formatTreeData(getData(data)));
    }
  }, [data]);

  useEffect(() => {
    if (autoload && !root) {
      loadData(null);
    }
    return () => {
      isGone.current = true;
    };
  }, []);

  useUpdateEffect(() => {
    if (!root && autoload) {
      loadData(null);
    }
  }, [params]);

  const loadData = useCallback(
    async _params => {
      if (!request) {
        throw 'no remote request method';
      }
      let payload = _params ? _params : null;
      payload = params ? { ...params, ..._params } : payload;

      let _data = await useFetchData(request, payload);
      if (isGone.current) return;
      if (onLoad) {
        _data = onLoad(_data);
      }
      setTreeData(formatTreeData(getData(_data)));
    },
    [params],
  );

  const onLoadData = (treeNode: any) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async resolve => {
      if (
        treeNode.props.data.children &&
        treeNode.props.data.children.length > 0
      ) {
        resolve();
        return;
      }
      if (!request) {
        throw 'no remote request method';
      }
      
      let _data = await useFetchData(request, treeNode.props.data);
      if (isGone.current) return;
      if (onLoad) {
        _data = onLoad(_data);
      }

      // eslint-disable-next-line no-param-reassign
      treeNode.props.data.children = formatTreeData(_data);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      setTreeData(connetData(treeData, treeNode.props.data));
      resolve();
    });
  };

  const connetData = (_data: any, treeNode: any) => {
    return _data.map((item: any) => {
      if (item.key === treeNode.key) {
        item = treeNode;
      }
      if (item.children) {
        item.children = connetData(item.children, treeNode);
      }
      return item;
    });
  };

  const onDropdownVisibleChange = () => {
    // if ((treeData === null || treeData.length < 1) && !autoload) {
    //   loadData(null)
    // }
  };

  const treeProps = useMemo(() => {
    return {
      treeData,
      loadData: onLoadData,
      style: { width: '100%' },
      onDropdownVisibleChange: onDropdownVisibleChange,
      ...restProps,
    };
  }, [restProps, treeData]);

  return treeData && treeData.length > 0 ? (
    <TreeSelect {...treeProps}></TreeSelect>
  ) : null;
};

export default ScTreeSelect;