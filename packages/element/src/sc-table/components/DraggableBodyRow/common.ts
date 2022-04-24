import update from "immutability-helper";

export const ItemTypes = "DraggableBodyRow";
export type DropDataType = {
  dragId: string;
  dragIndex: number;

  dropId: string;
  dropIndex: number
}
export type DraggableBodyRowType = {
  record: any;
  treeTable?: boolean;


  index: number;
  rowKey: string,
  className: string,
  style: any,
  moveRow: (moveData: DropDataType) => void


}

// 操作类型
export const optionsTyps = {
  didDrop: "didDrop", // 拖拽出区域
  hover: "hover",
  drop: "drop" // 放置
};

// 数据类型
export const dataType = {
  group: "group",
  child: "child"
};

export const getParam = (data: any, dragId: any, dropId: any, rowKey: string) => {

  //const dragRowData=findFromData(data,dragId,rowKey)
  //const dropRowData=findFromData(data,dropId,rowKey)
  let dragRow, dropRow;
  let dragIndex, dropIndex;
  let dragParentIndex, dropParentIndex; // 拖拽子节点的父节点索引

  for (let i = 0; i < data.length; i++) {
    // 父节点拖拽
    let parentDom = data[i];
    if (parentDom[rowKey] === dragId) {
      dragRow = parentDom;
      dragIndex = i;
      dragParentIndex = null;
    }

    if (parentDom[rowKey] === dropId) {
      dropRow = parentDom;
      dropIndex = i;
      dropParentIndex = null;
    }

    // 子节点拖拽
    const ele = parentDom.children || [];
    for (let j = 0; j < ele.length; j++) {
      const child = ele[j];

      if (child[rowKey] === dragId) {
        dragRow = child;
        dragIndex = j;
        dragParentIndex = i;
      }

      if (child[rowKey] === dropId) {
        dropRow = child;
        dropIndex = j;
        dropParentIndex = i;
      }
    }
  }

  return {
    dragRow,
    dropRow,
    dragIndex,
    dropIndex,
    dragParentIndex,
    dropParentIndex
  };
};


export const moveRowData = (dataSource: any, moveData: DropDataType, rowKey: string) => {
  let data: any[] = dataSource.rows || dataSource;

  // dargIndex < index ? ' drop-over-downward' : ' drop-over-upward',
  const { dragId, dropId, dragIndex, dropIndex } = moveData;
  //拖动节点
  const dargData = findNodeData(data, dragId, rowKey);
  //放置节点
  const dropData = findNodeData(data, dropId, rowKey);

  //放置父节点数据
  let dropParentData = null;
  //拖动父节点数据
  let dargParntData = null;
  if (dropData?.data.parentId && dropData.data.parentId !== "0") {
    dropParentData = findNodeData(data, dropData.data.parentId, rowKey);
  }
  if (dropData?.data.parentId && dargData?.data.parentId !== "0") {
    dargParntData = findNodeData(data, dargData?.data.parentId, rowKey);
  }

  let updateData;
  if (dargData && dropData) {
    //同级交换
    if (dargData.data.parentId === dropData.data.parentId) {
      if (!dropParentData) {
        const tem1 = update(data, {
          $splice: [
            [dargData.index, 1],
            [dropData.index, 0, dargData.data],
          ],
        })
        data = tem1;
        console.log(data)
      } else {
        const tem2 = update(dropParentData.data, {
          children: {
            $splice: [
              [dargData.index, 1],
              [dropData.index, 0, dargData.data],
            ],
          }
        })
        dropParentData.data.children = tem2.children
      }
    } else {

      //根节点
      if (!dropParentData) {

        //根节点插入数据
        const tem1 = update(data, {
          $splice: [
            //[dragIndex, 1],
            [dropIndex, 0, dargData.data],
          ],
        })
        if (dargParntData) {
          updateData = update(dargParntData.data, {
            children: {
              $splice: [
                [dargData.index, 1],
                //[dropIndex, 0, dargData?.data],
              ],
            }
          })
          dargParntData.data.children = updateData.children
        }

        data = tem1;
      } else {

        if (dropParentData) {
          const tem1 = update(dropParentData.data, {
            children: {
              $splice: [
                [dropData.index, 0, dargData.data],
              ],
            }
          })
          dropParentData.data.children = tem1.children
        }
        if (dargParntData) {
          const tem2 = update(dargParntData?.data, {
            children: {
              $splice: [
                [dargData.index, 1],
              ],
            }
          })
        } else {
          const tem3 = update(data, {
            $splice: [

              [dargData.index, 1],
            ],
          })

          data = tem3
        }

      }

    }
  }

  if (dataSource.rows) {
    dataSource.rows = [...data];
  } else {
    dataSource = [...data];
  }
  
  return dataSource;
}


export const findNodeData = (data: any[], id: any, rowKey: string): { data: any, index: number } | null => {
  for (let i = 0; i < data.length; i++) {

    const item = data[i];
    if (item[rowKey] === id) {

      return { data: item, index: i };
    }
    if (item.children && item.children.length > 0) {
       const tnode=findNodeData(item.children, id, rowKey)
       if (tnode){
         return tnode;
       }
    }


  }
  return null;
};