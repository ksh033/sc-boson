import { useSafeState } from 'ahooks';
import { Form, Space } from 'antd';
import React, { memo, useEffect, useMemo } from 'react';
import { useRefFunction } from '../_util/useRefFunction';
import Container from './container';
import { defaultComponent } from './defaultComponent';
import type { ProColumns } from './typing';
import type { UseEditableUtilType } from './useEditableArray';
import { spellNamePath } from './utils';

type EditableCellProps<T> = {
  columnProps: ProColumns<T>;
  record: T;
  index: number;
  editableUtils: UseEditableUtilType;
  readonly: boolean;
  dataIndex: string;
  text: any;
  editable: boolean;
  recordKey: string;
  save?: (recordKey: any) => void;
  closeSave?: () => void;
};
let timer: any = null;

const EditableCell: React.FC<EditableCellProps<any>> = (props) => {
  const {
    columnProps,
    record,
    index,
    text,
    readonly,
    dataIndex,
    editable,
    editableUtils,
    recordKey,
    closeSave,
  } = props;

  const container = Container.useContainer();
  const [editing, setEditing] = useSafeState(false);
  // const text = record[dataIndex];
  console.log('EditableCell');
  const name = useMemo(() => {
    return spellNamePath(recordKey || index, dataIndex || index);
  }, [dataIndex, index, recordKey]);

  const startEditable = useRefFunction(() => {
    // 设置当前的编辑状态
    container.curretEdit.current = {
      recordKey,
      dataIndex,
    };
    // 设置聚焦元素
    container.fouceDataIndexRef.current = container.getDataIndex(dataIndex || '');
    setEditing(true);
  });

  const endEditable = useRefFunction(async () => {
    container.curretEdit.current = null;
    //await save?.(recordKey);
    closeSave?.();
    setEditing(false);
  });

  let renderDom = text;
  if (columnProps.render) {
    renderDom = columnProps.render(text, record, index, {
      ...editableUtils,
    });
  }
  const toggleEdit = () => {
    if (timer) {
      timer = null;
    }
    const newEditing = !editing;

    if (dataIndex != null && index >= 0) {
      container.closePre();
    }
    if (newEditing === true) {
      container.fouceDataIndexRef.current = container.getDataIndex(dataIndex || '');
      container.curretEdit.current = {
        recordKey,
        dataIndex,
      };
    }
    // 延迟防止刷新
    timer = setTimeout(() => {
      setEditing(newEditing);
    }, 1);
  };

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
  }, []);

  const form = Form.useFormInstance();

  if (dataIndex === 'options') {
    return (
      <Space size={16}>
        {editableUtils.actionRender(
          {
            ...record,
            index: index,
          },
          form,
        )}
      </Space>
    );
  }

  if (readonly) {
    return <>{renderDom}</>;
  }
  if (editable === true && container.group.current && dataIndex != null) {
    if (index != null && container.group.current[index] != null) {
      let dataIndexName: string = '';
      if (Array.isArray(dataIndex)) {
        dataIndexName = [...dataIndex].join('-');
      } else {
        dataIndexName = String(dataIndex);
      }
      const mapIndex = container.editableMap.current[dataIndexName];
      if (mapIndex != null && container.group.current[index][mapIndex] != null) {
        container.group.current[index][mapIndex].startEditable = startEditable;
        container.group.current[index][mapIndex].endEditable = endEditable;
      }
    }
  }

  const autoFocus = container.getDataIndex(dataIndex || '') === container.fouceDataIndexRef.current;
  return editing ? (
    <>{defaultComponent(columnProps, name, record[dataIndex], record, autoFocus)}</>
  ) : (
    <div
      onClick={toggleEdit}
      style={{
        cursor: 'pointer',
        position: 'absolute',
        top: 1,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {text}
    </div>
  );
};

export default memo(EditableCell);
