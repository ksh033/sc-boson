import { useUpdateEffect } from 'ahooks';
import { Form, Space } from 'antd';
import React, { useState } from 'react';
import { defaultComponent } from './defaultComponent';
import type { ErrorLineState } from './index';
import type { ProColumns } from './typing';
import type { UseEditableUtilType } from './useEditableArray';
import { isEditableCell, spellNamePath } from './utils';
const isNil = (value: any) => value == null;

type EditableCellProps<T> = {
  columnProps: ProColumns<T>;
  text: any;
  rowData: T;
  index: number;
  editableUtils: UseEditableUtilType;
  readonly: boolean;
  errorLine?: ErrorLineState;
  clickType?: 'row' | 'cell';
  clickEdit: boolean;
};

const EditableCell: React.FC<EditableCellProps<any>> = (props) => {
  const {
    columnProps,
    text,
    rowData,
    index,
    editableUtils,
    readonly,
    errorLine,
    clickType = 'row',
    clickEdit,
  } = props;
  const [editing, setEditing] = useState(false);

  let renderDom = text;
  if (columnProps.render) {
    renderDom = columnProps.render(text, rowData, index, {
      ...editableUtils,
    });
  }

  const { isEditable, recordKey } = editableUtils.isEditable({
    ...rowData,
    index,
  });

  const name = spellNamePath(
    recordKey || index,
    columnProps?.key || columnProps?.dataIndex || index,
  );

  const toggleEdit = () => {
    editableUtils.setCellEditKey(name.join('_'));
    setEditing(!editing);
  };

  useUpdateEffect(() => {
    if (name.join('_') !== editableUtils.cellEditKey && editing && clickType === 'cell') {
      setEditing(false);
    }
  }, [editableUtils.cellEditKey]);

  if (readonly) {
    return <>{renderDom}</>;
  }

  if (
    errorLine?.index === rowData.rowIndex &&
    errorLine?.field === columnProps.dataIndex &&
    !isEditable
  ) {
    if (renderDom && columnProps.dataIndex === 'options' && Array.isArray(renderDom)) {
      renderDom = <Space size={16}>{renderDom}</Space>;
    }
    return (
      <span className="ant-input-affix-wrapper ant-input ant-input-status-error">{renderDom}</span>
    );
  }

  if (clickType === 'row') {
    const mode =
      isEditable &&
      !isEditableCell(text, rowData, index, columnProps?.editable, columnProps?.dataIndex)
        ? 'edit'
        : 'read';

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
      const autoFocus = columnProps?.dataIndex === editableUtils.fouceDataIndex;
      const Cmp = defaultComponent(columnProps, name, text, rowData, autoFocus);
      return Cmp;
    }

    if (clickEdit && columnProps.dataIndex === 'options') {
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
  } else {
    const mode = !isEditableCell(
      text,
      rowData,
      index,
      columnProps?.editable,
      columnProps?.dataIndex,
    )
      ? 'edit'
      : 'read';
    if (mode === 'edit') {
      const autoFocus = columnProps?.dataIndex === editableUtils.fouceDataIndex;

      const Cmp = defaultComponent(columnProps, name, text, rowData, autoFocus);
      return editing ? (
        Cmp
      ) : (
        <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
          {renderDom}
        </div>
      );
    }
  }

  return !isNil(renderDom) ? renderDom : null;
};

export default EditableCell;
