import CForm from './CForm'
import { FormInstance } from 'antd/es/form';
export {deepGet} from './ViewItem'

export interface FormComponent<P> extends React.FC<P>{
    customView?:boolean
}
 
export interface FormComponentProps {
       readonly?:boolean;
       name?:string
       form?:FormInstance;
       initialValues?:any;
}
export default CForm

