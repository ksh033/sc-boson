import * as React from 'react'
import * as moment from 'moment'
import { DatePicker, Select } from 'antd'
import { useUpdateEffect } from '@umijs/hooks'

const { useState, useEffect, useCallback } = React

import interopDefault from '../_util/interopDefault'

const RangePicker = DatePicker.RangePicker
const Option = Select.Option

const ScRangePicker: React.FC<any> = (props) => {
  const {
    format = 'YYYY-MM-DD',
    vformat = 'YYYY-MM-DD',
    rangesList,
    value,
    onChange,
  } = props
  const { rangesListProps = {}, ...resProps } = props;
  //let emptyItem={text:rangesTitle||'当天',value:"",type:'e'}
  let vals: any[] = []
  if (value) {
    let sdate = interopDefault(moment)(value[0]).isValid()
      ? interopDefault(moment)(value[0])
      : null
    let edate = interopDefault(moment)(value[1]).isValid()
      ? interopDefault(moment)(value[1])
      : null
    vals = [sdate, edate]
  }
  const [values, setValues] = useState<any[]>(vals)
  const [dateStrings, setDateStrings] = useState<[string, string]>(['', ''])

  useUpdateEffect(() => {
    setValues(vals)
  }, [value])
  
  const onSelect = useCallback(
    (selectIndex: any): void => {
      let selectedItem = rangesList[parseInt(selectIndex)]
      const { type, value } = selectedItem
      let _vals = [],
        strs: [string, string] = ['', '']
      if (value) {
        let today = interopDefault(moment)({ format })
        let afterDay = interopDefault(moment)({ format }).add(value, type)
        _vals = [today, afterDay]
        strs = [today.format(format), afterDay.format(format)]
        setValues(_vals)
        setDateStrings(strs)
      } else {
        let today = interopDefault(moment)({ format })
        strs = [today.format(format), today.format(format)]
        _vals = [today, today]
      }
      setValues(_vals)
      setDateStrings(strs)
      handleChange(_vals, strs)
    },
    [rangesList, value, format]
  )

  const renderRight = (rangesAfter: any[]) => {
    rangesAfter = rangesAfter || []
    let i = -1
    const operations = rangesAfter.map((range: any) => {
      const { text, value, type } = range
      let temValue = type + '_' + value
      i++
      return (
        <Option key={temValue} value={i}>
          {text}
        </Option>
      )
    })
    return (
      <Select defaultValue={0} onSelect={onSelect} {...rangesListProps}>
        {operations}
      </Select>
    )
  }

  const handleChange = (dates: any, _dateStrings: [string, string]): void => {
    setValues(dates)
    setDateStrings(_dateStrings)
    triggerChange(_dateStrings)
  }

  const triggerChange = useCallback(
    (changedValue: any): void => {
      // Should provide an event to pass value to Form.
      if (vformat && changedValue) {
        changedValue = [
          changedValue[0]?interopDefault(moment)(changedValue[0]).format(vformat):'',
          changedValue[1]?interopDefault(moment)(changedValue[1]).format(vformat):'',
        ]
      }
      if (onChange) {
        onChange(changedValue)
      }
    },
    [onChange, vformat]
  )

  let operations: any = null
  if (rangesList && rangesList.length > 0) {
    operations = renderRight(rangesList)
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
  )
}

export default ScRangePicker
