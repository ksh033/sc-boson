import * as React from 'react';
import { Tree, Input } from 'antd';
import { TreeProps } from 'antd/lib/tree';
import { useUpdateEffect, useThrottle } from '@umijs/hooks';
const { useState, useEffect, useCallback, useRef } = React;
const Search = Input.Search;
export interface ScTreeProps extends TreeProps {
  data: any[];
  textField?: string;
  valueField?: string;
  root: any;
  params: any;
  modelKey: string;
  autoload: boolean;
  ansy: boolean;
  model?: string;
  canSearch?: boolean;
  placeholder?: string;
  onSearch?: any;
  nodeRender?: Function;
  request?: (params: any) => Promise<unknown>;
  onLoad?: (data: any) => void;
}

const ScTree: React.FC<ScTreeProps> = props => {
  const {
    data,
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
    autoExpandParent,
    root,
    ...restProps
  } = props;

  const formatTreeData = (_data: any) => {
    if (Array.isArray(_data) && _data.length > 0) {
      return _data.map((item: any) => {
        const { metaInfo, disabled } = item;
        const otherAttr = { disabled: disabled ? disabled : false };
        const attr = { ...otherAttr, dataRef: item };
        let children = item.children;
        let title = (
          <div>
            {item[textField || 'title']}
            {metaInfo ? metaInfo : null}
          </div>
        );
        if (nodeRender) {
          title = nodeRender(item);
        }
        if (children && children.length > 0) {
          children = formatTreeData(children);
        }
        return {
          ...item,
          title,
          key: item[valueField || 'key'],
          children,
          ...attr,
        };
      });
    } else {
      return [];
    }
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

  // let newData = formatTreeData(getData(data));
  // console.log(newData);
  const [treeData, setTreeData] = useState(() => {
    return formatTreeData(getData(data));
  });

  useUpdateEffect(() => {
    if (!request) {
      setTreeData(() => {
        return formatTreeData(getData(data));
      });
    }
  }, [data]);

  const [value, setValue] = useState<any>();
  const throttledValue = useThrottle(value, 500);

  useEffect(() => {
    if (!root && autoload) {
      loadData(params);
    }
  }, []);

  useUpdateEffect(() => {
    if (!root && autoload) {
      loadData(params);
    }
  }, [params]);

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
      let payload = _params ? _params : null;
      payload = params ? { ...params, ..._params } : payload;

      let _data: any = await request(payload);
      if (onLoad) {
        onLoad(treeData);
      }
      _data = formatTreeData(getData(_data));
      setTreeData(_data);
    },
    [params],
  );

  const onLoadData = (treeNode: any): Promise<void> => {
    return new Promise(async resolve => {
      if (treeNode.props.data.children) {
        resolve();
        return;
      }
      if (!request) {
        throw 'no remote request method';
      }
      let _data = await request(treeNode.props.data);
      if (onLoad) {
        onLoad(treeData);
      }
      treeNode.props.data.children = formatTreeData(_data);
      setTreeData([...treeData]);
      resolve();
    });
  };

  const treeProps = {
    treeData: treeData,
    defaultExpandAll: true,
    defaultExpandParent: true,
    ...restProps,
    autoExpandParent: autoExpandParent,
  };

  if (request) {
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
