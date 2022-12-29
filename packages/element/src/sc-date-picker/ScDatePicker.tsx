import * as React from 'react';
import { DatePicker } from 'antd';
import * as moment from 'moment';
import type { Moment } from 'moment';
import interopDefault from '../_util/interopDefault';
import { useUpdateEffect } from 'ahooks';

const { useState, useCallback, useMemo } = React;
import type { PickerProps, PickerDateProps } from 'antd/es/date-picker/generatePicker'

export type ScDatePickerProps<DateType> = PickerProps<DateType> & {
  vformat?: string
  /**
   * 小于单日能选
   */
  todayBefor?: boolean
  /**
   * 大于单日能选
   */
  todayAfter?: boolean

} & PickerDateProps<any>
const ScDatePicker: React.FC<any> = (props: ScDatePickerProps<Moment>) => {
  const { value, format = 'YYYY-MM-DD', todayAfter, todayBefor, vformat, showTime, disabledDate, onChange, ...restProps } = props;


  const newProps = useMemo(() => {
    return {
      ...restProps,
      showTime:
        typeof showTime === 'object' && showTime !== null
          ? showTime
          : typeof showTime === 'boolean' && showTime
            ? {
              hideDisabledOptions: true,
              defaultValue: interopDefault(moment)('00:00:00', 'HH:mm:ss'),
            }
            : false,
    };
  }, [restProps, showTime]);
  // function disabledDate(current: any) {
  //   return current && current > moment(new Date());
  // }


  //let disabledDate = null;

  // if (todayAfter) {
  //   disabledDate = (current: any) => {

  //     return current && current > moment(new Date());
  //   }
  // }

  let disData: ((date: moment.Moment) => boolean) | undefined = disabledDate;

  if (!disabledDate) {

    if (todayAfter || todayBefor) {

      disData = (current) => {

        if (todayBefor)
          return current && current > interopDefault(moment)(new Date());
        if (todayAfter)
          return current && current < interopDefault(moment)(new Date());
        return true
      }
    }

  }

  let val: any = '';
  if (value) {
    val = interopDefault(moment)(value).isValid() ? interopDefault(moment)(value) : null;
  }
  const [date, setDate] = useState<Moment>(val);
  const [, setDateString] = useState(interopDefault(moment)(''));

  const triggerChange = useCallback(
    (changedValue: any) => {
      const rValue: string = changedValue;
      let temV: Moment | null = null;
      if ((vformat || format) && rValue) {
        temV = interopDefault(moment)(rValue).format((vformat || format));
      }
      if (onChange) {
        onChange(temV, rValue);
      }
    },
    [format, vformat, onChange],
  );

  const handleChange = (_date: any, _dateString: string) => {
    setDate(_date);
    setDateString(_dateString);
    triggerChange(_date);
  };
  useUpdateEffect(() => {
    setDate(val);
  }, [value]);

  return <DatePicker {...newProps} format={format} value={date} disabledDate={disData} onChange={handleChange} />;
};

export default ScDatePicker;

