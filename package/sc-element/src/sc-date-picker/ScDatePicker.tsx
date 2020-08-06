import * as React from 'react'
import { DatePicker } from 'antd'
import * as moment from 'moment'
import interopDefault from '../_util/interopDefault'
import { useUpdateEffect } from '@umijs/hooks'
const { useState, useCallback } = React

const ScDatePicker: React.FC<any> = (props) => {
  const { value, format = 'YYYY-MM-DD', onChange } = props

  let val: string = '';
  if (value) {
    val = interopDefault(moment)(value).isValid()
      ? interopDefault(moment)(value)
      : null
  }
  const [date, setDate] = useState(val)
  const [dateString, setDateString] = useState(interopDefault(moment)(''))

  const handleChange = (_date: any, _dateString: string) => {
    setDate(_date)
    setDateString(_dateString)
    triggerChange(_date)
  }
  useUpdateEffect(() => {
    setDate(val)
  }, [value])

//   useUpdateEffect(() => {
//     setDate(interopDefault(moment)(dateString))
//   }, [dateString])

  const triggerChange = useCallback(
    (changedValue: any) => {
      // Should provide an event to pass value to Form.
      if (format && changedValue) {
        changedValue = interopDefault(moment)(changedValue).format(format)
      }
      if (onChange) {
        onChange(changedValue)
      }
    },
    [format, onChange]
  )

  return (
    <DatePicker {...props} value={date} onChange={handleChange}></DatePicker>
  )
}

export default ScDatePicker
