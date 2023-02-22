import type {
  FieldGroup as ScFieldGroup,
  FiledProp as ScFiledProp,
  FormConfig as ScFormConfig,
  FormItemProp as ScFormItemProp,
  FormLayout,
} from '@scboson/sc-element/es/c-form';
import type { SearchBarItem } from '@scboson/sc-element/es/sc-search-bar';
import type { ScProColumnType } from '@scboson/sc-element/es/sc-table';
import type { ButtonProps, ButtonType } from 'antd/es/button';
import type React from 'react';
import type { CmpTypes, PropsType } from './register';

interface FormItemProp<T = any> extends ScFormItemProp {
  component?: CmpTypes | string | React.ComponentType<T | any>;
  /** 组件属性 */
  props?: PropsType<CmpTypes> | T;
}

interface FieldGroup extends Omit<ScFieldGroup, 'items'> {
  items: FormItemProp[];
}

declare type Field = FormItemProp | FieldGroup;

interface FormConfig extends Omit<ScFormConfig, 'items'> {
  items: Field[];
}

export { Field, FormItemProp, FieldGroup, ScFiledProp, FormConfig, FormLayout };

export type FormItem = Omit<FormItemProp, 'component'>;

export interface DialogOptions {
  url?: string; // 去的页面
  width?: string | number; // 页面宽度
  title?: string;
  showFull?: boolean; // 是否全屏
  pageProps?: any; // 弹出页面接收参数
  params?: any; // 参数
  record?: any; // 表格单个数据
  content?: React.ReactNode | string | any; // 显示的页面content
  onOk?: () => Promise<any>;
  onCancel?: () => Promise<any>;
  service?: (...args: any[]) => Promise<any>;
  close?: (values?: any) => void | null; // 弹窗关闭
  form?: any;
  backUrl?: string;
  /** 进入页面时间 */
  pageEntryTime?: string;
  preHandle?: (values: any) => any;
  callBack?: (values: any, requestData?: any) => void; // 回调函数
  okCancel?: true;
  /** 弹框前事件 */
  beforeOpen?: () => any;
  footer?: boolean;
}

export interface ButtonTypeProps extends ButtonProps {
  key?: string;
  text?: string;
  icon?: React.ReactNode;
  type?: ButtonType;
  /** 按钮类型 */
  buttonType?: string;
  /** 功能号 */
  funcode?: string;
  action?: Action;
  /** 弹出框属性配置 */
  options?: DialogOptions;
  closeDlg?: boolean;
  params?: any;
  /** 调用远程服务方法 */
  serverName?: string;
  // 是否可见
  visible?:
  | ((value: any, record: any, index: number) => boolean | ButtonTypeProps | React.ReactElement)
  | boolean;
  //
  /**
   * 返回true 表示继续 ，false 表示中断, values: 在表单中是表单数据 在页面调整和弹出是对应的参数
   *
   * 提交前处理
   */
  preHandle?: (values: any) => any;
  callBack?: (values: any, requestData?: any) => void; // 回调函数
}

export enum Action {
  ADD = 'add',
  EDIT = 'edit',
  VIEW = 'view',
}
export declare type HButtonType = ButtonTypeProps | React.ReactElement;

interface ToolButtonsProps {
  add: ButtonTypeProps;
  batchSubmit: ButtonTypeProps;
  batchAudit: ButtonTypeProps;
  batchDelete: ButtonTypeProps;
  copy: ButtonTypeProps;
  help: ButtonTypeProps;
  dataImport: ButtonTypeProps;
  dataExport: ButtonTypeProps;
  edit: ButtonTypeProps;
  submit: ButtonTypeProps;
  remove: ButtonTypeProps;
  view: ButtonTypeProps;
  audit: ButtonTypeProps;
  disabled: ButtonTypeProps;
  formBack: ButtonTypeProps;
  formUpdate: ButtonTypeProps;
  formSubmit: ButtonTypeProps;
  confirm: ButtonTypeProps;
  link: ButtonTypeProps;
}

/** 工具栏按钮类型 */
export const ToolButtons: ToolButtonsProps = {
  /** 新建 */
  add: {
    text: '新建',
    type: 'primary',
    action: Action.ADD,
    buttonType: 'add',
  },
  /** 批量提交 */
  batchSubmit: {
    text: '批量提交',
    type: 'primary',
    buttonType: 'batchSubmit',
    serverName: 'batchSubmit',
  },
  /** 批量审批 */
  batchAudit: {
    text: '批量审核',
    type: 'primary',
    buttonType: 'batchAudit',
    serverName: 'batchAudit',
  },
  /** 批量删除 */
  batchDelete: {
    text: '批量删除',
    type: 'primary',
    buttonType: 'batchDelete',
    serverName: 'batchDelete',
  },
  /** 复制 */
  copy: {
    text: '复制',
    type: 'primary',
    buttonType: 'copy',
  },
  /** 帮助 */
  help: {
    text: '帮助',
    type: 'primary',
    buttonType: 'help',
  },
  /** 导入 */
  dataImport: {
    text: '导入',
    buttonType: 'dataImport',
    serverName: 'dataImport',
  },
  /** 导出 */
  dataExport: {
    text: '导出',
    buttonType: 'dataExport',
    serverName: 'dataExport',
  },
  /** 编辑 */
  edit: {
    text: '编辑',
    buttonType: 'edit',
    action: Action.EDIT,
  },
  /** 提交 */
  submit: {
    text: '提交',
    type: 'primary',
    buttonType: 'submit',
    serverName: 'submit',
  },
  /** 删除 */
  remove: {
    text: '删除',
    buttonType: 'remove',
    serverName: 'remove',
  },
  /** 详情 */
  view: {
    text: '详情',
    buttonType: 'view',
    action: Action.VIEW,
  },
  /** 审批 */
  audit: {
    text: '审批',
    type: 'primary',
    buttonType: 'audit',
  },
  disabled: {
    text: '停用',
    buttonType: 'disabled',
  },
  formBack: {
    text: '返回',
    buttonType: 'formBack',
  },
  formUpdate: {
    text: '修改',
    type: 'primary',
    buttonType: 'formUpdate',
    serverName: 'formUpdate',
  },
  formSubmit: {
    text: '保存',
    type: 'primary',
    buttonType: 'formSubmit',
    serverName: 'formSubmit',
  },
  confirm: {
    text: '确认',
    buttonType: 'confirm',
    serverName: 'confirm',
  },
  link: {
    text: '跳转',
    buttonType: 'link',
  },
};
export const setFuncodes = (toolButtons: any) => {
  Object.keys(toolButtons).forEach((key: string) => {
    if (ToolButtons[key]) {
      ToolButtons[key].funcode = toolButtons[key].funcode;
    }
  });
};
export const ColumnDataType = {
  amount: 'amount',
  money: 'money',
  area: 'area',
  date: 'date',
  monthAndYearDate: 'monthAndYearDate',
  phone: 'phone',
  type: 'type',
  dictionary: 'dictionary',
  bizStatusName: 'bizStatusName',
};

// 搜索条件表单
export interface QueryConfig {
  label: string; // 名称
  name: string; // key
  valueType?: string; // 默认组件类型
  valueEnum?: any; // 组件枚举
  component?: React.ReactNode | string; // 自定义组件
  formItemProps?: any; // 该组件的表单属性
  props?: any; // 组件的属性
}

type DataType =
  | 'defaultNumber'
  | 'unitprice'
  | 'money'
  | 'status'
  | 'dataTime'
  | 'media'
  | 'rate'
  | 'un_cargoUnit'
  | 'un_stockUnit'
  | 'un_purchaseUnit'
  | 'un_distributeUnit'
  | 'number';

export type ExcelColumn = {
  name?: string;
  dataIndex?: string;
  dataType?: 'STRING' | 'CURRENCY' | 'NUMBER';
  pattern?: string;
  expression?: string;
};
export interface ProColumnType<RecordType> extends ScProColumnType<RecordType> {
  dataType?: DataType | string;
  dataIndex?: string;
  name?: string;
  /** 在 table 中隐藏 */
  hideInTable?: boolean;
  component?: string;
  inputType?: string;
  props?: any; // 组件的属性
  exportConfig?: boolean | ExcelColumn; //表格列导出配置
  children?: ProColumns<RecordType>;
}
export interface ProColumnGroupType<RecordType>
  extends ProColumnType<RecordType> {
  children: ProColumns<RecordType>;
}

export declare type ProColumn<RecordType = any> =
  | ProColumnGroupType<RecordType>
  | ProColumnType<RecordType>;

export declare type ProColumns<RecordType = unknown> = (
  | ProColumnGroupType<RecordType>
  | ProColumnType<RecordType>
)[];

// export interface NodeType ='queryConfig' | 'formConfig' | 'tableConfig'

// export interface QueryConfigItem extends FiledProp {
//   // 文本
//   label: string;
//   // 字段
//   name: string;
//   /** 组件 */
//   component: string;
//   /** 是否显示再更多 */
//   hiddenExpend: boolean;
//   /** 组件属性 */
//   props?: any;
//   /** 子集 */
//   children?: QueryConfigItem[];
//   /** 占据多少格 */
//   columnSize?: number;
// }

export type FormSearchItem = FormItemProp &
  Omit<SearchBarItem, 'component' | 'children' | 'label' | 'name'>;

// export interface FormSearchItem extends FormItem<any>,SearchBarItem {
//   /** 是否隐藏 */
//   hiddenExpend?: boolean;
// }

/** 表单过滤 */
export interface FormFilterProp {
  nodeType?: string;
  /** Key "节点下的key",多表单时使用 */
  key?: string;
  /** FormKey 表单名 */
  formKey?: string;
  /** CallBack 每一项回调处理 */
  callBack?: (item: FormItemProp, group: string) => boolean;
  action?: string;
  fieldsProp?: Map<string, (item: FormItemProp, group: string) => FormItemProp | any> | any;
}

/** 表格过滤 */
export interface TableFilterProp {
  nodeType?: string;
  /** Key "节点下的key"多表格时使用 */
  key?: string;
  /** CallBack 每一项回调处理 */
  callBack?: (item: ProColumn) => boolean;
  action?: string;
  fieldsProp?: Map<string, (item: ProColumn) => FormItemProp | any> | undefined;
}
/** 查询配置过滤 */
export interface SearchFilterProp {
  nodeType?: string;
  /** Key "节点下的key"多查询配置时使用 */
  key?: string;
  /** CallBack 每一项回调处理 */
  callBack?: (item: FormSearchItem) => boolean;
  /** 当前操作 */
  action?: string;
  fieldsProp?: Record<string, (item: FormSearchItem) => FormSearchItem | any> | undefined;
}

/** 页面类型 */
export enum PageType {
  /** 列表页 */
  list = 'listpage',
  /** 弹出页 */
  modal = 'modalpage',
  /** 普通编辑页 */
  page = 'page',
}
/** 页面配置 */
export interface PageConfig {
  /** 查询配置 */
  queryConfig?: Record<string, FormSearchItem[]> | FormSearchItem[];
  /** 表单配家配置 */
  formConfig?: Record<string, FormConfig[]> | FormConfig[];
  /** 表格配置 */
  tableConfig?: Record<string, ProColumns> | ProColumns;
  /** 远程服务 */
  service?: Record<string, Promise<any>> | any;
  /** 页面类型 */
  pageType?: PageType | string;
  /** 页面事件 */
  event?: Record<string, () => any | Promise<any>> | any;
  /** 页面路径 */
  path?: string;
}
export interface ColItem {
  editable?: boolean;
}
