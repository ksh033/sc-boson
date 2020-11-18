import CForm from './CForm'
import { FormInstance } from 'antd/es/form';


export interface FormComponent<P> extends React.FC<P>{
    readonly?:boolean
   
}
export interface FormComponentProps {
       readonly?:boolean;
       viewName?:string
       form?:FormInstance;
}
export default CForm

