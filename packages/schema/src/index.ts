import { cmps, regeditCmp } from './register';
import schema from './pageConfigUitls';

export { ListPage } from './page/ListPage';
export { EditPage } from './page/EditPage';

export const omitUndefinedAndEmptyArr = (obj: any): any => {
  let newObj: any = null;
  if (Array.isArray(obj)) {
    newObj = obj.map((element: any) => {
      return omitUndefinedAndEmptyArr(element);
    });
  } else if (Object.prototype.toString.call(obj) === '[object String]') {
    newObj = String(obj).trim();
  } else if (Object.prototype.toString.call(obj) === '[object Object]') {
    newObj = {};
    Object.keys(obj || {}).forEach((key) => {
      if (key.indexOf('_') === -1) {
        newObj[key] = omitUndefinedAndEmptyArr(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    });
  } else {
    newObj = obj;
  }
  return newObj;
};

export {
  PageConfig,
  ToolButtons,
  ButtonTypeProps,
  PageType,
  setFuncodes,
  FormConfig,
  FormSearchItem,
  ProColumns,
} from './interface';

export {
  SchemaContext,
  useSchemaContext,
  EditPageContext,
  useEditPageContext,
  ListPageContext,
  useListPageContext,
} from './context';
export default {
  schema,
  cmps,
  regeditCmp,
  omitUndefinedAndEmptyArr,
};
