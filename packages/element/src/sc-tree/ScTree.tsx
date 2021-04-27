import React, { useMemo } from 'react';
import { Tree, Input, Space } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import { useUpdateEffect, useThrottle } from 'ahooks';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { updateTreeData, addTreeData, deleteTreeData, defaultNode } from './utils';
import type { ScTreeProps, ActionType, ActionFunctionVO, DefaultAction } from './typing';

const { useState, useEffect, useRef, useCallback } = React;
const { Search } = Input;

const ScTree: React.FC<ScTreeProps> = (props) => {
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
    isLeafFormat,
    saveRef,
    actionRender,
    async = false,
    defaultExpandAll = false,
    defaultExpandParent = false,
    loadDataPramsFormat,
    ...restProps
  } = props;
  const isGone = useRef(false);
  const actionRef = useRef<ActionType>();

  const formatTreeData = (_data: any): any => {
    if (Array.isArray(_data) && _data.length > 0) {
      return _data.map((item: any) => {
        const { disabled, metaInfo } = item;
        const otherAttr = { disabled: disabled || false, metaInfo };
        let { children } = item;
        let { isLeaf } = item;
        const title = item[textField || 'title'];
        if (Array.isArray(children) && children.length > 0) {
          children = formatTreeData(children);
        }
        if (isLeafFormat && (item.isLeaf === undefined || item.isLeaf === null)) {
          isLeaf = isLeafFormat(item);
        }
        return {
          title,
          show: false,
          isLeaf,
          key: item[valueField || 'key'],
          ...otherAttr,
          children,
        };
      });
    }
    return [];
  };

  const [treeData, setTreeData] = useMergedState<any[]>([], {
    defaultValue: data,
    postState: (value: any) => {
      return formatTreeData(value);
    },
  });
  const [showKey, setShowKey] = useState<string | null>(null);

  const actionFunction = useCallback(
    (key: any, rowData: DataNode, fun: (arg0: any[], arg1: any, arg2: any) => any): void => {
      const newTreeData = fun(treeData, key, rowData);
      setTreeData(newTreeData);
    },
    [setTreeData, treeData],
  );

  const allAction: DefaultAction<DataNode> = {
    add: (key: any, _rowData: DataNode) => {
      actionFunction(key, _rowData, addTreeData);
    },
    delete: (key: any, _rowData: DataNode) => {
      actionFunction(key, _rowData, deleteTreeData);
    },
    edit: (key: any, _rowData: DataNode) => {
      actionFunction(key, _rowData, updateTreeData);
    },
  };

  const titleRender = useCallback(
    (rowData: DataNode) => {
      let action: ActionFunctionVO<DataNode> | null = null;

      let extendRender: React.ReactNode[] = [];
      let alwaysShow = false;
      if (props.actionRender) {
        action = props.actionRender(rowData, allAction);
        const extendAction = action?.extendAction ? action?.extendAction() : [];
        if (Array.isArray(extendAction)) {
          extendRender = extendAction;
        } else {
          extendRender = [extendAction];
        }
        alwaysShow = action?.alwaysShow ? action?.alwaysShow : false;
      }
      const show = rowData.key === showKey;

      const actionDom =
        alwaysShow || show ? (
          <>
            {action?.add ? defaultNode(rowData, 'add', action?.add) : null}
            {action?.delete ? defaultNode(rowData, 'del', action?.delete) : null}
            {action?.edit ? defaultNode(rowData, 'edit', action?.edit) : null}
            {extendRender}
          </>
        ) : null;

      return (
        <Space>
          {rowData.title}
          {actionDom}
        </Space>
      );
    },
    [allAction, props.actionRender, showKey],
  );

  useUpdateEffect(() => {
    if (!request) {
      setTreeData(data);
    }
  }, [data]);

  const [value, setValue] = useState<any>();
  const throttledValue = useThrottle(value, {
    wait: 500,
  });

  useUpdateEffect(() => {
    if (onSearch) {
      onSearch(throttledValue);
    }
  }, [throttledValue]);

  const loadData = async (_params: any) => {
    if (!request) {
      throw new Error('no remote request method');
    }
    let payload = _params || null;
    payload = params ? { ...params, ..._params } : payload;

    let rData: any = await request(payload);
    if (isGone.current) return;
    if (onLoad) {
      rData = onLoad(rData);
    }
    setTreeData(rData);
  };

  useEffect(() => {
    if (typeof saveRef === 'function' && actionRef.current) {
      saveRef(actionRef.current);
    }
  }, [saveRef]);

  if (saveRef) {
    // @ts-ignore
    saveRef.current = actionRef.current;
  }

  const userAction: ActionType = {
    reload: () => {
      loadData(params);
    },
    ...allAction,
  };

  actionRef.current = userAction;

  /** 绑定 action ref */
  React.useImperativeHandle(
    saveRef,
    () => {
      return actionRef.current;
    },
    [],
  );

  useEffect(() => {
    if (autoload) {
      loadData(params);
    }
    return () => {
      actionRef.current = undefined;
      isGone.current = true;
    };
  }, []);

  useUpdateEffect(() => {
    if (autoload) {
      loadData(params);
    }
  }, [JSON.stringify(params)]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function addChilList(list: any[], key: React.Key, children: any[]): any[] {
    return list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addChilList(node.children, key, children),
        };
      }
      return node;
    });
  }

  const onLoadData = useCallback(
    (node: any): Promise<void> => {
      const { key, children } = node;
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve) => {
        if (children) {
          resolve();
          return;
        }
        if (!request) {
          throw new Error('no remote request method');
        }
        let newparams = node;
        if (loadDataPramsFormat) {
          newparams = loadDataPramsFormat(node);
        }
        const rData: any[] = await request(newparams);
        if (isGone.current) return;
        const newData = addChilList(treeData, key, rData);
        setTreeData(newData);
        resolve();
      });
    },
    [addChilList, loadDataPramsFormat, request, setTreeData, treeData],
  );

  const treeProps = useMemo(() => {
    const inTreeProps: ScTreeProps = {
      treeData,
      defaultExpandAll,
      defaultExpandParent,
      titleRender,
    };
    if (async) {
      inTreeProps.loadData = onLoadData;
    }
    return inTreeProps;
  }, [treeData, defaultExpandAll, defaultExpandParent, titleRender, async, onLoadData]);

  const handleMouseEnter = (e: any) => {
    const { node } = e;
    setShowKey(node.key);
  };

  const handleMouseLeave = () => {
    setShowKey(null);
  };

  return (
    <div>
      {canSearch ? (
        <Search
          style={{ marginBottom: 8 }}
          placeholder={placeholder}
          onChange={(e) => {
            if (onSearch) {
              setValue(e.target.value);
            }
          }}
        />
      ) : null}
      {treeData && treeData.length > 0 ? (
        <Tree
          {...treeProps}
          {...restProps}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      ) : null}
    </div>
  );
};

export default ScTree;
