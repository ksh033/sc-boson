import type { ColumnProps, TableProps } from 'antd/es/table/index';
import type { FormInstance, FormItemProps } from 'antd/es/form/index';
import type { ComponentClass, FunctionComponent } from 'react';
import type { UseEditableUtilType } from './useEditableArray';

export type RowEditableType = 'single' | 'multiple';
export type ParamsType = Record<string, any>;
export type RecordKey = React.Key | React.Key[];
export type TableRowSelection = TableProps<any>['rowSelection'];
/** 操作类型 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type ProCoreActionType<T = {}> = {
  /** @name 刷新 */
  reload?: (resetPageIndex?: boolean) => void;
  /** @name 刷新并清空 */
  reloadAndRest?: () => void;
  /** @name 重置 */
  reset?: () => void;

  /** @name 清空选择 */
  clearSelected?: () => void;
} & Omit<
  UseEditableUtilType,
  'newLineRecord' | 'editableKeys' | 'actionRender' | 'setEditableRowKeys'
> &
  T;

export type ActionType = ProCoreActionType & {
  selectedRows: any[];
  fullScreen?: () => void;
  validateRules?: (value: any[]) => Promise<any>;
};

export type AddLineOptions = {
  recordKey?: RecordKey;
};

export type NewLineConfig<T> = {
  defaultValue: T | undefined;
  options: AddLineOptions;
};

export type ActionTypeText<T> = {
  deleteText?: React.ReactNode;
  cancelText?: React.ReactNode;
  saveText?: React.ReactNode;
  addEditRecord?: (row: T, options?: AddLineOptions) => boolean;
};

export type ActionRenderConfig<T, LineConfig = NewLineConfig<T>> = {
  editableKeys?: RowEditableConfig<T>['editableKeys'];
  recordKey: RecordKey;
  index?: number;
  form: FormInstance;
  cancelEditable: (key: RecordKey) => void;
  onSave: RowEditableConfig<T>['onSave'];
  onCancel: RowEditableConfig<T>['onCancel'];
  onDelete?: RowEditableConfig<T>['onDelete'];
  deletePopconfirmMessage: RowEditableConfig<T>['deletePopconfirmMessage'];
  setEditableRowKeys: (value: React.Key[]) => void;
  newLineConfig?: LineConfig;
} & ActionTypeText<T>;

export type ActionRenderFunction<T> = (
  row: T,
  config: ActionRenderConfig<T, NewLineConfig<T>>,
  defaultDoms: {
    save: React.ReactNode;
    delete: React.ReactNode;
    cancel: React.ReactNode;
  },
) => React.ReactNode[];

export type RowEditableConfig<T> = {
  /** @name 控制可编辑表格的 form */
  form?: FormInstance;
  /**
   * @type single | multiple
   * @name 编辑的类型，支持单选和多选
   */
  type?: RowEditableType;
  /** @name 正在编辑的列 */
  editableKeys?: React.Key[];
  /** 正在编辑的列修改的时候 */
  onChange?: (editableKeys: React.Key[], editableRows: T[] | T) => void;
  /** 正在编辑的列修改的时候 */
  onValuesChange?: (record: T, dataSource: T[], index: number) => void;
  /** @name 自定义编辑的操作 */
  actionRender?: ActionRenderFunction<T>;
  /** 行保存的时候 */
  onSave?: (
    key: RecordKey,
    row: T & { index?: number },
    newLineConfig?: NewLineConfig<T>,
  ) => Promise<any | void>;

  /** 行保存的时候 */
  onCancel?: (
    key: RecordKey,
    row: T & { index?: number },
    newLineConfig?: NewLineConfig<T>,
  ) => Promise<any | void>;

  /** 行删除的时候 */
  onDelete?: (key: RecordKey, row: T & { index?: number }) => Promise<any | void>;
  /** 删除行时的确认消息 */
  deletePopconfirmMessage?: React.ReactNode;
  /** 只能编辑一行的的提示 */
  onlyOneLineEditorAlertMessage?: React.ReactNode;
  /** 同时只能新增一行的提示 */
  onlyAddOneLineAlertMessage?: React.ReactNode;
};

export type ProTableEditableFnType<T> = (_: any, record: T, index: number) => boolean;

export type ProColumns<T = unknown> = Omit<ColumnProps<T>, 'render'> & {
  index?: number;
  editable?: boolean | ProTableEditableFnType<T>;
  component?: FunctionComponent<any> | ComponentClass<any, any> | any;
  /** 自定义的 formItemProps render */
  formItemProps?: FormItemProps;
  props?: any;
  render?: (
    dom: React.ReactNode,
    entity: T,
    index: number,
    action: ProCoreActionType,
  ) => React.ReactNode | null;
};
export type ProTableProps<T> = {
  columns?: ProColumns<T>[];
  /** @name 编辑行相关的配置 */
  editable?: RowEditableConfig<T>;
  /** @name 选择想配置 */
  rowSelection?: TableProps<T>['rowSelection'] | false;
  /** @name 初始化的参数，可以操作 table */
  actionRef?: React.MutableRefObject<ActionType | undefined> | ((actionRef: ActionType) => void);
} & Omit<TableProps<T>, 'columns' | 'rowSelection' | 'onChange'>;

export interface TableComponent<P> extends React.FC<P> {
  customView?: boolean;
}

export interface TableComponentProps {
  name?: string;
  form?: FormInstance;
  rowData?: any;
}
