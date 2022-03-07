import * as React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export interface TransferSearchProps {
  prefixCls?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClear?: () => void;
  value?: any;
}

const Search: React.FC<TransferSearchProps> = (props) => {
  const { placeholder = '', value, prefixCls, onChange, handleClear } = props;

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      if (e.target.value === '') {
        handleClear?.();
      }
    },
    [handleClear, onChange],
  );

  return (
    <Input
      placeholder={placeholder}
      className={prefixCls}
      value={value}
      allowClear
      onChange={handleChange}
      prefix={<SearchOutlined />}
    />
  );
};

export default Search;
