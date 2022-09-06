import { useThrottle, useUpdateEffect } from 'ahooks';
import { Input, Space, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { NodeMouseEventParams } from 'rc-tree/es/contextTypes';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import React, { useMemo } from 'react';
import type { ActionFunctionVO, ActionType, DefaultAction, ScTreeProps } from './typing';
import { addTreeData, defaultNode, deleteTreeData, updateTreeData } from './utils';

const { useState, useEffect, useRef, useCallback } = React;
const { Search } = Input;
const { DirectoryTree } = Tree;
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
    treeType = 'Tree',
    onLoad,
    isLeafFormat,
    saveRef,
    render,
    root,
    actionRender,
    async = false,
    defaultExpandAll = false,
    defaultExpandParent = false,
    loadDataPramsFormat,
    onMouseEnter,
    onMouseLeave,
    onDataChange,
    ...restProps
  } = props;
  const isGone = useRef(false);
  const actionRef = useRef<ActionType>();

  const formatTreeData = (_data: any): any => {
    if (Array.isArray(_data) && _data.length > 0) {
      return _data.map((item: any) => {
        const { disabled, metaInfo, children, dataRef, ...restItem } = item;
        let rChildren = children;
        let rIsLeaf = item.isLeaf;
        const otherAttr = { disabled: disabled || false, metaInfo, dataRef: dataRef || restItem };
        const title = render
          ? render({
              ...dataRef,
              ...(restItem || {}),
            })
          : item[textField || 'title'] || item.title;
        if (Array.isArray(children) && children.length > 0) {
          rChildren = formatTreeData(children);
        }
        if (isLeafFormat && (item.isLeaf === undefined || item.isLeaf === null)) {
          rIsLeaf = isLeafFormat(item);
        }
        return {
          title,
          show: false,
          isLeaf: rIsLeaf,
          key: item[valueField || 'key'] || item.key,
          ...otherAttr,
          children: rChildren,
        };
      });
    }
    return [];
  };

  const [treeData, setTreeData] = useMergedState<any[]>([], {
    value: data,
    onChange: onDataChange,
    postState: formatTreeData,
  });

  const [showKey, setShowKey] = useState<string | number>('');

  /**
   * 打平这个数组
   *
   * @param records
   * @param parentKey
   */
  function dig(records: any[], map: Map<React.Key, any>) {
    if (Array.isArray(records)) {
      records.forEach((record) => {
        const childrenList = record.children;
        const newRecord = {
          ...record,
          children: undefined,
        };
        delete newRecord.children;
        map.set(record.key, newRecord);
        dig(childrenList, map);
      });
    }
  }

  const actionFunction = useCallback(
    (key: any, rowData: DataNode, fun: (arg0: any[], arg1: any, arg2: any) => any): void => {
      const newTreeData = fun(treeData, key, rowData);
      setTreeData(newTreeData);
    },
    [setTreeData, treeData],
  );

  const allAction: DefaultAction<DataNode> = {
    add: async (key: any, _rowData: DataNode, isRoot?: boolean) => {
      let oldTreeData: any = treeData;
      if (async && request && !(isRoot !== undefined && isRoot !== null && isRoot)) {
        const map = new Map<React.Key, any>();
        dig(treeData, map);

        let newparams = map.get(key).dataRef;
        if (loadDataPramsFormat) {
          newparams = loadDataPramsFormat(map.get(key).dataRef);
        }
        let rData: any[] = await request(newparams);
        if (onLoad) {
          rData = onLoad(rData);
        }
        oldTreeData = addChilList(treeData, key, rData);
      }

      const newTreeData = addTreeData(oldTreeData, key, _rowData, valueField, isRoot);
      setTreeData(newTreeData);
    },
    delete: (key: any, _rowData: DataNode) => {
      actionFunction(key, _rowData, deleteTreeData);
    },
    edit: (key: any, _rowData: DataNode) => {
      actionFunction(key, _rowData, updateTreeData);
    },
  };

  useUpdateEffect(() => {
    if (!request) {
      setTreeData(data);
    }
  }, [data]);

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

      const title = typeof rowData.title === 'function' ? rowData.title(rowData) : rowData.title;

      return (
        <Space key={`${rowData.key}`}>
          <div>{title}</div>
          <Space>{actionDom}</Space>
        </Space>
      );
    },
    [allAction, props.actionRender, showKey],
  );

  const [value, setValue] = useState<any>();
  const throttledValue = useThrottle(value, {
    wait: 500,
  });

  useUpdateEffect(() => {
    if (onSearch) {
      onSearch(throttledValue);
    }
  }, [throttledValue]);

  const loadData = async (_params: any, isRoot?: boolean) => {
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
    if (isRoot) {
      if (root) {
        root.children = rData;
      }
      setTreeData([root]);
    } else {
      setTreeData(rData);
    }
  };

  const userAction: ActionType = {
    reload: () => {
      loadData(params);
    },
    ...allAction,
  };

  actionRef.current = userAction;
  useEffect(() => {
    if (typeof saveRef === 'function' && actionRef.current) {
      saveRef(actionRef.current);
    }
  }, [saveRef]);

  if (saveRef) {
    // @ts-ignore
    saveRef.current = actionRef.current;
  }

  /** 绑定 action ref */
  React.useImperativeHandle(
    saveRef,
    () => {
      return actionRef.current;
    },
    [],
  );

  useUpdateEffect(() => {
    if (root) {
      setTreeData([root]);
    } else {
      loadData({});
    }
  }, [JSON.stringify(params)]);
  useEffect(() => {
    if (root && autoload) {
      loadData(params, true);
    } else if (root && !autoload) {
      setTreeData([root]);
    } else {
      if (autoload) loadData(params);
    }

    return () => {
      actionRef.current = undefined;
      isGone.current = true;
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function addChilList(list: any[], key: React.Key, children: any[]): any[] {
    return list.map((node) => {
      if (node.key === key) {
        if (Array.isArray(children) && children.length > 0) {
          return {
            ...node,
            children,
          };
        }
        return {
          ...node,
          isLeaf: true,
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

      return new Promise<any>(async (resolve) => {
        if (children && children.length > 0) {
          resolve([]);
          return;
        }
        if (!request) {
          throw new Error('no remote request method');
        }
        let newparams = node.dataRef;
        if (loadDataPramsFormat) {
          newparams = loadDataPramsFormat(node.dataRef);
        }
        newparams = { ...params, ...newparams };
        const rData: any[] = await request(newparams);
        if (isGone.current) return;
        const newData = addChilList(treeData, key, rData);
        setTreeData(newData);
        resolve([]);
      });
    },
    [addChilList, loadDataPramsFormat, request, setTreeData, treeData, params],
  );

  const treeProps = useMemo(() => {
    const inTreeProps: ScTreeProps = {
      treeData: treeData,
      defaultExpandAll,
      defaultExpandParent,
      titleRender,
    };
    if (async) {
      inTreeProps.loadData = onLoadData;
    }

    return inTreeProps;
  }, [treeData, defaultExpandAll, defaultExpandParent, titleRender, async, onLoadData]);

  const handleMouseEnter = (e: NodeMouseEventParams<DataNode, HTMLSpanElement>) => {
    setShowKey(e.node.key);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: NodeMouseEventParams<DataNode, HTMLSpanElement>) => {
    setShowKey('');
    onMouseLeave?.(e);
  };

  const TreeCmp = useMemo(() => {
    return treeType === 'DirectoryTree' ? DirectoryTree : Tree;
  }, [treeType]);
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
        <TreeCmp
          blockNode
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...treeProps}
          {...restProps}
        />
      ) : null}
    </div>
  );
};

export default ScTree;
