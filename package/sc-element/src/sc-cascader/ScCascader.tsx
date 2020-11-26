import React, { useRef } from 'react';
import { CascaderProps } from 'antd/lib/cascader';
import { Cascader } from 'antd';
import { useUpdateEffect } from '@umijs/hooks';

const { useCallback, useState, useLayoutEffect } = React;

export interface ScCascaderProps extends CascaderProps {
  pIdField?: string;
  asyn?: boolean;
  textField?: string;
  valueField?: string;
  data?: any[];
  loading?: boolean;
  request?: (params: any) => Promise<any>;
  onLoad?: (data: any) => any;
  autoload?: boolean;
  params?: any;
}

const ScCascader: React.FC<ScCascaderProps> = props => {
  const {
    data = [],
    textField = 'label',
    valueField = 'value',
    pIdField = 'pid',
    loading = false,
    request,
    autoload = false,
    asyn = false,
    params,
    onLoad,
    onChange,
    options,
    value,
    ...restProps
  } = props;
  const isGone = useRef(false);
  const ref = useRef<any>();
  const [_value, setValue] = useState(value);

  const formatValue = (pValue: any) => {
    let newValue: any[] = pValue || [];
    // if (!asyn) {
    if (Array.isArray(pValue)) {
      newValue = pValue.map((item: any, i) => {
        if (typeof item === 'string') {
          return item;
        } else {
          return item[`${valueField}`];
        }
      });
    }
    // }

    return newValue;
  };

  const convertData = (_data: any) => {
    if (Array.isArray(_data) && _data.length > 0) {
      return _data.map((item: any) => {
        let newItem: any = {};
        newItem.value = item[`${valueField}`];
        newItem.label = item[`${textField}`];
        if (Array.isArray(item.children) && item.children.length > 0) {
          newItem.children = convertData(item.children);
        }
        newItem.dataRef = { ...item };
        newItem = { ...item, ...newItem };
        return newItem;
      });
    } else {
      return [];
    }
  };

  const temData = data || [];
  const [treeData, setTreeData] = useState<any>(convertData(temData));

  const loadData = useCallback(async () => {
    if (!request) {
      throw 'no remote request method';
    }
    let _data = await request(params);
    if (isGone.current) return;
    if (onLoad) {
      _data = onLoad(_data);
    }
    setTreeData(convertData(_data));
  }, [params]);

  const handleChange = (newValue: any[], _options: any[]) => {
    if (onChange) {
      onChange(newValue, _options);
    } else {
      setValue(newValue);
    }
  };

  const loadTreeData = (selectedOptions: any) => {
    if (Array.isArray(selectedOptions) && selectedOptions.length > 0) {
      const targetOption = selectedOptions[selectedOptions.length - 1];
      targetOption.loading = true;
      const payload = { ...params };
      payload[`${pIdField}`] = targetOption['value'];
      if (!request) {
        throw 'no remote request method';
      }
      request(payload)
        .then((_data: any) => {
          if (isGone.current) return;
          if (onLoad) {
            _data = onLoad(_data);
          }
          const newData = convertData(_data);
          targetOption.loading = false;
          if (targetOption && targetOption !== null) {
            if (newData && Array.isArray(newData) && newData.length > 0) {
              const children = newData;
              if (Array.isArray(children) && children.length > 0) {
                targetOption['children'] = newData;
              }
              setTreeData([...treeData]);
            } else {
              targetOption.isLeaf = true;
              if (ref.current) {
                // ref.current.setValue &&
                //   ref.current.setValue(
                //     selectedOptions.map((item: any) => {
                //       return item[`${valueField}`];
                //     }),
                //   );
                ref.current.handlePopupVisibleChange(false);
              }
              setValue(
                selectedOptions.map((item: any) => {
                  return item[`${valueField}`];
                }),
              );
              const newvalue: any[] = formatValue(selectedOptions);
              handleChange(newvalue, selectedOptions);
            }
          } else {
            setTreeData(_data);
          }
        })
        .finally(() => {
          targetOption.loading = false;
        });
    }
  };

  const displayRender = (labels: any[], selectedOptions: any[]) => {
    if (labels.length > 0) {
      return labels.map((item: any, i) => {
        if (typeof item === 'string') {
          if (i === labels.length - 1) {
            return <span key={i}>{item}</span>;
          }
          return <span key={i}>{item} / </span>;
        } else {
          if (i === labels.length - 1) {
            return <span key={i}>{item[`${textField}`]}</span>;
          }
          return <span key={i}>{item[`${textField}`]} / </span>;
        }
      });
    } else {
      if (Array.isArray(_value)) {
        const { length } = _value;
        return _value.map((item: any, i) => {
          if (typeof item === 'string') {
            if (i === length - 1) {
              return <span key={i}>{item}</span>;
            }
            return <span key={i}>{item} / </span>;
          } else {
            if (i === length - 1) {
              return <span key={i}>{item[`${textField}`]}</span>;
            }
            return <span key={i}>{item[`${textField}`]} / </span>;
          }
        });
      } else {
        return null;
      }
    }
  };

  useLayoutEffect(() => {
    if (request && autoload) {
      loadData();
    }
    return () => {
      isGone.current = true;
    };
  }, []);

  useUpdateEffect(() => {
    if (request && autoload) {
      loadData();
    }
  }, [params]);

  useUpdateEffect(() => {
    setValue(value);
  }, [value]);

  const otherProps: any = {};
  if (asyn) {
    otherProps['loadData'] = loadTreeData;
    otherProps['displayRender'] = displayRender;
  }
  return (
    <Cascader
      ref={ref}
      options={treeData}
      {...restProps}
      {...otherProps}
      value={_value}
      onChange={handleChange}
    />
  );
};

export default ScCascader;
