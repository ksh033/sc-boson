import * as React from 'react';
import { DatePicker } from 'antd';
import * as moment from 'moment';
import interopDefault from '../_util/interopDefault';
import { useUpdateEffect } from 'ahooks';

const { useState, useCallback } = React;

const ScDatePicker: React.FC<any> = (props) => {
  const { value, format = 'YYYY-MM-DD', onChange } = props;

  let val: string = '';
  if (value) {
    val = interopDefault(moment)(value).isValid() ? interopDefault(moment)(value) : null;
  }
  const [date, setDate] = useState(val);
  const [, setDateString] = useState(interopDefault(moment)(''));

  const triggerChange = useCallback(
    (changedValue: any) => {
      let rValue = changedValue;
      if (format && rValue) {
        rValue = interopDefault(moment)(rValue).format(format);
      }
      if (onChange) {
        onChange(rValue);
      }
    },
    [format, onChange],
  );

  const handleChange = (_date: any, _dateString: string) => {
    setDate(_date);
    setDateString(_dateString);
    triggerChange(_date);
  };
  useUpdateEffect(() => {
    setDate(val);
  }, [value]);

  return <DatePicker {...props} value={date} onChange={handleChange}></DatePicker>;
};

export default ScDatePicker;
