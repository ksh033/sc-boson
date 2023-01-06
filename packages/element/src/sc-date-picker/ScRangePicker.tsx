import * as React from 'react';
import * as moment from 'moment';
import { DatePicker } from 'antd';
import { useUpdateEffect } from 'ahooks';

import interopDefault from '../_util/interopDefault';
import type { RangePickerProps } from 'antd/es/date-picker/generatePicker'
const { useState, useCallback, useEffect } = React;

const { RangePicker } = DatePicker;

// years	y

// months	M
// weeks	w
// days	d
// hours	h
// minutes	m
// seconds	s
// milliseconds	ms

type RangesItem = {
  text: string;
  /**
   * w:周,M:月，'d'：天，y:'年',h：小时，m:分钟，s:秒
   */
  type: 'w' | 'M' | 'd' | 'y' | 'h' | 'm' | 's',
  value: number


}
type ScDatePickerProps<T> = RangePickerProps<T> & {
  rangesList?: RangesItem[];
  vformat?: string
}
const ScRangePicker: React.FC = (props: ScDatePickerProps<any>) => {
  const { format = 'YYYY-MM-DD', vformat, rangesList, ranges, value, onChange, ...resProps } = props;

  // let emptyItem={text:rangesTitle||'当天',value:"",type:'e'}

  const [vranges, setVRanges] = useState<any>()
  let vals: any[] = [];
  if (value && value.length) {
    const sdate = interopDefault(moment)(value[0]).isValid()
      ? interopDefault(moment)(value[0])
      : null;
    const edate = interopDefault(moment)(value[1]).isValid()
      ? interopDefault(moment)(value[1])
      : null;
    vals = [sdate, edate];
  }
  const [values, setValues] = useState<any>(vals);
  const [, setDateStrings] = useState<[string, string]>(['', '']);
  const toRangs = () => {
    const today = interopDefault(moment)({ format });

    const tRanges = {};

    rangesList?.forEach((item) => {

      const afterDay = interopDefault(moment)({ format }).add(item.value, item.type);
      tRanges[item.text] = [today, afterDay]

    })

    return tRanges

  }
  useUpdateEffect(() => {
    setValues(vals);

  }, [value]);

  useEffect(() => {

    if (ranges) {

      setVRanges(ranges)
    }

  }, [ranges])

  useEffect(() => {

    if (!ranges && rangesList) {
      const temV = toRangs()
      setVRanges(temV)
    }

  }, [rangesList])
  const triggerChange = useCallback(
    (changedValue: any): void => {
      // Should provide an event to pass value to Form.
      let rChangedValue = changedValue;
      const temformat = vformat || format
      if (vformat && rChangedValue) {
        rChangedValue = [
          rChangedValue[0] ? interopDefault(moment)(rChangedValue[0]).format(temformat) : '',
          rChangedValue[1] ? interopDefault(moment)(rChangedValue[1]).format(temformat) : '',
        ];
      }
      if (onChange) {
        onChange(rChangedValue, [rChangedValue[0], rChangedValue[1]]);
      }
    },
    [format, onChange, vformat],
  );

  const handleChange = useCallback(
    (dates: any, _dateStrings: [string, string]): void => {
      setValues(dates);
      setDateStrings(_dateStrings);
      triggerChange(_dateStrings);
    },
    [triggerChange],
  );


  // const onSelect = useCallback(
  //   (selectIndex: any): void => {
  //     // eslint-disable-next-line radix
  //     const selectedItem = rangesList[parseInt(selectIndex)];
  //     const { type } = selectedItem;
  //     let rvals = [];
  //     let strs: [string, string] = ['', ''];
  //     if (selectedItem.value) {
  //       const today = interopDefault(moment)({ format });
  //       const afterDay = interopDefault(moment)({ format }).add(selectedItem.value, type);
  //       rvals = [today, afterDay];
  //       strs = [today.format(format), afterDay.format(format)];
  //       setValues(rvals);
  //       setDateStrings(strs);
  //     } else {
  //       const today = interopDefault(moment)({ format });
  //       strs = [today.format(format), today.format(format)];
  //       rvals = [today, today];
  //     }
  //     setValues(rvals);
  //     setDateStrings(strs);
  //     handleChange(rvals, strs);
  //   },
  //   [rangesList, handleChange, format],
  // );

  // const renderRight = (rangesAfter: any[]) => {
  //   const cRangesAfter = rangesAfter || [];
  //   let i = -1;
  //   const operations = cRangesAfter.map((range: any) => {
  //     const { text, type } = range;
  //     const temValue = `${type}_${range.value}`;
  //     i += 1;
  //     return (
  //       <Option key={temValue} value={i}>
  //         {text}
  //       </Option>
  //     );
  //   });
  //   return (
  //     <Select defaultValue={0} onSelect={onSelect} {...rangesListProps}>
  //       {operations}
  //     </Select>
  //   );
  // };

  //let operations: any = null;
  // if (rangesList && rangesList.length > 0) {
  //   operations = renderRight(rangesList);
  // }
  return (
    <RangePicker
      {...resProps}
      onChange={handleChange}
      value={values}

      ranges={vranges}
    //  className={rangesList ? 'sc-date-picker-range-after' : ''}
    />
  );
};

export default ScRangePicker;
