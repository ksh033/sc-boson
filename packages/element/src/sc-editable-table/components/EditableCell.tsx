import { Form, Space } from 'antd';
import React, { memo } from 'react';
import { defaultComponent } from './defaultComponent';
import type { ProColumns } from '../typing';
import type { UseEditableUtilType } from '../useEditableArray';
import { isEditableCell, spellNamePath } from '../utils';
const isNil = (value: any) => value == null;
type EditableCellProps<T> = {
  columnProps: ProColumns<T>;
  record: T;
  index: number;
  editableUtils: UseEditableUtilType;
  readonly: boolean;
  text: any;
};

const EditableCell: React.FC<EditableCellProps<any>> = (props) => {
  const { columnProps, record, index, editableUtils, readonly, text } = props;
  const form = Form.useFormInstance();

  let renderDom: React.ReactNode = <span>{!isNil(text) ? JSON.stringify(text) : null}</span>;
  if (columnProps.render) {
    renderDom = columnProps.render(text, record, index, {
      ...editableUtils,
    });
  }
  console.log('readonly', readonly);

  if (readonly) {
    return <>{renderDom}</>;
  }

  const { isEditable, recordKey } = editableUtils.isEditable({
    ...record,
    index,
  });
  console.log('isEditable', isEditable);
  console.log('recordKey', recordKey);
  const name = spellNamePath(
    recordKey || index,
    columnProps?.key || columnProps?.dataIndex || index,
  );

  const mode =
    isEditable &&
    !isEditableCell(text, record, index, columnProps?.editable, columnProps?.dataIndex)
      ? 'edit'
      : 'read';
  console.log('mode', mode);
  console.log('renderDom', renderDom);
  if (mode === 'edit') {
    if (columnProps.dataIndex === 'options') {
      return (
        <Space size={16}>
          {editableUtils.actionRender(
            {
              ...record,
              index: columnProps.index || index,
            },
            form,
          )}
        </Space>
      );
    }
    console.log('defaultComponent');
    return defaultComponent({
      columnProps,
      name,
      text,
      record,
      autoFocus: false,
      form,
    });
  }
  return <div>{renderDom}</div>;
};

export default memo(EditableCell);
