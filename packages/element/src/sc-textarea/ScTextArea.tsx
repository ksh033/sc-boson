import React from 'react';
import { Input } from 'antd';
import { TextAreaProps } from 'antd/es/input';

const { TextArea } = Input;

export interface ScTextAreaProps extends TextAreaProps {}

const ScTextArea: React.FC<ScTextAreaProps> = props => {
  return <TextArea {...props} />;
};
export default ScTextArea;
