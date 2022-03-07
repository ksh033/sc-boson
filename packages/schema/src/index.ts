import { cmps, regeditCmp } from './register';
import schema from './pageConfigUitls';

export { ListPage } from './page/ListPage';
export { EditPage } from './page/EditPage';

export {
  PageConfig,
  ToolButtons,
  ButtonTypeProps,
  PageType,
  setFuncodes,
  FormConfig,
  FormSearchItem,
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
};
