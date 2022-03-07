import * as React from 'react';
import { MyContext } from './context-manager';

const { useContext } = React;

const Quicks: React.FC<any> = (props: any) => {
  const { getState } = useContext(MyContext);
  let state: boolean = false;
  if (getState) {
    state = getState();
  }
  const { children } = props;
  if (!state) return <div>{children}</div>;

  return null;
};
export default Quicks;
