/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useRef } from 'react';
import { Checkbox } from 'antd';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import type { DataComponentProps } from '../Component';
import useFetchData from '../_util/useFetchData';
import { useUpdateEffect } from 'ahooks';

const { useEffect, useMemo, useCallback, useState } = React;

export interface ScCheckProps extends CheckboxGroupProps, DataComponentProps {}

const ScCheck: React.FC<ScCheckProps> = (props) => {
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
    let rdata = await useFetchData(request, params);
    if (isGone.current) return;
    if (onLoad) {
      rdata = onLoad(rdata);
    }
    setDataSource(rdata);
  }, [params]);

  useEffect(() => {
    if (request && autoload) {
      loadData();
    }
  }, [JSON.stringify(params)]);

  const children: any[] = useMemo(() => {
    const list: any[] = [];
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
