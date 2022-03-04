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
  
} from 'antd'

import {
  ScCascader,
  ScSelect,
  ScTreeSelect,
  ScDatePicker as ScDate,
  ScCheckBox,
  ScRadio,
  ScTextArea,
} from '@scboson/sc-element'
import {umi,Schema} from './context';

const { ScDatePicker, ScRangePicker } = ScDate
const { Group: InputGroup } = Input

export const cmps: Record<string,any> = {
  "Input":Input,
  "ScTextArea":ScTextArea,
  "TreeSelect":TreeSelect,
  "Select":Select,
  "Checkbox":Checkbox,
  "Radio":Radio,
  'DatePicker':DatePicker,
  "Calendar":Calendar,
  "AutoComplete":AutoComplete,
  "InputNumber":InputNumber,
  "Switch":Switch,
  "Upload":Upload,
  "Cascader":Cascader,
  "ScCascader":ScCascader,
  "ScSelect":ScSelect,
  "ScTreeSelect":ScTreeSelect,
  "ScDatePicker":ScDatePicker,
  "ScRangePicker":ScRangePicker,
  "ScCheckBox":ScCheckBox,
  "ScRadio":ScRadio,
  "InputGroup":InputGroup,
}


export type CmpType=keyof typeof cmps



export const regEditCmp = (cmpTye: string, cmp: any) => {
  if (cmps[cmpTye]) {
    //  console.log("组件已存在")
    return
  }
  cmps[cmpTye] = cmp
}
export const regeditCmp=regEditCmp;

/**
 * 
 * @param key 注册umi上下文
 * @param value 
 */
export const regUmiContext=<T extends keyof typeof umi>(key: T,value: any)=>{

  umi[key]=value
}

export const regSchemaContex=<T extends keyof typeof Schema>(key: T, value: any)=>{
  Schema[key]=value
}