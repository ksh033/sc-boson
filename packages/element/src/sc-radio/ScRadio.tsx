import React, { useRef } from 'react';
import { useUpdateEffect } from 'ahooks';
import { Radio } from 'antd';
import type { RadioGroupProps } from 'antd/es/radio';
import type { DataComponentProps } from '../Component';
import useFetchData from '../_util/useFetchData';

const RadioButton = Radio.Button;
const { useEffect, useMemo, useCallback, useLayoutEffect, useState } = React;

const RADIO_TYPE: any = {
  radio: Radio,
  button: RadioButton,
};
export interface ScRadioProps extends RadioGroupProps, DataComponentProps {
  radioType?: "button" | 'radio';
}

const ScRadio: React.FC<ScRadioProps> = props => {
  const {
    data = [],
    params = null,
    modelKey = '',
    className = '',
    textField = 'label',
    valueField = 'value',
    radioType = 'radio',
    request,
    autoload,
    onLoad,
    ...restProps
  } = props;
  const isGone = useRef(false);
  const [dataSource, setDataSource] = useState(data);

  const redioProps = {
    params,
    modelKey,
    className,
    autoload,
    ...restProps,
  };

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
  }, [request, params]);

  useLayoutEffect(() => {
    if (autoload) {
      loadData();
    }
    return () => {
      isGone.current = true;
    };
  }, []);

  useUpdateEffect(() => {
    if (!autoload) {
      setDataSource(data);
    }
  }, [data]);

  if (params !== null) {
    useEffect(() => {
      if (autoload) {
        loadData();
      }
    }, [params]);
  }

  const Cmp = RADIO_TYPE[radioType];
  const children: any[] = useMemo(() => {
    const list: any[] = [];
    if (dataSource && dataSource.length > 0) {
      dataSource.forEach((item: any, index: number) => {
        if (valueField && textField) {
          if (typeof textField === 'string') {
            list.push(
              <Cmp key={index} value={item[valueField]}>
                {item[textField]}
              </Cmp>,
            );
          } else {
            list.push(
              <Cmp key={index} value={item[valueField]}>
                {textField(item)}
              </Cmp>,
            );
          }
        }
      });
    }
    return list;
  }, [dataSource]);

  return <Radio.Group {...redioProps}>{children}</Radio.Group>;
};
export default ScRadio;
