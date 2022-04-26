import * as React from 'react';
import { Button, Dropdown, Checkbox } from 'antd';
//@ts-ignore
import { Resizable } from 'react-resizable';
import { DndProvider, useDrag, useDrop } from "react-dnd";

import {HTML5Backend} from 'react-dnd-html5-backend';
import type { ScTableProps } from '../sc-table';
import ScTable from '../sc-table';
import { DownOutlined } from '@ant-design/icons';
import ReactDOM from 'react-dom';
import interopDefault from '../_util/interopDefault';
import { getOffset } from '../_util/domUtils';
import _ from 'lodash';

export interface ScAdvancedTableProps<T> extends ScTableProps<T> {
  data?: any;
  showColumnsControl?: boolean;
  columnsResizable?: boolean;
  canRowMove?: boolean;
  onMoveRow?: any;
  customToolbar?: any;
  showOrderNumber?: boolean;
}
export interface ScAdvancedTableState {
  data?: any;
  columns: any[];
  initColumns: any[];
  initResize: boolean;
  showColumnsSelect: boolean;
}
export interface BodyRowProps {
  isOver: any;
  connectDragSource: any;
  connectDropTarget: any;
  moveRow: any;
  dragRow: any;
  clientOffset: any;
  sourceClientOffset: any;
  initialClientOffset: any;
  style: any;
  className: any;
  index: any;
}

const CheckboxGroup = Checkbox.Group;
function dragDirection(
  dragIndex: any,
  hoverIndex: any,
  initialClientOffset: any,
  clientOffset: any,
  sourceClientOffset: any,
) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
  return '';
}


const type = 'DraggableBodyRow';

const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }:any) => {
  const ref = React.useRef();
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor:any) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item:any) => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor:any) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};

const ResizeableTitle = (props: any) => {
  const { onResize, onResizeStop, onResizeStart, width, ...restProps } = props;

  if (!width || width === 'auto') {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={parseInt(width)}
      axis={'x'}
      height={0}
      onResizeStop={onResizeStop}
      onResizeStart={onResizeStart}
      onResize={onResize}
    >
      <th {...restProps} />
    </Resizable>
  );
};

function isSameColumn(a: any | null, b: any | null) {
  if (a && b && a.key && a.key === b.key) {
    return true;
  }
  return (
    a === b ||
    _.isEqualWith(a, b, (value: any, other: any) => {
      // https://github.com/ant-design/ant-design/issues/12737
      if (typeof value === 'function' && typeof other === 'function') {
        return value === other || value.toString() === other.toString();
      }
      // https://github.com/ant-design/ant-design/issues/19398
      if (Array.isArray(value) && Array.isArray(other)) {
        return value === other || _.isEqual(value, other);
      }
      return false;
    })
  );
}

// const ScAdvancedTable: React.FC<T extends ScAdvancedTableProps> = (props) =>{
//   const  {
//     data = null,
//     showColumnsControl = false,
//     columnsResizable = false,
//     canRowMove = false,
//     customToolbar = null,
//     showOrderNumber =  false
//   } = props;

// }

export default class ScAdvancedTable<T> extends React.PureComponent<
  ScAdvancedTableProps<T>,
  ScAdvancedTableState
> {
  static defaultProps = {
    rowKey: 'key',
    showColumnsControl: false,
    columnsResizable: false,
    canRowMove: false,
    customToolbar: null,
    showOrderNumber: false,
  };
  doms: any;
  tableDom!: HTMLDivElement;
  resizeProxy!: HTMLDivElement;
  emptyDom: any;
  rightTable: any;
  leftTable: any;
  centerTable: any;
  saveRef = (name: any) => (node: any) => {
    this.doms[name] = node;
  };
  constructor(props: any) {
    super(props);
    let { columns, showOrderNumber } = props;
    this.doms = {};
    if (showOrderNumber) {
      columns = [
        {
          title: '序号',
          dataIndex: 'orderNumber',
          key: 'orderNumber',
          width: 80,
        },
        ...columns,
      ];
    }
    this.state = {
      columns,
      initResize: false,
      initColumns: [...columns],
      showColumnsSelect: false,
    };
  }
  static getDerivedStateFromProps(props: any, prevState: any) {
    const { prevProps, ...restState } = prevState;

    const newState: any = { prevProps: props, ...restState };
    if (prevProps) {
      let sourceData;
      let targetData;
      if (props.columns.length > prevProps.columns.length) {
        sourceData = props.columns;
        targetData = prevProps.columns;
      } else {
        sourceData = prevProps.columns;
        targetData = props.columns;
      }
      const difCol = _.differenceWith(sourceData, targetData, isSameColumn);
      if (difCol.length > 0) {
        newState.columns = props.columns;
        newState.initColumns = [...props.columns];
      }
    }

    return newState;
  }
  handleResize = () => (e: any) => {
    const offset = getOffset(this.tableDom);
    if (this.resizeProxy) {
      this.resizeProxy.style.display = 'inline';
      this.resizeProxy.style.zIndex = '999';
      this.resizeProxy.style.top = '0px';
      this.resizeProxy.style.left = `${e.pageX - offset.left}px`;
    }
  };
  handleStartResize = () => (e: MouseEvent) => {
    const offset = getOffset(this.tableDom);
    if (this.resizeProxy) {
      this.resizeProxy.style.display = 'inline';
      this.resizeProxy.style.zIndex = '999';
      this.resizeProxy.style.top = '0px';
      this.resizeProxy.style.left = `${e.pageX - offset.left}px`;
    }
  };
  handleStopResize = (index: any) => (e: any, obj: any) => {
    e.preventDefault();
    const { size } = obj;
    if (this.resizeProxy) {
      this.resizeProxy.style.display = 'none';
    }
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { columns: nextColumns };
    });
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize.bind(this));
  }
  resize() {
    const _that = this;

    if (_that.centerTable) {
      const ctable = _that.centerTable.querySelector('.ant-table-body');
      let { columns, initResize } = _that.state;
      let widthAll = 0;
      columns.map((col: any) => {
        if (initResize) {
          if (col.minWidth) {
            widthAll += parseInt(col.minWidth);
          }
        } else if (col.width) {
          widthAll += parseInt(col.width);
        }
      });
      const isScroll = widthAll > ctable.clientWidth;

      columns = columns.map((col: any) => ({
        ...col,

        width: isScroll ? (col.minWidth ? col.minWidth : col.width) : col.auto ? 'auto' : col.width,
        minWidth: initResize ? col.minWidth : col.width,
      }));
      _that.setState({ columns, initResize: true });
    }
  }
  componentDidMount() {
    const p = document.createElement('div');
    p.className = 'sc-advanced-table-resize-proxy';
    this.resizeProxy = p;
    this.tableDom = interopDefault(ReactDOM).findDOMNode(this.doms.tableNode);
    if (this.tableDom) {
      const loadDom = this.tableDom.querySelector('.ant-spin-nested-loading');
      if (loadDom) {
        loadDom.appendChild(p);
      } else {
        this.tableDom.appendChild(p);
      }

      this.emptyDom = this.tableDom.querySelector('.ant-table-placeholder');
      this.rightTable = this.tableDom.querySelector('.ant-table-fixed-right');
      this.leftTable = this.tableDom.querySelector('.ant-table-fixed-left');
      this.centerTable = this.tableDom.querySelector('.ant-table-scroll');
      this.resize();
      window.addEventListener('resize', this.resize.bind(this));
    }
  }

  render() {
    const {
      showColumnsControl,
      columnsResizable,
      onMoveRow,
      canRowMove,
      customToolbar,
      showOrderNumber,
      ...resProps
    } = this.props;
    let { initColumns, columns, showColumnsSelect } = this.state;
    let otherProps = {};
    let components = {};

    // 显示、隐藏列的选项
    const columnsSelect = initColumns.map((item: any) => {
      const { title, dataIndex } = item;
      return {
        label: title,
        value: dataIndex,
        defaultChecked: true,
      };
    });
    // 显示、隐藏列的工具按钮
    const toolColumnsSelect = showColumnsControl ? (
      <Dropdown
        overlay={
          <div className={'sc-advanced-table-toolbar-show-columns'}>
            <CheckboxGroup
              options={columnsSelect}
              defaultValue={columnsSelect.map((item: any) => item.value)}
              onChange={(selectItems) => {
                const newColumns = initColumns.filter((item: any) => {
                  const canFind = selectItems.findIndex(
                    (inneritem: any) => inneritem === item.dataIndex,
                  );
                  return canFind !== -1;
                });
                this.setState({
                  columns: newColumns,
                });
              }}
            />
          </div>
        }
        trigger={['click']}
        visible={showColumnsSelect}
        onVisibleChange={(e) => {
          this.setState({
            showColumnsSelect: !!e,
          });
        }}
      >
        <Button>
          显示/隐藏列 <DownOutlined />
        </Button>
      </Dropdown>
    ) : null;

    // 列宽可拖动
    if (columnsResizable) {
      columns = this.state.columns.map((col, index) => {
        return {
          ...col,
          onHeaderCell: (column: any) => {
            return {
              width: column.width,
              onResize: this.handleResize(),
              onResizeStart: this.handleStartResize(),
              onResizeStop: this.handleStopResize(index),
            };
          },
        };
      });

      components = {
        ...components,
        header: {
          cell: ResizeableTitle,
        },
      };

      otherProps = {
        ...otherProps,
        components,
        bordered: true,
      };
    }

    // 行拖拽改变顺序
    const moveRow = (dragIndex: any, hoverIndex: any) => {
      if (onMoveRow) {
        onMoveRow(dragIndex, hoverIndex);
      }
      /* const { data } = this.state;
            const dragRow = data[dragIndex];
        
            this.setState(
              update(this.state, {
                data: {
                  $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
                },
              }),
            ); */
    };
    if (canRowMove) {
      components = {
        ...components,
        body: {
          row: DraggableBodyRow,
        },
      };
      otherProps = {
        ...otherProps,
        components,
        onRow: (record: any, index: any) => ({
          index,
          moveRow,
          record,
        }),
      };
    }

    return (
      <div>
        {!toolColumnsSelect && !customToolbar ? null : (
          <div className={'sc-advanced-table-toolbar'}>
            <div className={'sc-advanced-table-part'}>{toolColumnsSelect}</div>
            <div className={'sc-advanced-table-part'}>{customToolbar}</div>
          </div>
        )}
       
        <DndProvider backend={HTML5Backend}>
          <ScTable
            saveRef={this.saveRef('tableNode')}
            {...resProps}
            {...otherProps}
            columns={columns}
          ></ScTable>
        </DndProvider>
      </div>
    );
  }
}
