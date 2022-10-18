import {
  Input,
  TreeSelect,
  Select,
  Checkbox,
  Radio,
  DatePicker,
  Calendar,
  AutoComplete,
  InputNumber,
  Switch,
  Upload,
  Cascader,
  TimePicker,
} from 'antd';
import type { InputProps, GroupProps } from 'antd/es/input';
import type { TreeSelectProps } from 'antd/es/tree-select';
import type { SelectProps } from 'antd/es/select';
import type { CheckboxProps } from 'antd/es/checkbox';
import type { RadioProps } from 'antd/es/radio';
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';
import type { CalendarProps } from 'antd/es/calendar';
import type { AutoCompleteProps } from 'antd/es/auto-complete';
import type { InputNumberProps } from 'antd/es/input-number';
import type { SwitchProps } from 'antd/es/switch';
import type { UploadProps } from 'antd/es/upload';
import type { CascaderProps } from 'antd/es/cascader';

import {
  ScCascader,
  ScSelect,
  ScTreeSelect,
  ScDatePicker as ScDate,
  ScCheckBox,
  ScRadio,
  ScTextArea,
} from '@scboson/sc-element';

import { umi, Schema } from './context';
import type { ScTextAreaProps } from '@scboson/sc-element/es/sc-text-area';
import type { ScCascaderProps } from '@scboson/sc-element/es/sc-cascader';
import type { ScSelectProps } from '@scboson/sc-element/es/sc-select';
import type { ScTreeSelectProps } from '@scboson/sc-element/es/sc-tree-select';
import type { ScRadioProps } from '@scboson/sc-element/es/sc-radio';

const { ScDatePicker, ScRangePicker } = ScDate;
const { Group: InputGroup } = Input;

export const cmps: Record<string, any> = {
  Input: Input,
  ScTextArea: ScTextArea,
  TreeSelect: TreeSelect,
  Select: Select,
  Checkbox: Checkbox,
  Radio: Radio,
  DatePicker: DatePicker,
  Calendar: Calendar,
  AutoComplete: AutoComplete,
  InputNumber: InputNumber,
  Switch: Switch,
  Upload: Upload,
  Cascader: Cascader,
  ScCascader: ScCascader,
  ScSelect: ScSelect,
  ScTreeSelect: ScTreeSelect,
  ScDatePicker: ScDatePicker,
  ScRangePicker: ScRangePicker,
  ScCheckBox: ScCheckBox,
  ScRadio: ScRadio,
  InputGroup: InputGroup,
  TimePicker: TimePicker,
};

export type CmpPropsTypes = {
  Input: InputProps;
  ScTextArea: ScTextAreaProps;
  TreeSelect: TreeSelectProps;
  Select: SelectProps;
  Checkbox: CheckboxProps;
  Radio: RadioProps;
  DatePicker: DatePickerProps;
  Calendar: CalendarProps<any>;
  AutoComplete: AutoCompleteProps;
  InputNumber: InputNumberProps;
  Switch: SwitchProps;
  Upload: UploadProps;
  Cascader: CascaderProps<any>;
  ScCascader: ScCascaderProps;
  ScSelect: ScSelectProps;
  ScTreeSelect: ScTreeSelectProps;
  ScDatePicker: DatePickerProps;
  ScRangePicker: RangePickerProps;
  ScCheckBox: CheckboxProps;
  ScRadio: ScRadioProps;
  InputGroup: GroupProps;
};

export type CmpTypes = keyof CmpPropsTypes;
//export type PropsType<T =  keyof CmpTypes>=T extends 'Input' ? InputProps: T extends 'ScTextArea'? TextAreaProps:any

export type PropsType<T extends CmpTypes> = CmpPropsTypes[T];

export const regEditCmp = (cmpTye: string, cmp: any) => {
  if (cmps[cmpTye]) {
    //  console.log("组件已存在")
    return;
  }
  cmps[cmpTye] = cmp;
};
export const regeditCmp = regEditCmp;

/**
 * @param key 注册umi上下文
 * @param value
 */
export const regUmiContext = <T extends keyof typeof umi>(key: T, value: any) => {
  umi[key] = value;
};

export const regSchemaContex = <T extends keyof typeof Schema>(key: T, value: any) => {
  Schema[key] = value;
};
