/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SearchOutlined } from '@ant-design/icons';
import { useDebounceFn, useUpdateEffect } from 'ahooks';
import { Divider, Input, Select, Spin, Tooltip } from 'antd';
import type { SelectProps } from 'antd/es/select';
import * as React from 'react';
import { setTimeout } from 'timers';

const { useMemo, useLayoutEffect, useState, useRef } = React;
const { Option, OptGroup } = Select;
export interface ScSelectProps extends Omit<SelectProps<any>, 'placeholder'> {
  textField?: any;
  valueField?: string;
  groupField?: string;
  data?: any[];
  params?: any;
  autoload?: boolean;
  group?: boolean;
  tip?: boolean;
  model?: string;
  remoteSearch?: boolean;
  request?: (params: any) => Promise<any>;
  onLoad?: (data: any) => any;
  searchField?: string;
  customRef?: React.MutableRefObject<any>;
  singleInput?: boolean;
  openReloadData?: boolean;
  preHandle?: (params: any) => boolean;
  placeholder?: string;
  searchInputPlaceholder?: string;
}
let timeout: any = null;
const ScSelect: React.FC<ScSelectProps> = (props) => {
  const {
    data = [],
    params = null,
    tip = false,
    textField = 'text',
    valueField = 'value',
    autoload = false,
    onLoad,
    request,
    remoteSearch = false,
    showSearch = false,
    searchField = '_search',
    customRef,
    group = false,
    onSearch,
    singleInput = false,
    onChange,
    openReloadData,
    groupField = 'group',
    onDropdownVisibleChange,
    preHandle,
    placeholder = '请选择',
    searchInputPlaceholder = '请输入查询',
    defaultActiveFirstOption = true,
    allowClear = false,
    ...restProps
  } = props;
  const isGone = useRef(false);
  // 存储第一次查询的记录，当查询数据为空的时候赋值用
  const autoloadData = useRef<any[]>([]);
  const [dataSource, setDataSource] = useState(data || []);

  const [input, setInput] = useState('');
  const [inputKey, setInputKey] = useState(-1);
  const selectProps: any = { params, ...restProps };
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setOpen] = useState(false);
  const ref = useRef<any>();
  const inputRef = useRef<any>();
  // const [searchValue,setSearchValue]=useState("");

  const setCustomRef = () => {
    if (customRef) {
      customRef.current = ref.current;
    }
  };

  useUpdateEffect(() => {
    if (!request && data) {
      setDataSource(data || []);
    }
  }, [JSON.stringify(data)]);

  const loadData = async (searchParam?: any) => {
    if (!request) {
      throw new Error('no remote request method');
    }
    let flag: boolean = true;
    if (preHandle) {
      flag = preHandle?.(searchParam);
    }
    if (flag) {
      setLoading(true);
      try {
        let rdata = await request({ ...params, ...searchParam });

        if (isGone.current) return;
        if (rdata) {
          if (onLoad) {
            rdata = onLoad(rdata);
          }
          // 存储第一次查询的记录，当查询数据为空的时候赋值用
          if (Array.isArray(autoloadData.current) && autoloadData.current?.length === 0) {
            autoloadData.current = rdata || [];
          }
          setDataSource(rdata || []);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const debounce = useDebounceFn(
    (value) => {
      const searchParam: any = {};
      searchParam[searchField] = String(value).trim();
      loadData(searchParam);
    },
    { wait: 500 },
  );

  useUpdateEffect(() => {
    if (autoload) {
      loadData();
    }
  }, [JSON.stringify(params)]);

  useLayoutEffect(() => {
    setCustomRef();
    if (autoload) {
      loadData();
    }
    return () => {
      isGone.current = true;
    };
  }, []);

  const getTextField = (item: any) => {
    let text = typeof textField === 'string' ? item[textField] : textField(item);
    if (text == null) {
      text = item.label;
    }
    return String(text);
  };

  const renderList = (cData: any[], level: string = '1') => {
    const list: any[] = [];
    if (!(remoteSearch && request)) {
      cData.filter((item) => {
        const text = getTextField(item);
        return text.indexOf(input) > -1;
      });
    }
    cData.forEach((item: any, index: number) => {
      if (valueField && textField) {
        let text: any = getTextField(item);
        if (tip) {
          text = <Tooltip title={text}>{text}</Tooltip>;
        }
        list.push(
          <Option key={level + index.toString()} value={item[valueField]} data={item}>
            {text}
          </Option>,
        );
      }
    });
    return list;
  };
  const children: any[] = useMemo(() => {
    let list: any[] = [];
    if (singleInput && input !== '') {
      const itIdx = Array.isArray(dataSource)
        ? dataSource.findIndex((it) => {
            const text = getTextField(it);
            return text.indexOf(input) != -1;
          })
        : -1;
      if (itIdx === -1) {
        list.push(
          <Option key={inputKey} value={String(input).trim()}>
            {input}
          </Option>,
        );
      }
    }
    if (Array.isArray(dataSource) && dataSource.length > 0) {
      if (!group) {
        if (request) {
          list = renderList(dataSource);
        } else {
          const newList =
            singleInput && input !== ''
              ? dataSource.filter((it) => {
                  const text = getTextField(it);
                  return text.indexOf(input) != -1;
                })
              : dataSource;
          list = list.concat(renderList(newList));
        }
      } else {
        const groupMap: any = {};
        dataSource.forEach((item: any) => {
          if (item[groupField]) {
            if (!groupMap[item[groupField]]) {
              groupMap[item[groupField]] = [];
            }
            groupMap[item[groupField]].push(item);
          }
        });
        list = Object.keys(groupMap).map((key, i) => {
          const childList = renderList(groupMap[key], `${i}`);
          return (
            <OptGroup key={`group-${i}`} label={key}>
              {childList}
            </OptGroup>
          );
        });
      }
    }

    return list;
  }, [JSON.stringify(dataSource), group, input, inputKey, singleInput, textField]);

  const onSearchInputChange = (value: string) => {
    if (value.trim() !== '') {
      if (remoteSearch && request) {
        //if (value.trim()) {
        debounce.cancel();
        debounce.run(value);
        // }
      }
    } else {
      if (request) {
        setDataSource(autoloadData.current || []);
      }
    }
    setInput(value);
    setInputKey(inputKey - 1);
    onSearch && onSearch(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchInputChange(value);
  };
  // if (remoteSearch) {
  //   if (request) {
  //     selectProps['onSearch'] = (value: any) => {
  //       if (value.trim()) {
  //         cancel();
  //         run(value);
  //       }
  //     };
  //   }
  // }

  useUpdateEffect(() => {
    if (
      dropdownOpen &&
      showSearch &&
      loading === false &&
      inputRef.current &&
      inputRef.current.focus
    ) {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        inputRef.current.focus({
          preventScroll: true,
        });
      }, 50);
    }
  }, [dropdownOpen, inputRef.current, loading]);

  const handleDropdownVisibleChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      if (!autoload && request && Array.isArray(dataSource) && dataSource.length === 0) {
        if (!remoteSearch) {
          loadData();
        }
      }
      if (openReloadData && remoteSearch) {
        loadData({});
      }
    }
    onDropdownVisibleChange?.(open);
  };

  const handleChange = (value: any, option: any) => {
    if (!singleInput) {
      setInput('');
    }
    onChange && onChange(value, option);
  };

  let defaultSelectProps: any = {
    dropdownRender: (menu: any) => {
      return (
        <Spin spinning={loading} tip="加载中...">
          {showSearch ? (
            <>
              <div style={{ padding: '4px 8px' }}>
                <Input
                  placeholder={searchInputPlaceholder || placeholder || '请输入'}
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

              <Divider style={{ margin: '4px 0' }} />
            </>
          ) : null}
          {menu}
        </Spin>
      );
    },
  };

  if (selectProps.dropdownRender) {
    defaultSelectProps = {
      showSearch: showSearch,
      onSearch: showSearch ? onSearchInputChange : null,
      searchValue: input,
    };
  }

  return (
    <Select
      //   用于解决后端返回value为null时，组件不展示输入提示文字问题
      value={selectProps.value === null ? undefined : selectProps.value}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      loading={loading}
      onChange={handleChange}
      defaultActiveFirstOption={defaultActiveFirstOption}
      placeholder={placeholder}
      allowClear={allowClear}
      ref={ref}
      {...defaultSelectProps}
      {...selectProps}
    >
      {children}
    </Select>
  );
};

export default ScSelect;
