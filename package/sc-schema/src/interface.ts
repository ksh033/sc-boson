import { ColumnsType } from 'antd/lib/table/interface'

import { Rule } from 'antd/lib/form'
// 搜索条件表单
export interface QueryConfig {
  label: string // 名称
  name: string // key
  valueType?: string // 默认组件类型
  valueEnum?: any // 组件枚举
  component?: React.ReactNode | string // 自定义组件
  formItemProps?: any // 该组件的表单属性
  props?: any // 组件的属性
}

export interface ProColumn
  extends Omit<ColumnsType<any>[number], 'dataIndex' | 'render' | 'children'> {
  dataType?: string
  dataIndex?: string
  name?: string
  /**
   * 在 table 中隐藏
   */
  hideInTable?: boolean
  render?: React.ReactNode
  component?: string
  inputType?: string
  formItemProps?: any // 该组件的表单属性
}

// export interface NodeType ='queryConfig' | 'formConfig' | 'tableConfig'

export interface FormItemProp {
  prefixCls?: string
  noStyle?: boolean
  style?: React.CSSProperties
  className?: string
  id?: string
  hasFeedback?: boolean | 'string'
  rules?: Array<Rule>
  required?: boolean
  labelCol?: { span: number }
  wrapperCol?: { span: number }
}

export interface QueryConfigItem extends FormItemProp {
  // 文本
  label: string
  // 字段
  name: string
  /**
   * 组件
   */
  component: string
  /**
   * 是否显示再更多
   */
  hiddenExpend: boolean
  /**
   * 组件属性
   */
  props?: any
  /**
   * 子集
   */
  children?: QueryConfigItem[]
  /**
   * 占据多少格
   */
  columnSize?: number
}


/**
 * 表单项配置
 */
export interface FormItem{
  // 文本
  label?: string
  // 字段
  name?: string | string[]
  /**
   * 表单项属性
   */
  formItemProps?: FormItemProp
  /**
   * 子集
   */
  children?: FormItem[]
  /**
   * 占据多少格
   */
  columnSize?: number
  /**
   * 组件
   */
  component?: string
  /**
   * 组件属性
   */
  props?: any
  /**
   * 是否只读
   */
  readonly?: boolean
 
  /**
   * 是否隐藏
   */
  hidden?: boolean
  /**
   * 数据别名 可以为string | function(value,fromItem){}
   */
  dataName?:
    | string
    | ((value: string | object | number, fromItem: FormItem) => string)
  /**
   * 数据默认转换类型
   */
  dataType?: string

  viewUseComponent?: boolean

  [index:string]:any
}

export interface FormSearchItem extends FormItem{ 
  /**
    * 是否隐藏
    */
   hiddenExpend?: boolean
 }
 


export interface FormConfig {
  /**
   * 表单每行显示几个数据
   */
  col?: number
  /**
   * 分组key
   */
  group?: string
  /**
   * 分组名称
   */
  groupTitle?: string | React.ReactNode
  /**
   * 分组表单项
   */
  items: FormItem[]
}

export interface FormFilterProp {
  nodeType: string
  /**
   * key "节点下的key"
   */
  key?: string
  /**
   * formKey 表单名
   */
  formKey?: string
  /**
   * callBack 每一项回调处理
   */
  callBack?: (item: FormItem, group: string) => boolean
  action?: string
  fieldsProp?:
    | Map<String, (item: FormItem, group: string) => FormItem | any>
    | any
}

export interface TableFilterProp {
  nodeType: string
  /**
   * key "节点下的key"
   */
  key?: string
  /**
   * callBack 每一项回调处理
   */
  callBack?: (item: ProColumn) => boolean
  action?: string
  fieldsProp?: Map<String, (item: ProColumn) => FormItem | any> | undefined
}

export interface SearchFilterProp {
  nodeType: string
  /**
   * key "节点下的key"
   */
  key?: string
  /**
   * callBack 每一项回调处理
   */
  callBack?: (item: QueryConfigItem) => boolean
  action?: string
  fieldsProp?:
    | Map<String, (item: QueryConfigItem) => QueryConfigItem | any>
    | undefined
}

/**
 * 页面类型
 */
export enum PageType{
  list="listpage",
  modal="modalpage",
  page="page"
}
/**
* 页面返回值
*/
export interface PageConfig {
  queryConfig?: Array<FormSearchItem> | Map<String, Array<FormSearchItem>>;
  formConfig?: Array<FormConfig> | Map<String, Array<FormConfig>>;
  tableConfig?: ProColumn[];
  service?: Map<String, Promise<any>> | any;
  pageType?:PageType|string;
  event?: Map<String, Function | Promise<any>> | any;
  path?:string
}
export interface ColItem {
  editable?: boolean
}
