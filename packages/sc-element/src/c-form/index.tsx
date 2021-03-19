import CForm from './CForm';
import { FormInstance } from 'antd/es/form';
export { deepGet } from './CForm';

export interface FormComponent<P> extends React.FC<P> {
  customView?: boolean;
}

export interface FormComponentProps {
  readonly?: boolean;
  name?: string;
  form?: FormInstance;
  initialValues?: any;
  formItemProps?: any;
}
export default CForm;
