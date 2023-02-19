import type { FormConfig, Field, FieldGroup } from '../interface';
import type { FormInstance } from 'antd';
import _ from 'lodash';

export interface FormInfoProps {
  form: React.MutableRefObject<FormInstance | undefined> | ((actionRef: FormInstance) => void);
  formConfig: FormConfig[];
  initialValues: any;
}

class FormInfo {
  formInfo: FormInfoProps;

  constructor(formInfo: FormInfoProps) {
    this.formInfo = formInfo;
  }
  private findFormItem(
    filedName: string,
  ): { formItem: Field; fieldSetIndex: number; itemIndex: number; groupIndex: number } | null {
    let formItem = null;
    this.formInfo.formConfig.find((formConfig, i) => {
      const { items } = formConfig;
      let fieldSetIndex = null;
      let itemIndex;
      let groupIndex;
      let findItem;

      items.find((item: Field, j: any) => {
        if (item.items && item.items.length > 0) {
          // @ts-ignore
          const groupItem: FieldGroup = item;
          groupItem.items.find((gi: any, giIndex: any) => {
            const { id, name } = gi;
            let temName = name;
            if (_.isArray(name)) {
              temName = name.join('.');
            }
            if (filedName === temName || filedName === id) {
              itemIndex = giIndex;
              findItem = gi;
              groupIndex = j;
              return true;
            }
            return false;
          });
        } else {
          // @ts-ignore
          const fitem: FormItem = item;
          const { id, name } = fitem;
          let temName = name;
          if (_.isArray(name)) {
            temName = name.join('.');
          }
          if (filedName === temName || filedName === id) {
            itemIndex = j;
            findItem = item;

            return true;
          }
        }

        return false;
      });

      if (findItem) {
        fieldSetIndex = i;
        formItem = {
          formItem: findItem,
          fieldSetIndex,
          groupIndex,
          itemIndex,
        };
        return true;
      }
      return false;
    });
    return formItem;
  }
  private findFieldSet(fieldset?: string) {
    if (!fieldset) {
      return 0;
    }
    return this.formInfo.formConfig.findIndex((formConfig) => {
      return fieldset === formConfig.fieldset;
    });
  }
  /**
   * 添加表单项
   *
   * @param formItem 表单项
   * @param fieldset 兼容group
   * @returns
   */
  addFormItem(formItem: Field | (() => Field), fieldset?: string) {
    let newFormItem = {};
    if (_.isFunction(formItem)) {
      newFormItem = { ...formItem() };
    } else {
      newFormItem = { ...formItem };
    }
    const fieldSetIndex = this.findFieldSet(fieldset);
    if (this.formInfo.formConfig[fieldSetIndex]) {
      this.formInfo.formConfig[fieldSetIndex].items.push(newFormItem);
    }
    return this;
  }
  /**
   * 修改列信息
   *
   * @param name
   * @param col
   * @returns
   */
  changeFormItem(name: string, item: Field | ((formItem: Field) => Field)) {
    const oldCol = this.findFormItem(name);
    if (oldCol) {
      const { formItem, fieldSetIndex, itemIndex, groupIndex } = oldCol;
      let newFormItem: any = {};
      if (_.isFunction(item)) {
        newFormItem = item(formItem);
      } else {
        newFormItem = item;
      }
      const { component, ...restnewFormItem } = newFormItem;
      newFormItem = _.merge(formItem, restnewFormItem);

      if (component) {
        newFormItem.component = component;
      }
      // newFormItem = _.{ ...formItem, ...newFormItem };
      if (groupIndex >= 0) {
        if (itemIndex >= 0)
          this.formInfo.formConfig[fieldSetIndex].items[groupIndex].items[itemIndex] = newFormItem;
      } else if (itemIndex >= 0)
        this.formInfo.formConfig[fieldSetIndex].items[itemIndex] = newFormItem;
    }
    return this;
  }
  removeFormItem(name: string) {
    const oldCol = this.findFormItem(name);
    if (oldCol) {
      const { fieldSetIndex, itemIndex } = oldCol;
      this.formInfo.formConfig[fieldSetIndex].items.splice(itemIndex, 1);
    }
    return this;
  }
  /**
   * @param filedSet 兼容group
   * @returns
   */
  removeGroup(filedSet: string) {
    if (filedSet) {
      const fieldSetIndex = this.findFieldSet(filedSet);
      this.formInfo.formConfig.splice(fieldSetIndex, 1);
    }
    return this;
  }

  toConfig() {
    return this.formInfo;
  }
}
export default FormInfo;
