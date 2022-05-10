import type { TreeProps, DataNode } from 'antd/es/tree';
import type React from 'react';

export type TreeDataNode = DataNode;

export type ActionBaseFunction<T> = (key: any, row: T) => void;

export type ActionFunctionVO<T> = {
  add?: (row: T) => void;
  delete?: (row: T) => void;
  edit?: (row: T) => void;
  extendAction?: () => React.ReactNode[] | React.ReactNode;
  alwaysShow?: boolean;
};

export type DefaultAction<T> = {
  add: (key: any, row: T, isRoot?: boolean) => void;
  delete: ActionBaseFunction<T>;
  edit: ActionBaseFunction<T>;
};

export type ActionType = DefaultAction<TreeDataNode> & {
  /** @name 刷新 */
  reload?: () => void;
};

export type ActionRenderFunction<T> = (
  row: T,
  defaultAction: DefaultAction<T>,
) => ActionFunctionVO<T>;

export interface ScTreeProps extends TreeProps {
  data?: TreeDataNode[];
  textField?: string;
  valueField?: string;
  params?: any;
  root?: Record<string, any>;
  autoload?: boolean;
  canSearch?: boolean;
  placeholder?: string;
  onSearch?: any;
  treeType?: "Tree" | "DirectoryTree"
  actionRender?: ActionRenderFunction<any>;
  render?: (node: any) => React.ReactNode;
  request?: (params: any) => Promise<any>;
  onLoad?: (data: any) => any;
  isLeafFormat?: (data: any) => boolean;
  async?: boolean;
  loadDataPramsFormat?: (data: any) => any;
  saveRef?:
  | React.RefObject<ActionType | undefined>
  | React.MutableRefObject<ActionType | undefined>
  | ((actionRef: ActionType) => void);
  readonly?: boolean;
}
