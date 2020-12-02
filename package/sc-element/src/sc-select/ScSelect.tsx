import * as React from 'react';
import { SelectProps } from 'antd/lib/select';
import { Select, Tooltip } from 'antd';
import { useUpdateEffect, useDebounceFn } from '@umijs/hooks';

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
  onLoad?: (data: any) => void;
  searchField?: string;
  customRef?: React.MutableRefObject<any>;
  singleInput?: boolean;
  openReloadData?: boolean;
}

const ScSelect: React.FC<ScSelectProps> = props => {
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
  }, [data]);

  const loadData = async (searchParam?: any) => {
    if (!request) {
      throw 'no remote request method';
    }
    setLoading(true);
    try {
      let _data = await request({ ...params, ...searchParam });

      if (isGone.current) return;
      if (_data) {
        if (onLoad) {
          _data = onLoad(_data);
        }
        setDataSource(_data || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const debounce = useDebounceFn(value => {
    const searchParam: any = {};
    searchParam[searchField] = value;
    loadData(searchParam);
  }, 500);

  useUpdateEffect(() => {
    if (autoload) {
      loadData();
    }
  }, [params]);

  useLayoutEffect(() => {
    setCustomRef();
    if (autoload) {
      loadData();
    }
    return () => {
      isGone.current = true;
    };
  }, []);

  const renderList = (dataSource: any[]) => {
    const list: any[] = [];
    dataSource.forEach((item: any, index: number) => {
      if (valueField && textField) {
        let text =
          typeof textField === 'string' ? item[textField] : textField(item);
        if (tip) {
          text = <Tooltip title={text}>{text}</Tooltip>;
        }
        list.push(
          <Option key={index.toString()} value={item[valueField]}>
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
      list.push(
        <Option key={inputKey} value={inputKey}>
          {input}
        </Option>,
      );
    }
    if (Array.isArray(dataSource) && dataSource.length > 0) {
      if (!group) {
        list = renderList(dataSource);
      } else {
        let groupMap: any = {};
        dataSource.forEach((item: any, index) => {
          if (item['group']) {
            if (!groupMap[item['group']]) {
              groupMap[item['group']] = [];
            }
            groupMap[item['group']].push(item);
          }
        });
        list = Object.keys(groupMap).map(key => {
          const childList = renderList(groupMap[key]);
          return <OptGroup label={key}>{childList}</OptGroup>;
        });
      }
    }
    return list;
  }, [dataSource, input]);

  const handleSearch = (value: any) => {
    if (remoteSearch && request) {
      if (value.trim()) {
        debounce.cancel();
        debounce.run(value);
      }
    }
    if (singleInput) {
      setInput(value);
      setInputKey(inputKey - 1);
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

  const onDropdownVisibleChange = (open: boolean) => {
    if (open) {
      if (
        !autoload &&
        request &&
        Array.isArray(dataSource) &&
        dataSource.length === 0
      ) {
        if (!remoteSearch) {
          loadData();
        }
      }
      if (openReloadData && remoteSearch) {
        loadData({});
      }
    }
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
      onDropdownVisibleChange={onDropdownVisibleChange}
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
