import React from 'react';
import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';

const { TextArea } = Input;

export type ScTextAreaProps = TextAreaProps;

const ScTextArea: React.FC<ScTextAreaProps> = (props) => {
  return <TextArea {...props} />;
};
export default ScTextArea;
