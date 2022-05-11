import React, { useRef } from 'react';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';
import {
  dataType,
  ItemTypes,
  optionsTyps,
  DropDataType,
  DraggableBodyRowType,
  DraggableBodyCellType,
} from './common';
const DraggableBodyCell = (props: DraggableBodyCellType & { children: any; rowIndex: any }) => {
  let {
    children,
    dataIndex,
    record,
    index,
    rowKey,
    treeDataIndex,
    rowIndex,
    moveRow,
    ...restProps
  } = props;

  const nextRef = useRef<HTMLDivElement>();

  const [{ isNextOver, dropNextClassName }, nextDrop] = useDrop<any, any, any>(
    {
      accept: ItemTypes,

      collect: (monitor: DropTargetMonitor<any, any>) => {
        const {
          // id: dragId,
          // parentId: dragParentId,
          index: dargIndex,
          //isGroup
        } = monitor.getItem() || {};

        if (dargIndex === index) {
          return {};
        }

        //   monitor.getClientOffset()
        // 是否可以拖拽替换
        //let isOver = monitor.isOver();
        let isNextOver = monitor.isOver({ shallow: true });
        return {
          isNextOver,
          dropNextClassName: 'drop-over-downward',
        };
      },
      drop: (item: any, monitor) => {
        let opt: DropDataType = {
          dragId: item.id, // 拖拽id
          dragIndex: item.index,
          dropToGap: false,
          dropId: record[rowKey], // 要放置位置行的id
          dropIndex: index,
        };
        const didDrop = monitor.didDrop();
        let isOver = monitor.isOver({ shallow: true });
        if (isOver) moveRow(opt);
      },
    },
    [],
  );

  //sameDrop(sameRef);
  nextDrop(nextRef);
  const nextClassName = isNextOver ? dropNextClassName : '';
  //const sameClassName = isSameOver ? dropSameClassName : '';

  return (
    <td //@ts-ignore
      {...restProps}
    >
      {dataIndex === treeDataIndex ? (
        <div style={{ display: 'flex' }}>
          <div>{children}</div>
          <div
            className={nextClassName}
            style={{ flex: 1 }}
            //@ts-ignore
            ref={nextRef}
          ></div>
        </div>
      ) : (
        children
      )}
    </td>
  );
};

export default DraggableBodyCell;
