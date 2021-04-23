import type { TreeProps, DataNode } from 'antd/lib/tree';
import type React from 'react';



export type ActionBaseFunction<T> = (key: any, row: T) => void;

export type ActionFunctionVO<T> = {
  add?: (row: T) => void;
  delete?: (row: T) => void;
  edit?: (row: T) => void;
  extendAction?: () => React.ReactNode[] | React.ReactNode;
};

export type DefaultAction<T> = {
  add: ActionBaseFunction<T>;
  delete: ActionBaseFunction<T>;
  edit: ActionBaseFunction<T>;
}

export type ActionType = DefaultAction<DataNode> & {
  /** @name 刷新 */
  reload?: () => void;
};

export type ActionRenderFunction<T> = (
  row: T,
  defaultAction: DefaultAction<T>,
) => ActionFunctionVO<T>;

export interface ScTreeProps extends TreeProps {
  data?: DataNode[];
  textField?: string;
  valueField?: string;
  params?: any;
  autoload?: boolean;
  canSearch?: boolean;
  placeholder?: string;
  onSearch?: any;
  actionRender?: ActionRenderFunction<any>;
  request?: (params: any) => Promise<any>;
  onLoad?: (data: any) => void;
  isLeafFormat?: (data: any) => boolean;
  async?: boolean;
  loadDataPramsFormat?: (data: any) => any;
  saveRef?: React.MutableRefObject<ActionType | undefined> | ((actionRef: ActionType) => void);
}
