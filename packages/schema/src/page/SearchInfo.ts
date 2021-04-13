import type {  FormSearchItem } from '../interface';
import schema from '../pageConfigUitls';

import _ from 'lodash';

export interface SearchInfoProps {
  queryList: FormSearchItem[];
  form: any;
  onSubmit: (_params: any) => void;
  initialValues: any;
}
class SearchInfo {
  searchInfo: SearchInfoProps;

  constructor(searchInfo: SearchInfoProps) {
    this.searchInfo = searchInfo;
  }
  private findItem(filedName: string): { searchItem: any; itemIndex: number | null } | null {
    let searchItem = null;
    let itemIndex = null;
    searchItem = this.searchInfo.queryList.find((item, i) => {
      const { id, name } = item;
      if (filedName === name || filedName === id) {
        itemIndex = i;
        return true;
      }
      return false;
    });
    if (searchItem)
    return { searchItem, itemIndex };
    return null;
  }

  /**
   * 添加查询项
   * @param formItem  表单项
   * @param group  分组
   * @returns
   */
  addSearchItem(formItem: FormSearchItem | (() => FormSearchItem)) {
    let newFormItem: FormSearchItem = {};
    if (_.isFunction(formItem)) {
      newFormItem = { ...formItem() };
    } else {
      newFormItem = { ...formItem };
    }
    const {component}=newFormItem
    if (_.isString(component)){
      const newComponent=schema.getCmp(component)
      newFormItem.component=newComponent;
    }
 
     this.searchInfo.queryList.push(newFormItem);

    return this;
  }
  /**
   * 修改查询项
   * @param dataIndex
   * @param col
   * @returns
   */
  changeSearchItem(name: string, item: FormSearchItem | ((col?: FormSearchItem) => FormSearchItem)) {
    const oldCol = this.findItem(name);
    if (oldCol) {
      const { searchItem,  itemIndex } = oldCol;
      let newFormItem = {};
      if (_.isFunction(item)) {
        newFormItem = item();
      } else {
        newFormItem = item;
      }
      newFormItem = { ...searchItem, ...newFormItem };
      if (itemIndex!==null) this.searchInfo.queryList[itemIndex] = newFormItem;
    }
    return this;
  }
  removeSearchItem(name: string) {
    const revalue = this.findItem(name);
    if (revalue) {
      const {  itemIndex } = revalue;
      if (itemIndex!==null){
        this.searchInfo.queryList.splice(itemIndex, 1);
      }
    }
    return this;
  }


  toConfig() {
    return this.searchInfo;
  }
}
export default SearchInfo;
