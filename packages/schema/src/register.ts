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

export const cmps: any = {
  Input,
  ScTextArea,
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
  ScCascader,
  ScSelect,
  ScTreeSelect,
  ScDatePicker,
  ScRangePicker,
  ScCheckBox,
  ScRadio,
  InputGroup,
}


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