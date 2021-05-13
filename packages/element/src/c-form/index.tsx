import CForm from './CForm';
import type { FormInstance } from 'antd/es/form';

export { deepGet } from './CForm';

export interface FormComponent<P> extends React.FC<P> {
  customView?: boolean;
}
export { FormConfig, Field, FieldGroup, FiledProp, FormItemProp } from './interface';
export interface FormComponentProps {
  readonly?: boolean;
  name?: string;
  form?: FormInstance;
  initialValues?: any;
  formItemProps?: any;
  fieldProps?: any;
}
export default CForm;
