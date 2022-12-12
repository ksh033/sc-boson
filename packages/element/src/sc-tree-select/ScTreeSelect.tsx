/* eslint-disable react-hooks/rules-of-hooks */
import React, { useRef } from 'react';
import { Input, Spin, TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd/es/tree-select/index';
import type { TreeNodeProps } from 'rc-tree-select/es/TreeNode';
import { useDebounceFn, useRequest, useUpdateEffect } from 'ahooks';
import { SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';

const { useState, useEffect, useCallback } = React;

export interface ScTreeSelectProps extends TreeSelectProps<TreeNodeProps> {
  request?: (params: any) => Promise<void>;
  searchRequest?: (params?: any) => Promise<void>;
  onLoad?: (dataSource: any) => void;
  searchLoad?: (dataSource: any) => void;
  data: any[];
  root: any;
  textField?: string;
  searchTextField?: string;
  pIdField?: string;
  keyField?: string;
  valueField?: string;
  searchField?: string;
  params: any;
  autoload: boolean;
  nodeTransform?: (node: any) => any;
  loadDataPramsFormat?: (data: any) => any;
  searchInputPlaceholder?: string;
}

const defaultKey = 'key';
const defaultText = 'title';
let timeout: any = null;
const ScTreeSelect: React.FC<ScTreeSelectProps> = (props) => {
  const {
    data,
    textField = 'title',
    searchTextField = 'title',
    valueField = 'key',
    searchField = 'keyword',
    searchInputPlaceholder,
    params = null,
    root = null,
    autoload = false,
    nodeTransform = null,
    request,
    onLoad,
    loadDataPramsFormat,
    showSearch = false,
    searchRequest,
    searchLoad,
    onSearch,
    allowClear = false,
    onDropdownVisibleChange,
    loading = false,
    ...restProps
  } = props;
  const isGone = useRef(false);
  const oldData = useRef<any[]>([]);
  const [input, setInput] = useState<string | undefined>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<any>();

  const useSearchRequest = useRequest(
    searchRequest ||
      new Promise((resolve) => {
        resolve(null);
      }),
    {
      manual: true,
    },
  );

  const customRequest = useRequest(
    request ||
      new Promise((resolve) => {
        resolve(null);
      }),
    {
      manual: true,
    },
  );

  const formatTreeData = (_data: any, isSearch = false) => {
    if (!_data) {
      return null;
    }
    return _data.map((item: any) => {
      const value = valueField ? item[valueField] : item[defaultKey];
      // const key = keyField ? item[keyField] : 1 + '_' + index
      let title = textField ? item[textField] : item[defaultText];

      if (isSearch && searchTextField && item[searchTextField]) {
        title = item[searchTextField];
      }
      let nodeProps = {};
      if (nodeTransform) {
        nodeProps = nodeTransform(item);
      }
      let { children } = item;
      if (!isSearch && children && children.length > 0) {
        children = formatTreeData(children);
      }
      if (isSearch) {
        item.isLeaf = true;
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
    let privateData: any[] = [];

    if (!_data) {
      return privateData;
    }

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

  const loadData = useCallback(
    async (_params: any) => {
      if (!request) {
        throw Error('no remote request method');
      }
      let payload = _params || null;
      payload = params ? { ...params, ..._params } : payload;

      let rdata = await customRequest.run(payload);
      if (isGone.current) return;
      if (onLoad) {
        rdata = onLoad(rdata);
      }
      const oldTreeData = formatTreeData(getData(rdata));
      oldData.current = oldTreeData;
      setTreeData(oldTreeData);
    },
    [JSON.stringify(params)],
  );

  const searchLoadData = async (_params: any) => {
    if (!searchRequest) {
      throw Error('no remote searchRequest method');
    }
    let payload = _params || null;
    payload = params ? { ...params, ..._params } : payload;

    let rdata = await useSearchRequest.run(payload);
    if (isGone.current) return;
    if (onLoad) {
      rdata = onLoad(rdata);
    }
    if (searchLoad) {
      rdata = searchLoad(rdata);
    }
    setTreeData(formatTreeData(getData(rdata), true));
  };

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
  }, [JSON.stringify(params)]);

  const onLoadData = (treeNode: any) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve) => {
      if (treeNode.children && treeNode.children.length > 0) {
        resolve();
        return;
      }
      if (!request) {
        throw Error('no remote request method');
      }
      const { children, ...treeRestProps } = treeNode;
      let rParams = treeRestProps;
      if (loadDataPramsFormat) {
        rParams = loadDataPramsFormat(treeNode);
      }
      let rdata = await customRequest.run(rParams);
      if (isGone.current) return;
      if (onLoad) {
        rdata = onLoad(rdata);
      }

      // eslint-disable-next-line no-param-reassign
      treeNode.children = formatTreeData(rdata);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const oldTreeData = connetData(treeData, treeNode);
      oldData.current = oldTreeData;
      setTreeData(oldTreeData);
      resolve();
    });
  };

  const connetData = (_data: any, treeNode: any) => {
    return _data.map((item: any) => {
      let citem = item;
      if (item.key === treeNode.key) {
        citem = treeNode;
      }
      if (item.children) {
        citem.children = connetData(item.children, treeNode);
      }
      return citem;
    });
  };

  const debounce = useDebounceFn(
    (value) => {
      const searchParam: any = {};
      searchParam[searchField] = String(value).trim();
      searchLoadData(searchParam);
    },
    { wait: 500 },
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim() !== '') {
      debounce.cancel();
      debounce.run(value);
    } else {
      setTreeData(oldData.current);
    }

    setInput(value.trim() !== '' ? value.trim() : undefined);
    onSearch?.(value);
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    setDropdownOpen(open);
    onDropdownVisibleChange?.(open);
  };

  useUpdateEffect(() => {
    if (dropdownOpen && showSearch && inputRef.current && inputRef.current.focus) {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        // 如果传入的参数有搜索的参数进行赋值显示
        if (params && params[searchField] != null) {
          setInput(params[searchField] || '');
        }
        inputRef.current.focus({
          preventScroll: true,
        });
      }, 50);
    }
  }, [dropdownOpen]);

  let defaultSelectProps: any = {
    dropdownRender: (menu: any) => {
      return (
        <Spin
          spinning={useSearchRequest.loading || customRequest.loading || loading}
          tip="加载中..."
        >
          {showSearch ? (
            <>
              <div style={{ padding: '4px' }}>
                <Input
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyUp={(e) => {
                    e.stopPropagation();
                  }}
                  placeholder={searchInputPlaceholder || '请输入'}
                  prefix={
                    <SearchOutlined
                      className="site-form-item-icon"
                      style={{ color: '#00000073' }}
                    />
                  }
                  onChange={handleSearch}
                  value={input}
                  style={{ width: '100%' }}
                  allowClear={allowClear}
                  ref={inputRef}
                />
              </div>
            </>
          ) : null}
          <div
            className={classnames({
              'sc-tree-remote-search': showSearch && input != null,
            })}
          >
            {menu}
          </div>
        </Spin>
      );
    },
  };

  if (props.dropdownRender) {
    defaultSelectProps = {
      showSearch: false,
      searchValue: input,
    };
  }

  const treeProps = {
    ...defaultSelectProps,
    treeData,
    loadData: onLoadData,
    style: { width: '100%' },
    loading: loading,
    ...restProps,
  };

  return <TreeSelect {...treeProps} onDropdownVisibleChange={handleDropdownVisibleChange} />;
};

export default ScTreeSelect;
