import * as React from 'react';
import { Tree, Input } from 'antd';
import { TreeProps } from 'antd/lib/tree';
import { useUpdateEffect, useThrottle } from '@umijs/hooks';

const { useState, useEffect, useCallback, useRef } = React;
const { Search } = Input;
export interface ScTreeProps extends TreeProps {
  data?: any[];
  textField?: string;
  valueField?: string;
  params: any;
  autoload?: boolean;
  canSearch?: boolean;
  placeholder?: string;
  onSearch?: any;
  nodeRender?: Function;
  request?: (params: any) => Promise<unknown>;
  onLoad?: (data: any) => void;
  isLeafFormat?: (data: any) => boolean;
  async?: boolean;
  loadDataPramsFormat?: (data: any) => any;
}

interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

const ScTree: React.FC<ScTreeProps> = props => {
  const {
    data = [],
    textField = 'title',
    valueField = 'key',
    params = null,
    autoload = false,
    canSearch = false,
    placeholder = '',
    onSearch = null,
    request,
    onLoad,
    nodeRender,
    isLeafFormat,
    async = false,
    defaultExpandAll = false,
    defaultExpandParent = false,
    loadDataPramsFormat,
    ...restProps
  } = props;

  const formatTreeData = (_data: any): any => {
    if (Array.isArray(_data) && _data.length > 0) {
      return _data.map((item: any) => {
        const { metaInfo, disabled } = item;
        const otherAttr = { disabled: disabled || false };
        const attr = { ...otherAttr, dataRef: item };
        let { children } = item;
        let isLeaf = item.isLeaf;

        let title = (
          <div>
            {item[textField || 'title']}
            {metaInfo || null}
          </div>
        );
        if (nodeRender) {
          title = nodeRender(item);
        }

        if (Array.isArray(children) && children.length > 0) {
          children = formatTreeData(children);
        }
        if (
          isLeafFormat &&
          (item.isLeaf === undefined || item.isLeaf === null)
        ) {
          isLeaf = isLeafFormat(item);
        }
        return {
          title,
          isLeaf,
          key: item[valueField || 'key'],
          ...attr,
          children,
        };
      });
    } else {
      return [];
    }
  };

  // let newData = formatTreeData(getData(data));
  // console.log(newData);
  const [treeData, setTreeData] = useState<any>(() => {
    return formatTreeData(data);
  });

  useUpdateEffect(() => {
    if (!request) {
      setTreeData(() => {
        return formatTreeData(data);
      });
    }
  }, [data]);

  const [value, setValue] = useState<any>();
  const throttledValue = useThrottle(value, 500);

  useUpdateEffect(() => {
    if (onSearch) {
      onSearch(throttledValue);
    }
  }, [throttledValue]);

  const loadData = useCallback(
    async _params => {
      if (!request) {
        throw 'no remote request method';
      }
      let payload = _params || null;
      payload = params ? { ...params, ..._params } : payload;

      let _data: any = await request(payload);
      if (onLoad) {
        onLoad(_data);
      }
      _data = formatTreeData(_data);
      setTreeData(_data);
    },
    [params],
  );

  useEffect(() => {
    if (autoload) {
      loadData(params);
    }
  }, []);

  useUpdateEffect(() => {
    if (autoload) {
      loadData(params);
    }
  }, [params]);

  function updateTreeData(
    list: DataNode[],
    key: React.Key,
    children: DataNode[],
  ): DataNode[] {
    return list.map(node => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      } else if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  }

  const onLoadData = (node: any): Promise<void> => {
    const { key, children } = node;
    return new Promise(async resolve => {
      if (children) {
        resolve();
        return;
      }
      if (!request) {
        throw 'no remote request method';
      }
      let newparams = node.dataRef;
      if (loadDataPramsFormat) {
        newparams = loadDataPramsFormat(node.dataRef);
      }
      const _data = await request(newparams);

      setTreeData((origin: any) => {
        const newData = updateTreeData(origin, key, formatTreeData(_data));
        return newData;
      });
      resolve();
    });
  };

  const treeProps = {
    treeData,
    defaultExpandAll,
    defaultExpandParent,
    ...restProps,
  };

  if (async) {
    treeProps.loadData = onLoadData;
  }

  return (
    <div>
      {canSearch ? (
        <Search
          style={{ marginBottom: 8 }}
          placeholder={placeholder}
          onChange={e => {
            if (onSearch) {
              setValue(e.target.value);
            }
          }}
        />
      ) : null}
      {treeData && treeData.length > 0 ? <Tree {...treeProps} /> : null}
    </div>
  );
};

export default ScTree;
