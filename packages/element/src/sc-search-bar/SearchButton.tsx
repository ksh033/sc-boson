import * as React from 'react';
import { Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { MyContext } from './context-manager';

const { useContext } = React;

const Buttons: React.FC<any> = () => {
  const { getState, toggleForm, handleFormReset } = useContext(MyContext);
  const state = getState ? getState() : false;
  const bodyStyle: React.CSSProperties = {
    marginBottom: 24,
    float: state ? 'right' : 'none',
  };
  return (
    <span style={bodyStyle}>
      <Button type="primary" htmlType="submit">
        查询
      </Button>
      <Button style={{ marginLeft: 8 }} onClick={handleFormReset}>
        重置
      </Button>
      <a style={{ marginLeft: 8 }} onClick={toggleForm}>
        {state === true ? '收起' : ' 展开'}
        {state === true ? <DownOutlined /> : <UpOutlined />}
      </a>
    </span>
  );
};

export default Buttons;
