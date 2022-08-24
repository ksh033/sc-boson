// import type { FormInstance } from 'antd';
// import { Form, Space } from 'antd';
// import React, { useRef, memo, useMemo, useEffect } from 'react';
// import Container from './container';
// import { defaultComponent } from './defaultComponent';
// import type { ProColumns } from './typing';
// import { spellNamePath } from './utils';
// // import { getTargetElement } from 'ahooks/es/utils/dom';
// // import { useThrottleFn } from 'ahooks';
// import { useDeepCompareEffectDebounce } from '../_util/useDeepCompareEffect';
// import { useRefFunction } from '../_util/useRefFunction';
// import { useSafeState } from 'ahooks';

// interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
//   editable?: boolean;
//   dataIndex: string;
//   title: any;
//   record: any;
//   index: number;
//   recordKey: string;
//   autoFocus: boolean;
//   columnProps: ProColumns<any>;
//   readonly?: boolean;
//   save?: (recordKey: any) => void;
//   closeSave?: () => void;
//   actionRender: (
//     row: any & {
//       index: number;
//     },
//     form: FormInstance<any>,
//   ) => (JSX.Element | null)[] | React.ReactNode[];
//   children: React.ReactNode;
// }
// let timer: any = null;
// // type TargetElement = HTMLElement | Element | Document | Window;
// // let targetElement: TargetElement | null | undefined = null;
// const EditableCell: React.FC<EditableCellProps> = (props) => {
//   const {
//     dataIndex,
//     title,
//     record,
//     index,
//     children,
//     actionRender,
//     recordKey,
//     columnProps,
//     editable = false,
//     readonly = false,
//     closeSave,
//     save,
//     ...restProps
//   } = props;
//   // console.log(props);
//   // console.log('NeEditTableCell');

//   const form = Form.useFormInstance();
//   const container = Container.useContainer();
//   const tdRef = useRef<HTMLTableDataCellElement>(null);

//   const [editing, setEditing] = useSafeState(false);

//   const name = useMemo(() => {
//     return spellNamePath(recordKey || index, dataIndex || index);
//   }, [dataIndex, index, recordKey]);

//   const startEditable = useRefFunction(() => {
//     // 设置当前的编辑状态
//     container.curretEdit.current = {
//       recordKey,
//       dataIndex,
//     };
//     // 设置聚焦元素
//     container.fouceDataIndexRef.current = container.getDataIndex(dataIndex || '');
//     setEditing(true);
//   });

//   const endEditable = useRefFunction(async () => {
//     container.curretEdit.current = null;
//     //await save?.(recordKey);
//     closeSave?.();
//     setEditing(false);
//   });

//   useDeepCompareEffectDebounce(() => {
//     if (container.initStartRef.current != null) {
//       if (
//         container.initStartRef.current?.recordKey === recordKey &&
//         container.initStartRef.current?.dataIndex === container.getDataIndex(dataIndex || '')
//       ) {
//         startEditable();
//       }
//     }
//   }, [container.initStartRef.current, recordKey, dataIndex]);

//   useDeepCompareEffectDebounce(() => {}, [recordKey]);

//   useEffect(() => {
//     return () => {
//       if (timer) {
//         clearTimeout(timer);
//         timer = null;
//       }
//     };
//   }, []);

//   const toggleEdit = () => {
//     console.log('toggleEdit', 'toggleEdit');
//     if (timer) {
//       timer = null;
//     }
//     const newEditing = !editing;

//     if (dataIndex != null && index >= 0) {
//       container.closePre();
//     }
//     if (newEditing === true) {
//       container.fouceDataIndexRef.current = container.getDataIndex(dataIndex || '');
//       container.curretEdit.current = {
//         recordKey,
//         dataIndex,
//       };
//     }
//     // 延迟防止刷新
//     timer = setTimeout(() => {
//       setEditing(newEditing);
//     }, 1);
//   };

//   if (dataIndex === 'options') {
//     return (
//       <td {...restProps}>
//         <Space size={16}>
//           {actionRender(
//             {
//               ...record,
//               index: index,
//             },
//             form,
//           )}
//         </Space>
//       </td>
//     );
//   }
//   if (readonly || editable === false) {
//     return <td {...restProps}>{children}</td>;
//   }

//   if (editable === true && container.group.current && dataIndex != null) {
//     if (index != null && container.group.current[index] != null) {
//       let dataIndexName: string = '';
//       if (Array.isArray(dataIndex)) {
//         dataIndexName = [...dataIndex].join('-');
//       } else {
//         dataIndexName = String(dataIndex);
//       }
//       const mapIndex = container.editableMap.current[dataIndexName];
//       if (mapIndex != null && container.group.current[index][mapIndex] != null) {
//         container.group.current[index][mapIndex].startEditable = startEditable;
//         container.group.current[index][mapIndex].endEditable = endEditable;
//       }
//     }
//   }

//   const autoFocus = container.getDataIndex(dataIndex || '') === container.fouceDataIndexRef.current;
//   return editing ? (
//     <td {...restProps} ref={tdRef}>
//       {defaultComponent({
//         columnProps,
//         name,
//         text: record[dataIndex],
//         record,
//         autoFocus,
//         form,
//       })}
//     </td>
//   ) : (
//     <td {...restProps} onClick={toggleEdit} style={{ cursor: 'pointer' }}>
//       {children}
//     </td>
//   );
// };

import { useSafeState } from 'ahooks';
import { Form, Space } from 'antd';
import React, { memo, useEffect, useMemo } from 'react';
import Container from '../container';
import { defaultComponent } from './defaultComponent';
import type { ProColumns } from '../typing';
import type { UseEditableUtilType } from '../useEditableArray';
import { spellNamePath } from '../utils';
import type { DataIndex } from 'rc-table/es/interface';
type EditableCellProps<T> = {
  columnProps: ProColumns<T>;
  record: T;
  index: number;
  editableUtils: UseEditableUtilType;
  readonly: boolean;
  dataIndex: DataIndex;
  text: any;
  editable: boolean;
  recordKey: string;
  save?: (recordKey: any) => void;
  closeSave?: () => void;
  onClickEditActive?: (recordKey: any) => void;
};
let timer: any = null;

const EditableCell: React.FC<EditableCellProps<any>> = (props) => {
  const {
    columnProps,
    record,
    index,
    // text,
    readonly,
    dataIndex,
    editable,
    editableUtils,
    recordKey,
    closeSave,
    onClickEditActive,
  } = props;
  const container = Container.useContainer();
  const [editing, setEditing] = useSafeState(false);
  const text = record[container.getDataIndex(dataIndex || '')];
  const name = useMemo(() => {
    return spellNamePath(recordKey || index, dataIndex || index);
  }, [dataIndex, index, recordKey]);

  const startEditable = () => {
    if (timer) {
      timer = null;
    }
    const newDataIndex = container.getDataIndex(dataIndex || '');
    // 设置当前的编辑状态
    container.curretEdit.current = {
      recordKey,
      dataIndex: newDataIndex,
    };
    // 设置聚焦元素
    container.fouceDataIndexRef.current = newDataIndex;
    timer = setTimeout(() => {
      setEditing(true);
    }, 1);
  };

  const endEditable = () => {
    if (timer) {
      timer = null;
    }
    container.curretEdit.current = null;
    //await save?.(recordKey);
    closeSave?.();
    timer = setTimeout(() => {
      setEditing(false);
    }, 1);
  };

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
      const newDataIndex = container.getDataIndex(dataIndex || '');
      container.fouceDataIndexRef.current = newDataIndex;
      container.curretEdit.current = {
        recordKey: recordKey,
        dataIndex: newDataIndex,
      };
    }
    // 延迟防止刷新
    timer = setTimeout(() => {
      onClickEditActive?.(recordKey);
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

  const cellClassName = useMemo(() => {
    return (text != null && text != '') || columnProps.render ? 'sc-cell' : 'sc-empty-cell';
  }, [columnProps.render, text]);

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
    return <div className="sc-cell-cmp-td">{renderDom}</div>;
  }
  if (editable === true && container.group.current && dataIndex != null) {
    let dataIndexName: string = '';
    if (Array.isArray(dataIndex)) {
      dataIndexName = [...dataIndex].join('-');
    } else {
      dataIndexName = String(dataIndex);
    }
    const key = `${dataIndexName}-${recordKey}`;
    const groupMapItem = container.groupRecordKeyMap.current[key];
    if (groupMapItem) {
      const mapIndex = container.editableMap.current[dataIndexName];
      if (mapIndex != null && container.group.current[groupMapItem.fisColIndex][mapIndex] != null) {
        container.group.current[groupMapItem.fisColIndex][mapIndex].startEditable = startEditable;
        container.group.current[groupMapItem.fisColIndex][mapIndex].endEditable = endEditable;
      }
    }
  }

  const autoFocus = container.getDataIndex(dataIndex || '') === container.fouceDataIndexRef.current;

  return editing ? (
    <div className="sc-cell-cmp-td">
      {defaultComponent({
        columnProps,
        name,
        text,
        record,
        autoFocus,
        form,
      })}
    </div>
  ) : (
    <div onClick={toggleEdit} className={cellClassName} key={recordKey}>
      {renderDom}
    </div>
  );
};

export default memo(EditableCell);
