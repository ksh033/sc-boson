import type { Rule, FormItemProps } from 'antd/es/form';
import type { ColProps } from 'antd/es/grid/col';

export declare type FormLayout = 'horizontal' | 'inline' | 'vertical';

export declare type RenderFunction = (val: any) => React.ReactNode;
export interface FiledProp extends FormItemProps {
  prefixCls?: string;
  noStyle?: boolean;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  hasFeedback?: boolean;
  rules?: Rule[];
  required?: boolean;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  render?: RenderFunction;
}
/** 表单项配置 */
export interface FormItemProp {
  label?: string;
  name?: string | string[];
  /** 表单项 id用于复合组件 */
  id?: string;
  /**
   * 表单项属性 fieldProps
   *
   * @deprecated
   */
  formItemProps?: FiledProp;

  render?: (val: any, record: any) => any;

  colProps?: ColProps & { newline?: boolean };
  /** 表单项属性 */
  fieldProps?: FiledProp;
  /** 子集 */
  children?: FormItemProp[];
  /** 占据多少格 */
  columnSize?: number;

  /** 是否换行 */
  newline?: boolean;
  /** 组件 */
  component?: any;
  /** 组件属性 */
  props?: any;
  /**
   * - Auto 使用组件默认的宽度 - xs=104px 适用于短数字、短文本或选项。 - sm=216px 适用于较短字段录入、如姓名、电话、ID 等。 - md=328px
   * 标准宽度，适用于大部分字段长度。 - lg=440px 适用于较长字段录入，如长网址、标签组、文件路径等。 - xl=552px
   * 适用于长文本录入，如长链接、描述、备注等，通常搭配自适应多行输入框或定高文本域使用。
   */
  width?: number | 'sm' | 'md' | 'xl' | 'xs' | 'lg' | string;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 数据别名 可以为string | function(value,fromItem){} */
  dataName?: string | ((value: string | any | number, fromItem: FormItemProp) => string);
  /** 数据默认转换类型 */
  dataType?: string;
  viewUseComponent?: boolean;
  addonBefore?: any;
  addonAfter?: any;
  [index: string]: any;
}

export interface FieldGroup {
  title?: string;
  colProps?: ColProps;
  items: FormItemProp[];
}
export declare type Field = FormItemProp | FieldGroup;

export interface FormConfig {
  /** 表单每行显示几个数据 */
  col?: number;
  /**
   * 分组key
   *
   * @deprecated
   */
  group?: string;

  /** 分组key */
  fieldset?: string;
  /** 分组名称 */
  fieldsetTitle?: string | React.ReactNode;
  // 子标题
  subTitle?: string | React.ReactNode;
  layout?: FormLayout;
  /**
   * 分组名称
   *
   * @deprecated
   */
  groupTitle?: string | React.ReactNode;
  /** 分组表单项 */
  items: Field[];

  className?: string;
  labelCol?: ColProps;

  wrapperCol?: ColProps;
}
