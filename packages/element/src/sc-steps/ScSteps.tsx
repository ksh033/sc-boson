import * as React from 'react';
import { Steps } from 'antd';
const Step = Steps.Step;
export interface ScStepsProps {
  data?: Array<any>;
}

const ScSteps: React.FC<ScStepsProps> = (props) => {
  let { data, ...resProps } = props;
  let children: any[] = [];
  if (data && data.length > 0) {
    data.forEach((item: any, index: number) => {
      children.push(<Step {...item} key={index}></Step>);
    });
  }
  return <Steps {...resProps}>{children}</Steps>;
};

export default React.memo(ScSteps);
