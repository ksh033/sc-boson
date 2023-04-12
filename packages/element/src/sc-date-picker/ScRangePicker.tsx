import * as React from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import { useDebounceFn, useUpdateEffect } from 'ahooks';
import interopDefault from '../_util/interopDefault';
import type { RangePickerProps } from 'antd/es/date-picker/generatePicker';
import type { BasicTarget, TargetValue } from '../_util/domTarget';
import { getTargetElement } from '../_util/domTarget';
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
  /** W:周,M:月，'d'：天，y:'年',h：小时，m:分钟，s:秒 */
  type: 'w' | 'M' | 'd' | 'y' | 'h' | 'm' | 's';
  value: number;
};
type ScDatePickerProps<T> = RangePickerProps<T> & {
  rangesList?: RangesItem[];
  vformat?: string;
};

export type Target = BasicTarget<HTMLElement | Element | Window | Document>;

type RangeValue = [moment.Moment | null, moment.Moment | null] | null;

const ScRangePicker: React.FC = (props: ScDatePickerProps<any>) => {
  const {
    format = 'YYYY-MM-DD',
    vformat,
    rangesList,
    ranges,
    value,
    onChange,
    ...resProps
  } = props;

  // let emptyItem={text:rangesTitle||'当天',value:"",type:'e'}
  console.log('value', value);
  const [vranges, setVRanges] = useState<any>();
  let vals: any[] = [];
  if (value && value.length) {
    const sdate = interopDefault(moment)(value[0]).isValid()
      ? interopDefault(moment)(value[0].utcOffset(480))
      : null;
    const edate = interopDefault(moment)(value[1]).isValid()
      ? interopDefault(moment)(value[1].utcOffset(480))
      : null;
    vals = [sdate, edate];
  }
  const [values, setValues] = useState<any>(vals);
  const [showFormat, setShwFormat] = useState<any>(format || vformat);

  const [, setDateStrings] = useState<[string, string]>(['', '']);
  const [openDates, setOpenDates] = useState<RangeValue>(null);
  const openDateRef = React.useRef<RangeValue>(null);
  const todayRef = React.useRef<moment.Moment>(interopDefault(moment)({ format }));
  const inputfornat = ((vformat as string) || (format as string)).replaceAll('-', '');

  // 包装的ref 是为了获取该div低下的input 框
  const ref = React.useRef<HTMLDivElement | null>(null);
  // 选择弹窗提示
  const open = React.useRef<boolean>(false);

  const toRangs = () => {
    const today = interopDefault(moment)({ format });

    const tRanges = {};

    rangesList?.forEach((item) => {
      const afterDay = interopDefault(moment)({ format }).add(item.value, item.type);
      tRanges[item.text] = [today, afterDay];
    });

    return tRanges;
  };

  useUpdateEffect(() => {
    setValues(vals);
  }, [value]);

  useEffect(() => {
    if (ranges) {
      setVRanges(ranges);
    }
  }, [ranges]);

  useEffect(() => {
    if (!ranges && rangesList) {
      const temV = toRangs();
      setVRanges(temV);
    }
  }, [rangesList]);

  const triggerChange = useCallback(
    (changedValue: any, dates: [moment.Moment, moment.Moment]): void => {
      console.log('dates', dates);
      // Should provide an event to pass value to Form.
      let rChangedValue = changedValue;
      const temformat = vformat || format;
      //if (vformat && rChangedValue) {
      if (dates) {
        rChangedValue = [
          dates[0] ? dates[0].format(temformat as string) : '',
          dates[1] ? dates[1].format(temformat as string) : '',
        ];
      }

      // }
      if (onChange) {
        onChange(dates, [rChangedValue[0], rChangedValue[1]]);
      }
    },
    [format, onChange, vformat],
  );

  const handleChange = useCallback(
    (dates: any, _dateStrings: [string, string]): void => {
      setValues(dates);
      setDateStrings(_dateStrings);
      triggerChange(_dateStrings, dates);
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
  /** 获取input 属性 */
  function getInput(root: any, list: Element[]) {
    if (root.children.length > 0) {
      for (let x = 0; x < root.children.length; x++) {
        if (root.children[x].nodeName === 'INPUT') {
          list.push(root.children[x]);
          if (list.length === 2) {
            return;
          }
        }
        if (root.children[x].children.length > 0) {
          getInput(root.children[x], list);
        }
      }
    }
  }
  const eventName = 'input';

  const registeredEvent = (target: Element, startListener: EventListenerOrEventListenerObject) => {
    // @ts-ignore
    const targetElement = getTargetElement(target, window);
    if (!targetElement?.addEventListener) {
      return;
    }
    targetElement.addEventListener(eventName, startListener);

    return targetElement;
  };
  /** 获取输入数字获取日期 */
  const getInputDate = (str: string | null) => {
    if (typeof str !== 'string') return null;
    // 判断是否是数字
    if (parseFloat(str).toString() == 'NaN') return null;
    let newStr: string | null = null;
    const strLength = str.length;
    const currentYear = todayRef.current.year();
    let currentMonth: string = (todayRef.current.month() + 1).toString();
    currentMonth = Number(currentMonth) > 10 ? currentMonth : '0' + currentMonth;
    console.log('currentYear', currentYear);
    console.log('currentMonth', currentMonth);
    if (strLength === 2) {
      const date = moment(currentYear + currentMonth + str, inputfornat);
      if (date.isValid()) {
        newStr = currentYear + currentMonth + str;
      }
    }
    if (strLength === 4) {
      const date = moment(currentYear + str, inputfornat);
      if (date.isValid()) {
        newStr = currentYear + str;
      }
    }
    if (newStr) {
      // 判断是否为不可选日期
      if (resProps.disabledDate && resProps.disabledDate(moment(newStr))) {
        newStr = null;
      } else {
        newStr = newStr + ' 12:00:00';
      }
    }

    return newStr;
  };

  const startListener = useDebounceFn(
    (event: Event) => {
      if (open.current) {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const startDate: string | null = getInputDate(target.value);
        if (startDate) {
          const dates: RangeValue =
            openDateRef.current != null
              ? [moment(startDate, format as string), openDateRef.current[1]]
              : [moment(startDate, format as string), null];
          openDateRef.current = dates;
          setOpenDates(dates);
        }
      }
    },
    { wait: 300 },
  );

  const endListener = useDebounceFn(
    (event: Event) => {
      if (open.current) {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const endDate: string | null = getInputDate(target.value);
        if (endDate) {
          const dates: RangeValue =
            openDateRef.current != null
              ? [openDateRef.current[0], moment(endDate, format as string)]
              : [null, moment(endDate, format as string)];
          openDateRef.current = dates;
          setOpenDates(dates);
        }
      }
    },
    { wait: 300 },
  );

  /** 监听日期输入 */
  useEffect(() => {
    let startInput: TargetValue<Element> = null;
    let endInput: TargetValue<Element> = null;

    if (ref.current) {
      const inputList: Element[] = [];
      getInput(ref.current, inputList);
      if (inputList.length === 2) {
        startInput = registeredEvent(inputList[0], startListener.run);
        endInput = registeredEvent(inputList[1], endListener.run);
      }
    }
    return () => {
      if (startInput) {
        startInput.removeEventListener(eventName, startListener.run);
      }
      if (endInput) {
        endInput.removeEventListener(eventName, endListener.run);
      }
    };
  }, [ref.current]);

  return (
    <div ref={ref}>
      <RangePicker
        {...resProps}
        onChange={handleChange}
        value={openDates || values}
        onOpenChange={(v) => {
          const temformat = (vformat as string) || (format as string);
          open.current = v;
          if (v) {
            setShwFormat(temformat.replaceAll('-', ''));
            setOpenDates([null, null]);
            openDateRef.current = null;
          } else {
            setShwFormat(temformat);
            if (
              openDateRef.current &&
              openDateRef.current[0] != null &&
              openDateRef.current[1] != null
            ) {
              const startDate = openDateRef.current[0].utc().utcOffset(480);
              const endDate = openDateRef.current[1].utc().utcOffset(480);
              const dataStr: [string, string] = [
                startDate.format(format as string),
                endDate.format(format as string),
              ];
              console.log('dataStr', dataStr);
              onChange?.([startDate, endDate], dataStr);
            }
            openDateRef.current = null;
            setOpenDates(null);
          }
          resProps.onOpenChange?.(v);
        }}
        inputReadOnly={false}
        format={showFormat}
        ranges={vranges}
        //  className={rangesList ? 'sc-date-picker-range-after' : ''}
      />
    </div>
  );
};

export default ScRangePicker;
