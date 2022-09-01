import React from 'react';
import { useRequest, useUpdateEffect } from 'ahooks';
import { Radio } from 'antd';
import type { RadioGroupProps } from 'antd/es/radio';
import type { DataComponentProps } from '../Component';

const { useLayoutEffect, useState } = React;

export type ScRadioProps = RadioGroupProps & DataComponentProps;

const ScRadio: React.FC<ScRadioProps> = (props) => {
  const {
    data = [],
    params = null,
    modelKey = '',
    className = '',
    textField = 'label',
    valueField = 'value',
    request,
    autoload,
    onLoad,
    ...restProps
  } = props;
  const [dataSource, setDataSource] = useState(data);

  const redioProps = {
    params,
    modelKey,
    className,
    autoload,
    ...restProps,
  };
  const { run } = useRequest(
    request ||
      new Promise((resolve) => {
        resolve(null);
      }),
    {
      manual: true,
    },
  );

  const loadData = () => {
    run(params).then((res: any) => {
      let newList = res;
      if (onLoad) {
        newList = onLoad(newList);
      }
      setDataSource(newList);
    });
  };

  useLayoutEffect(() => {
    if (autoload) {
      loadData();
    }
  }, []);

  useUpdateEffect(() => {
    if (!autoload) {
      setDataSource(data);
    }
  }, [data]);

  const formValue = (val: any[]) => {
    if (Array.isArray(val) && val.length > 0) {
      return val.map((it) => {
        const label = typeof textField === 'string' ? it[textField] : textField(it);
        return {
          ...it,
          value: it[valueField],
          label: label,
        };
      });
    }
    return [];
  };

  return (
    <Radio.Group {...redioProps}>
      {formValue(dataSource).map((it) => {
        return (
          <Radio value={it.value} key={it.value} disabled={it.disabled}>
            {it.label}
          </Radio>
        );
      })}
    </Radio.Group>
  );
};
export default ScRadio;
