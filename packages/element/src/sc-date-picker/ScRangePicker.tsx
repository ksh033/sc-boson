import * as React from 'react';
import * as moment from 'moment';
import { DatePicker, Select } from 'antd';
import { useUpdateEffect } from 'ahooks';

import interopDefault from '../_util/interopDefault';

const { useState, useCallback } = React;

const { RangePicker } = DatePicker;
const { Option } = Select;

const ScRangePicker: React.FC<any> = (props) => {
  const { format = 'YYYY-MM-DD', vformat = 'YYYY-MM-DD', rangesList, value, onChange } = props;
  const { rangesListProps = {}, ...resProps } = props;
  // let emptyItem={text:rangesTitle||'当天',value:"",type:'e'}
  let vals: any[] = [];
  if (value) {
    const sdate = interopDefault(moment)(value[0]).isValid()
      ? interopDefault(moment)(value[0])
      : null;
    const edate = interopDefault(moment)(value[1]).isValid()
      ? interopDefault(moment)(value[1])
      : null;
    vals = [sdate, edate];
  }
  const [values, setValues] = useState<any[]>(vals);
  const [, setDateStrings] = useState<[string, string]>(['', '']);

  useUpdateEffect(() => {
    setValues(vals);
  }, [value]);

  const triggerChange = useCallback(
    (changedValue: any): void => {
      // Should provide an event to pass value to Form.
      let rChangedValue = changedValue;
      if (vformat && rChangedValue) {
        rChangedValue = [
          rChangedValue[0] ? interopDefault(moment)(rChangedValue[0]).format(vformat) : '',
          rChangedValue[1] ? interopDefault(moment)(rChangedValue[1]).format(vformat) : '',
        ];
      }
      if (onChange) {
        onChange(rChangedValue);
      }
    },
    [onChange, vformat],
  );

  const handleChange = useCallback(
    (dates: any, _dateStrings: [string, string]): void => {
      setValues(dates);
      setDateStrings(_dateStrings);
      triggerChange(_dateStrings);
    },
    [triggerChange],
  );

  const onSelect = useCallback(
    (selectIndex: any): void => {
      // eslint-disable-next-line radix
      const selectedItem = rangesList[parseInt(selectIndex)];
      const { type } = selectedItem;
      let rvals = [];
      let strs: [string, string] = ['', ''];
      if (selectedItem.value) {
        const today = interopDefault(moment)({ format });
        const afterDay = interopDefault(moment)({ format }).add(selectedItem.value, type);
        rvals = [today, afterDay];
        strs = [today.format(format), afterDay.format(format)];
        setValues(rvals);
        setDateStrings(strs);
      } else {
        const today = interopDefault(moment)({ format });
        strs = [today.format(format), today.format(format)];
        rvals = [today, today];
      }
      setValues(rvals);
      setDateStrings(strs);
      handleChange(rvals, strs);
    },
    [rangesList, handleChange, format],
  );

  const renderRight = (rangesAfter: any[]) => {
    const cRangesAfter = rangesAfter || [];
    let i = -1;
    const operations = cRangesAfter.map((range: any) => {
      const { text, type } = range;
      const temValue = `${type}_${range.value}`;
      i += 1;
      return (
        <Option key={temValue} value={i}>
          {text}
        </Option>
      );
    });
    return (
      <Select defaultValue={0} onSelect={onSelect} {...rangesListProps}>
        {operations}
      </Select>
    );
  };

  let operations: any = null;
  if (rangesList && rangesList.length > 0) {
    operations = renderRight(rangesList);
  }
  return (
    <span className={'sc-date-picker'}>
      <span>
        <RangePicker
          {...resProps}
          onChange={handleChange}
          value={values}
          className={rangesList ? 'sc-date-picker-range-after' : ''}
        ></RangePicker>
      </span>
      <span>{operations}</span>
    </span>
  );
};

export default ScRangePicker;
