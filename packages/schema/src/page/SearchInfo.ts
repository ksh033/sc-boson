import React from 'react';
import type { FormSearchItem, PageConfig } from '../interface';
import schema from '../pageConfigUitls';
import type {
  ButtonTypeProps,
  HButtonType,
} from '../interface';
import _ from 'lodash';
import { ToolButtons } from '../interface';
import { bindEvents } from '../event/BindEventUtil';

export interface SearchInfoProps {
  queryList: FormSearchItem[];
  form: any;
  onSubmit: (_params: any) => void;
  onReset: (_params: any) => void;
  initialValues: any;
  toolbar: HButtonType[];
}
class SearchInfo {
  searchInfo: SearchInfoProps;
  private config: PageConfig;
  constructor(searchInfo: SearchInfoProps, config: PageConfig) {
    this.searchInfo = searchInfo;
    this.config = config;
    this.searchInfo.toolbar = [];
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
    if (searchItem) return { searchItem, itemIndex };
    return null;
  }

  /**
   * 添加查询项
   *
   * @param formItem 表单项
   * @param group 分组
   * @returns
   */
  addSearchItem(formItem: FormSearchItem | (() => FormSearchItem)) {
    let newFormItem: FormSearchItem = {};
    if (_.isFunction(formItem)) {
      newFormItem = { ...formItem() };
    } else {
      newFormItem = { ...formItem };
    }
    const { component } = newFormItem;
    if (_.isString(component)) {
      const newComponent = schema.getCmp(component);
      newFormItem.component = newComponent;
    }

    this.searchInfo.queryList.push(newFormItem);

    return this;
  }
  /**
   * 添加按钮
   *
   * @param button 按钮
   * @param extraProps 按钮属性扩展
   * @returns
   */
  addButton<T extends keyof typeof ToolButtons>(
    button: HButtonType | T,
    extraProps?: ButtonTypeProps,
  ) {
    if (React.isValidElement(button)) {
      this.searchInfo.toolbar?.push(button);
      return this;
    }
    if (_.isString(button)) {
      const key: string = button;
      this.searchInfo.toolbar?.push({ ...ToolButtons[key], ...extraProps });
    }
    if (_.isObject(button)) {
      this.searchInfo.toolbar?.push({ ...button, ...extraProps });
    }
    return this;
  }
  /**
   * 修改查询项
   *
   * @param dataIndex
   * @param col
   * @returns
   */
  changeSearchItem(
    name: string,
    item: FormSearchItem | ((col?: FormSearchItem) => FormSearchItem),
  ) {
    const oldCol = this.findItem(name);
    if (oldCol) {
      const { searchItem, itemIndex } = oldCol;
      let newFormItem = {};
      if (_.isFunction(item)) {
        newFormItem = item();
      } else {
        newFormItem = item;
      }

      newFormItem = _.merge(searchItem, newFormItem);

      if (itemIndex !== null) this.searchInfo.queryList[itemIndex] = newFormItem;
    }
    return this;
  }
  removeSearchItem(name: string) {
    const revalue = this.findItem(name);
    if (revalue) {
      const { itemIndex } = revalue;
      if (itemIndex !== null) {
        this.searchInfo.queryList.splice(itemIndex, 1);
      }
    }
    return this;
  }

  toConfig() {
    this.searchInfo.toolbar = bindEvents(this.searchInfo.toolbar, this.config);
    return this.searchInfo;
  }
}
export default SearchInfo;
