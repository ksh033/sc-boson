import * as React from 'react';
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
    data = [],
    autoload = false,
    request,
    onLoad,
    ...resPros
  } = props;

  const { params = null } = resPros;
  const [dataSource, setDataSource] = useState(data);

  // useUpdateEffect(() => {
  //   if (!autoload) {
  //     setDataSource(data)
  //   }
  // }, [data])

  const loadData = useCallback(async () => {
    if (!request) {
      throw 'no remote request method';
    }
    let _data = await useFetchData(request, params);
    setDataSource(_data);
  }, [request, params]);

  if (params !== null) {
    useEffect(() => {
      if (request && autoload) {
        loadData();
      }
    }, [params]);
  }

  useUpdateEffect(() => {
    if (onLoad) {
      onLoad(dataSource);
    }
  }, [dataSource]);

  useLayoutEffect(() => {
    if (autoload) {
      loadData();
    }
  }, []);

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
