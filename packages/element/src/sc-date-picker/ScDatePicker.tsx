import * as React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import type { Moment } from 'moment';
import interopDefault from '../_util/interopDefault';
import { useDebounceFn, useSetState, useUpdateEffect } from 'ahooks';

const { useState, useCallback, useMemo } = React;
import type { PickerProps, PickerDateProps } from 'antd/es/date-picker/generatePicker';
import { useEffect } from 'react';
import { getTargetElement } from '../_util/domTarget';

export type ScDatePickerProps<DateType> = PickerProps<DateType> & {
  vformat?: string;
  /** 小于单日能选 */
  todayBefor?: boolean;
  /** 大于单日能选 */
  todayAfter?: boolean;
  /** 数据变化 */
  onChange?: (dateString: string, value: DateType | null) => void;
} & Omit<PickerDateProps<any>, 'onChange'>;

type ScDatePickerState = {
  showFormat?: string;
  /** 打开选择框时的显示的时间 */
  openDate?: Moment | null;
  /** 时间选择框是否显示 */
  open?: boolean;
};

const ScDatePicker: React.FC<any> = (props: ScDatePickerProps<Moment>) => {
  const {
    value,
    format = 'YYYY-MM-DD',
    todayAfter,
    todayBefor,
    vformat,
    showTime,
    disabledDate,
    onChange,
    ...restProps
  } = props;

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

  let disData: ((date: moment.Moment) => boolean) | undefined = disabledDate;

  if (!disabledDate) {
    if (todayAfter || todayBefor) {
      disData = (current) => {
        if (todayBefor) return current && current > interopDefault(moment)(new Date());
        if (todayAfter) return current && current < interopDefault(moment)(new Date());
        return true;
      };
    }
  }

  let val: any = '';
  if (value) {
    val = interopDefault(moment)(value).isValid() ? interopDefault(moment)(value) : null;
  }

  const [date, setDate] = useState<Moment>(val);
  const [, setDateString] = useState(interopDefault(moment)(''));

  const [state, setState] = useSetState<ScDatePickerState>({
    showFormat: (format || vformat) as string,
    open: false,
    openDate: null,
  });

  // 包装的ref 是为了获取该div低下的input 框
  const ref = React.useRef<HTMLDivElement | null>(null);
  // 选择弹窗提示
  const open = React.useRef<boolean>(false);
  const todayRef = React.useRef<moment.Moment>(interopDefault(moment)({ format }));
  const inputfornat = ((vformat as string) || (format as string)).replaceAll('-', '');
  const openDateRef = React.useRef<moment.Moment | null>(null);

  const triggerChange = useCallback(
    (changedValue: any) => {
      const rValue: string = changedValue;
      let temV: Moment | null = null;
      if ((vformat || format) && rValue) {
        temV = interopDefault(moment)(rValue).format(vformat || format);
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
        const dateTime = moment(currentYear + currentMonth + str, inputfornat);
        if (dateTime.isValid()) {
          newStr = currentYear + currentMonth + str;
        }
      },
      4: () => {
        const dateTime = moment(currentYear + str, inputfornat);
        if (dateTime.isValid()) {
          newStr = currentYear + str;
        }
      },
      6: () => {
        const prefiex = currentYear.toString().substring(0, 2);
        const dateTime = moment(prefiex + str, inputfornat);
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
      if (disData && disData(moment(newStr))) {
        newStr = null;
      } else {
        newStr = newStr + ' ' + time;
      }
    }
    return newStr ? moment(newStr, 'YYYYMMDD HH:mm:ss') : null;
  };
  /** 监听事件 */
  const eventistener = useDebounceFn(
    (event: Event) => {
      if (open.current) {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const time =
          typeof newProps.showTime === 'object' && newProps.showTime?.defaultValue
            ? moment(newProps.showTime?.defaultValue).format('HH:mm:ss')
            : undefined;
        const dates: Moment | null = getInputDate(target.value, time);
        if (dates) {
          openDateRef.current = dates;
          setState({
            openDate: dates,
          });
        }
      }
    },
    { wait: 700 },
  );

  /** 监听日期输入 */
  useEffect(() => {
    let inputEle: Element | null | undefined = null;

    if (ref.current) {
      function getInput(root: any) {
        if (root.children.length > 0) {
          for (let x = 0; x < root.children.length; x++) {
            if (root.children[x].nodeName === 'INPUT') {
              inputEle = root.children[x];
              return;
            }
            if (root.children[x].children.length > 0) {
              getInput(root.children[x]);
            }
          }
        }
      }
      getInput(ref.current);
      if (inputEle) {
        inputEle = registeredEvent(inputEle, eventistener.run);
      }
    }
    return () => {
      if (inputEle) {
        inputEle.removeEventListener(eventName, eventistener.run);
      }
    };
  }, [ref.current]);

  return (
    <div ref={ref}>
      <DatePicker
        {...newProps}
        format={state.showFormat}
        value={state.open ? state.openDate : date}
        disabledDate={disData}
        onChange={handleChange}
        inputReadOnly={false}
        onOpenChange={(v) => {
          let temformat = (vformat as string) || (format as string);
          open.current = v;
          if (v) {
            temformat = inputfornat;
          } else {
            if (openDateRef.current != null) {
              // console.log('openDateRef.current', openDateRef.current);
              const newDate = openDateRef.current;
              handleChange(newDate, newDate.format(format as string));
            }
          }
          openDateRef.current = null;
          setState({
            showFormat: temformat,
            openDate: date,
            open: v,
          });
          newProps.onOpenChange?.(v);
        }}
      />
    </div>
  );
};

export default ScDatePicker;
