import React, { useRef } from 'react';
import { Checkbox } from 'antd';
import { CheckboxGroupProps } from 'antd/lib/checkbox';
import { DataComponentProps } from '../Component';
import useFetchData from '../_util/useFetchData';
import { useUpdateEffect } from '@umijs/hooks';
const { useEffect, useMemo, useCallback, useLayoutEffect, useState } = React;

export interface ScCheckProps extends CheckboxGroupProps, DataComponentProps {}

const ScCheck: React.FC<ScCheckProps> = props => {
  const {
    textField = 'label',
    valueField = 'value',
    data,
    autoload = false,
    request,
    onLoad,
    ...resPros
  } = props;
  const isGone = useRef(false);
  const { params = null } = resPros;
  const [dataSource, setDataSource] = useState(data);

  useEffect(() => {
    return () => {
      isGone.current = true;
    };
  }, []);

  useUpdateEffect(() => {
    if (!autoload && data) {
      setDataSource(data);
    }
  }, [data]);

  const loadData = useCallback(async () => {
    if (!request) {
      throw 'no remote request method';
    }
    let _data = await useFetchData(request, params);
    if (isGone.current) return;
    if (onLoad) {
      _data = onLoad(_data);
    }
    setDataSource(_data);
  }, [params]);

  useEffect(() => {
    if (request && autoload) {
      loadData();
    }
  }, [params]);

  let children: any[] = useMemo(() => {
    let list: any[] = [];
    if (dataSource && dataSource.length > 0) {
      dataSource.forEach((item: any) => {
        if (valueField && textField) {
          if (typeof textField === 'string') {
            list.push({ value: item[valueField], label: item[textField] });
          } else {
            list.push({ value: item[valueField], label: textField(item) });
          }
        }
      });
    }
    return list;
  }, [dataSource]);

  return <Checkbox.Group options={children} {...resPros} />;
};
export default ScCheck;
