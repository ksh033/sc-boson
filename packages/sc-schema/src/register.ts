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
} from 'sc-element'

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

export const regeditCmp = (cmpTye: string, cmp: any) => {
  if (cmps[cmpTye]) {
    //  console.log("组件已存在")
    return
  }
  cmps[cmpTye] = cmp
}
