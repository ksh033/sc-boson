import React, { useRef } from 'react';
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from 'react-dnd';
import { dataType, ItemTypes, optionsTyps, DropDataType, DraggableBodyRowType } from './common';

const DraggableBodyRow = (props: DraggableBodyRowType & { children: any }) => {
  let {
    record,

    treeDataIndex,
    index,
    rowKey,
    className,
    style,
    moveRow,
    // findRow,
    children,
    ...restProps
  } = props;

  if (!record) return null;

  const dargItemData = {
    id: record[rowKey],
    index,
    parentId: record.parentId,
    treeDataIndex: treeDataIndex,
    clientOffset: {},
  };

  const ref = useRef<HTMLDivElement>();
  const dargRef = useRef();
  const [{ handlerId, isOver, dropClassName }, drop] = useDrop(
    {
      accept: ItemTypes,
      hover: (dargObj, monitor) => {},
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
        let isOver = monitor.isOver({ shallow: true });
        return {
          isOver,
          dropClassName: dargIndex < index ? ' drop-over-downward' : ' drop-over-upward',
          handlerId: monitor.getHandlerId(),
        };
      },

      drop: (item: any, monitor) => {
        let opt: DropDataType = {
          dragId: item.id, // 拖拽id
          dragIndex: item.index,
          dropToGap: true,
          dropId: record[rowKey], // 要放置位置行的id
          dropIndex: index,
        };
        const didDrop = monitor.didDrop();
        let isOver = monitor.isOver({ shallow: true });
        //if (monitor.isOver({ shallow: true })) {
        if (isOver) moveRow(opt);
        // }
      },
    },
    [moveRow],
  );

  const [{ isDragging }, drag, d] = useDrag(
    {
      type: ItemTypes,
      item: dargItemData,

      collect: (monitor) => {
        return {
          isDragging: monitor.isDragging(),
        };
      },
    },
    [moveRow],
  );

  drop(drag(ref));
  // 拖拽行的位置显示透明
  const opacity = isDragging ? 0.5 : 1;

  return (
    <tr
      //@ts-ignore
      ref={ref}
      className={`${className}
      ${isOver ? dropClassName : ''} 
      ${isDragging ? 'can-drag' : ''}`}
      style={isDragging ? { cursor: 'move', opacity, ...style } : { ...style }}
      data-handler-id={handlerId}
      {...restProps}
    >
      {children}
    </tr>
  );
};

export default DraggableBodyRow;
