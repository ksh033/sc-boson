import * as React from 'react'
import { Input } from 'antd'
import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
const { useMemo } = React

export interface TransferSearchProps {
  prefixCls?: string
  placeholder?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleClear?: (e: React.MouseEvent<any>) => void
  value?: any
}

const Search: React.FC<TransferSearchProps> = (props) => {
  const { placeholder = '', value, prefixCls, onChange, handleClear } = props

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist()
    if (onChange) {
      onChange(event)
    }
  }

  const _handleClear = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (handleClear) {
      handleClear(e)
    }
  }
  const icon = useMemo(() => {
    return value && value.length > 0 ? (
      <a href="#" className={`${prefixCls}-action`} onClick={_handleClear}>
        <CloseOutlined />
      </a>
    ) : (
      <span className={`${prefixCls}-action`}>
        <SearchOutlined />
      </span>
    )
  }, [value, prefixCls, _handleClear])

  return (
    <div>
      <Input
        placeholder={placeholder}
        className={prefixCls}
        value={value}
        onChange={handleChange}
      />
      {icon}
    </div>
  )
}

export default Search
