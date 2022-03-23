/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as React from 'react';
import type { SelectProps } from 'antd/es/select';
import { Select, Tooltip } from 'antd';
import { useUpdateEffect, useDebounceFn } from 'ahooks';

const { useMemo, useLayoutEffect, useState, useRef } = React;
const { Option, OptGroup } = Select;
export interface ScSelectProps extends SelectProps<any> {
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
}

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
    onDropdownVisibleChange,
    preHandle,
    ...restProps
  } = props;
  const isGone = useRef(false);
  const [dataSource, setDataSource] = useState(data || []);
  const [input, setInput] = useState('');
  const [inputKey, setInputKey] = useState(-1);
  const selectProps: any = { params, ...restProps };
  const [loading, setLoading] = useState(false);
  const ref = useRef<any>();
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
      searchParam[searchField] = value;
      loadData(searchParam);
    },
    { wait: 500 },
  );

  const setInputValue = useDebounceFn(
    (value) => {
      setInput(value);
      setInputKey(inputKey - 1);
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

  const renderList = (cData: any[], level: string = '1') => {
    const list: any[] = [];
    cData.forEach((item: any, index: number) => {
      if (valueField && textField) {
        let text = typeof textField === 'string' ? item[textField] : textField(item);
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
            const text = typeof textField === 'string' ? it[textField] : textField(it);
            return text.indexOf(input) != -1;
          })
        : -1;
      if (itIdx === -1) {
        list.push(
          <Option key={inputKey} value={inputKey}>
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
                  const text = typeof textField === 'string' ? it[textField] : textField(it);
                  return text.indexOf(input) != -1;
                })
              : dataSource;
          list = list.concat(renderList(newList));
        }
      } else {
        const groupMap: any = {};
        dataSource.forEach((item: any) => {
          if (item.group) {
            if (!groupMap[item.group]) {
              groupMap[item.group] = [];
            }
            groupMap[item.group].push(item);
          }
        });
        list = Object.keys(groupMap).map((key, i) => {
          const childList = renderList(groupMap[key], `${i}`);
          return (
            <OptGroup key={i} label={key}>
              {childList}
            </OptGroup>
          );
        });
      }
    }
    return list;
  }, [JSON.stringify(dataSource), group, input, inputKey, singleInput, textField]);

  const handleSearch = (value: any) => {
    if (remoteSearch && request) {
      //if (value.trim()) {
      debounce.cancel();
      debounce.run(value);
      // }
    }
    if (singleInput) {
      setInputValue.cancel();
      setInputValue.run(value);
    }
    onSearch && onSearch(value);
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

  const handleDropdownVisibleChange = (open: boolean) => {
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
    onChange && onChange(value, option);
  };
  return (
    <Select
      {...selectProps}
      //   用于解决后端返回value为null时，组件不展示输入提示文字问题
      value={selectProps.value === null ? undefined : selectProps.value}
      showSearch={showSearch}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      loading={loading}
      onSearch={handleSearch}
      onChange={handleChange}
      ref={ref}
    >
      {children}
    </Select>
  );
};

export default ScSelect;
