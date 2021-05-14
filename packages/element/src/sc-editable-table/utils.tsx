import React from 'react';
import { Form, Space } from 'antd';
import type { ProColumns, ProTableEditableFnType } from './typing';
import type { UseEditableUtilType } from './useEditableArray';
import { defaultComponent } from './defaultComponent';

/** 转化列的定义 */
type ColumnRenderInterface<T> = {
  columnProps: ProColumns<T>;
  text: any;
  rowData: T;
  index: number;
  editableUtils: UseEditableUtilType;
};
const isNil = (value: any) => value === null || value === undefined;

/** 判断可不可编辑 */
function isEditableCell<T>(
  text: any,
  rowData: T,
  index: number,
  editable?: ProTableEditableFnType<T> | boolean,
) {
  if (typeof editable === 'boolean') {
    return editable === false;
  }
  return editable?.(text, rowData, index) === false;
}

/**
 * 拼接用于编辑的 key
 *
 * @param base 基本的 key
 * @param dataIndex 需要拼接的key
 */
export const spellNamePath = (
  base: React.Key,
  dataIndex: React.Key | React.Key[] | any,
): React.Key[] | React.Key | undefined => {
  if (Array.isArray(dataIndex)) {
    return [base, ...dataIndex];
  }
  return [base, dataIndex];
};
/**
 * 这个组件负责单元格的具体渲染
 *
 * @param param0
 */
export function columnRender<T>({
  columnProps,
  text,
  rowData,
  index,
  editableUtils,
}: ColumnRenderInterface<T>): any {
  const { isEditable, recordKey } = editableUtils.isEditable({
    ...rowData,
    index,
  });

  const mode =
    isEditable && !isEditableCell(text, rowData, index, columnProps?.editable) ? 'edit' : 'read';

  const name = spellNamePath(
    recordKey || index,
    columnProps?.key || columnProps?.dataIndex || index,
  );

  const textDom = defaultComponent(columnProps, name, text, {
    ...rowData,
    index: columnProps.index || index,
  });

  const dom: React.ReactNode = mode === 'edit' ? textDom : <React.Fragment>{text}</React.Fragment>;

  /** 如果是编辑模式，并且 renderFormItem 存在直接走 renderFormItem */
  if (mode === 'edit') {
    if (columnProps.dataIndex === 'options') {
      return (
        <Form.Item shouldUpdate noStyle>
          {(form: any) => (
            <Space size={16}>
              {editableUtils.actionRender(
                {
                  ...rowData,
                  index: columnProps.index || index,
                },
                form,
              )}
            </Space>
          )}
        </Form.Item>
      );
    }
    return dom;
  }

  if (columnProps.render) {
    const renderDom = columnProps.render(dom, rowData, index, {
      ...editableUtils,
    });

    if (renderDom && columnProps.dataIndex === 'options' && Array.isArray(renderDom)) {
      return <Space size={16}>{renderDom}</Space>;
    }
    return renderDom as React.ReactNode;
  }
  return !isNil(dom) ? dom : null;
}

export function removeDeletedData(
  records: any[],
  childrenColumnName: string,
  containsDeletedData: boolean,
) {
  const list: any[] = [];
  records.forEach((record) => {
    if (containsDeletedData) {
      // children 取在前面方便拼的时候按照反顺序放回去
      list.push(record);
    } else if (!containsDeletedData && record.updated !== -1) {
      // children 取在前面方便拼的时候按照反顺序放回去
      const newValue = record;
      if (record && typeof record === 'object' && childrenColumnName in record) {
        newValue[childrenColumnName] = removeDeletedData(
          record[childrenColumnName] || [],
          childrenColumnName,
          containsDeletedData,
        );
      }
      list.push(record);
    }
  });
  return list;
}
