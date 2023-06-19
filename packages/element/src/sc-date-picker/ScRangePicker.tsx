import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from 'antd';
import { useDebounceFn, useUpdateEffect } from 'ahooks';
import interopDefault from '../_util/interopDefault';
import type { RangePickerDateProps } from 'antd/es/date-picker/generatePicker';
import type { RangeInfo } from 'rc-picker/lib/RangePicker';
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
export type ScDatePickerProps<T> = RangePickerDateProps<T> & {
  rangesList?: RangesItem[];
  vformat?: string;
};

export type Target = BasicTarget<HTMLElement | Element | Window | Document>;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

function utcMethod(date: Dayjs) {
  return dayjs(date);
}

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
  const [vranges, setVRanges] = useState<any>();
  let vals: any[] = [];
  if (value && value.length) {
    const sdate = interopDefault(dayjs)(value[0]).isValid()
      ? utcMethod(interopDefault(dayjs)(value[0]))
      : null;
    const edate = interopDefault(dayjs)(value[1]).isValid()
      ? utcMethod(interopDefault(dayjs)(value[1]))
      : null;
    vals = [sdate, edate];
  }
  const [values, setValues] = useState<any>(vals);
  const [showFormat, setShwFormat] = useState<any>(format || vformat);

  const [, setDateStrings] = useState<[string, string]>(['', '']);
  const [openDates, setOpenDates] = useState<RangeValue>(null);
  const openDateRef = React.useRef<RangeValue>(null);
  const todayRef = React.useRef<Dayjs>(interopDefault(dayjs)({ format }));
  const inputfornat = ((vformat as string) || (format as string)).replaceAll('-', '');

  // 包装的ref 是为了获取该div低下的input 框
  const ref = React.useRef<HTMLDivElement | null>(null);
  // 选择弹窗提示
  const open = React.useRef<boolean>(false);

  const toRangs = () => {
    const today = interopDefault(dayjs)({ format });

    const tRanges = {};

    rangesList?.forEach((item) => {
      const afterDay = interopDefault(dayjs)({ format }).add(item.value, item.type);
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
    (changedValue: any, dates: [Dayjs, Dayjs]): void => {
      // Should provide an event to pass value to Form.
      let rChangedValue = changedValue;
      const temformat = vformat || format;
      //if (vformat && rChangedValue) {
      if (dates) {
        rChangedValue = [
          dates[0] ? utcMethod(dates[0]).format(temformat as string) : '',
          dates[1] ? utcMethod(dates[1]).format(temformat as string) : '',
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
  //       const today = interopDefault(dayjs)({ format });
  //       const afterDay = interopDefault(dayjs)({ format }).add(selectedItem.value, type);
  //       rvals = [today, afterDay];
  //       strs = [today.format(format), afterDay.format(format)];
  //       setValues(rvals);
  //       setDateStrings(strs);
  //     } else {
  //       const today = interopDefault(dayjs)({ format });
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
  /** 注册监听事件 */
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
  const getInputDate = (str: string | null, time = '12:00:00') => {
    if (typeof str !== 'string') return null;
    // 判断是否是数字
    if (parseFloat(str).toString() == 'NaN') return null;
    let newStr: string | null = null;
    const strLength = str.length;
    const currentYear = todayRef.current.year();
    let currentMonth: string = (todayRef.current.month() + 1).toString();
    currentMonth = Number(currentMonth) > 10 ? currentMonth : '0' + currentMonth;
    const map = {
      2: () => {
        const date = dayjs(currentYear + currentMonth + str, inputfornat);
        if (date.isValid()) {
          newStr = currentYear + currentMonth + str;
        }
      },
      4: () => {
        const dateTime = dayjs(currentYear + str, inputfornat);
        if (dateTime.isValid()) {
          newStr = currentYear + str;
        }
      },
      6: () => {
        const prefiex = currentYear.toString().substring(0, 2);
        const dateTime = dayjs(prefiex + str, inputfornat);
        if (dateTime.isValid()) {
          newStr = prefiex + str;
        }
      },
    };
    if (strLength === 2 || strLength === 4 || strLength === 6) {
      map[strLength]();
    }
    if (newStr) {
      // 判断是否为不可选日期
      if (resProps.disabledDate && resProps.disabledDate(dayjs(newStr))) {
        newStr = null;
      } else {
        newStr = newStr + ' ' + time;
      }
    }
    return newStr ? dayjs(newStr, 'YYYYMMDD HH:mm:ss') : null;
  };

  const startListener = useDebounceFn(
    (event: Event) => {
      if (open.current) {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const time =
          typeof props.showTime === 'object' && props.showTime?.defaultValue
            ? dayjs(props.showTime?.defaultValue[0]).format('HH:mm:ss')
            : undefined;
        const startDate: Dayjs | null = getInputDate(target.value, time);
        if (startDate) {
          const dates: RangeValue =
            openDateRef.current != null ? [startDate, openDateRef.current[1]] : [startDate, null];
          openDateRef.current = dates;
          setOpenDates(dates);
        }
      }
    },
    { wait: 700 },
  );

  const endListener = useDebounceFn(
    (event: Event) => {
      if (open.current) {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const time =
          typeof props.showTime === 'object' && props.showTime?.defaultValue
            ? dayjs(props.showTime?.defaultValue[1]).format('HH:mm:ss')
            : undefined;
        const endDate: Dayjs | null = getInputDate(target.value, time);
        if (endDate) {
          const dates: RangeValue =
            openDateRef.current != null ? [openDateRef.current[0], endDate] : [values[0], endDate];
          openDateRef.current = dates;
          setOpenDates(dates);
        }
      }
    },
    { wait: 700 },
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

  const onOpenChange = (v: boolean) => {
    const temformat = (vformat as string) || (format as string);
    open.current = v;
    if (v) {
      setShwFormat(temformat.replaceAll('-', ''));
      setOpenDates(values);
      openDateRef.current = null;
    } else {
      setShwFormat(temformat);
      if (openDateRef.current && openDateRef.current[0] != null && openDateRef.current[1] != null) {
        const startDate = utcMethod(openDateRef.current[0]);
        const endDate = utcMethod(openDateRef.current[1]);
        const dataStr: [string, string] = [
          startDate.format(format as string),
          endDate.format(format as string),
        ];
        onChange?.([startDate, endDate], dataStr);
      }
      openDateRef.current = null;
      setOpenDates(null);
    }
    resProps.onOpenChange?.(v);
  };

  return (
    <div ref={ref}>
      <RangePicker
        {...resProps}
        onChange={handleChange}
        value={openDates || values}
        onOpenChange={onOpenChange}
        inputReadOnly={false}
        onCalendarChange={(val: RangeValue, formatString: [string, string], info: RangeInfo) => {
          console.log('val', val, info);
          if (info.range === 'start' && val != null) {
            setOpenDates([val[0], null]);
          } else {
            setOpenDates(val);
          }

          resProps.onCalendarChange?.(val, formatString, info);
        }}
        format={showFormat}
        ranges={vranges}
      //  className={rangesList ? 'sc-date-picker-range-after' : ''}
      />
    </div>
  );
};

export default ScRangePicker;
