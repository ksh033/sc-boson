import { ScTable } from '@scboson/sc-element';
import _ from 'lodash';
import React from 'react';
import { bindEvents, operationButtonsBindEvent } from '../event/BindEventUtil';
import type {
  ButtonTypeProps,
  HButtonType,
  PageConfig,
  ProColumn,
  ProColumns,
  ProColumnType,
} from '../interface';
import { ToolButtons } from '../interface';
import OpColButton from './OpColButton';

const { Operation } = ScTable;
const OpColKey = '_OperateKey';

export interface TableInfoProps {
  //
  columns: ProColumns;
  toolbar: HButtonType[];
  params: any;
  saveRef: any;
  size: any;
  scroll: any;
  request?: (params: any) => Promise<any>;
}

const OpRenderCmp: React.FC<any> = (props) => {
  const { tbuttons, config, reload, record, max, cmp: Cmp } = props;

  let buttons: ButtonTypeProps[] = [];
  if (Array.isArray(tbuttons)) {
    buttons = tbuttons.map((item: any) => {
      const newItem = operationButtonsBindEvent(item, config, reload);
      return newItem;
    });
  }
  // bindEvents(tbuttons, config, reload, true);

  return <Cmp buttons={buttons} max={max} record={record} />;
};

export default class TableInfo {
  private tableInfo: TableInfoProps;
  private config: PageConfig;
  private opColButton: OpColButton;
  private opColButtonCmp: any;
  private reload: any;
  constructor(table: TableInfoProps, config: PageConfig, opColButtonCmp: any, reload: () => void) {
    this.tableInfo = table;
    this.config = config;
    this.opColButton = new OpColButton();
    this.tableInfo.toolbar = [];
    this.opColButtonCmp = opColButtonCmp;
    this.reload = reload;
  }
  private findCol(dataIndex: string): { item: ProColumn; colIndex: number | null } | null {
    let colIndex = null;
    const item = this.tableInfo.columns.find((col: any, index: number) => {
      if (col.dataIndex === dataIndex) {
        colIndex = index;
        return true;
      }
      return false;
    });
    if (item) {
      return { item, colIndex };
    }
    return null;
  }
  /**
   * @param col 添加显示列
   * @returns
   */
  addCol(col: ProColumn) {
    const newCol = { ...col };
    this.tableInfo.columns.push(newCol);
    return this;
  }
  /**
   * 修改列信息
   *
   * @param dataIndex
   * @param col
   * @returns
   */
  changeCol(dataIndex: string, col: ProColumn) {
    const oldCol = this.findCol(dataIndex);
    if (oldCol) {
      const { item, colIndex } = oldCol;
      let newCol = null;
      if (_.isFunction(col)) {
        newCol = col(item);
      } else {
        newCol = col;
      }
      newCol = _.merge(item, newCol);

      if (colIndex !== null) this.tableInfo.columns[colIndex] = newCol;
    }

    return this;
  }
  /** 添加操作列 */
  addOpCol(col?: ProColumn & { max?: number }) {
    const defaultCol: ProColumnType<any> & { max?: number } = {
      title: '操作',
      align: 'center',
      dataIndex: OpColKey,
      fixed: 'right',
      // width: 200,
      max: 4,
    };
    let newCol = null;
    const { item, colIndex } = this.findCol(OpColKey) || {};
    if (item && colIndex) {
      newCol = { ...defaultCol, ...item, ...col };
      this.tableInfo.columns[colIndex] = newCol;
    } else {
      newCol = { ...defaultCol, ...col };
      this.tableInfo.columns.push(newCol);
    }
    return this;
  }

  /**
   * 添加按钮
   *
   * @param button 按钮
   * @param extraProps 按钮属性扩展
   * @returns
   */
  addButton<T extends keyof typeof ToolButtons>(
    button: HButtonType | T,
    extraProps?: ButtonTypeProps,
  ) {
    if (React.isValidElement(button)) {
      this.tableInfo.toolbar?.push(button);
      return this;
    }
    if (_.isString(button)) {
      const key: string = button;
      this.tableInfo.toolbar?.push({ ...ToolButtons[key], ...extraProps });
    }
    if (_.isObject(button)) {
      this.tableInfo.toolbar?.push({ ...button, ...extraProps });
    }
    return this;
  }
  addOpColButton<T extends keyof typeof ToolButtons>(
    button: HButtonType | T,
    extraProps?: ButtonTypeProps,
  ) {
    this.opColButton.addButton(button, extraProps);
    return this;
  }
  toConfig() {
    this.tableInfo.toolbar = bindEvents(this.tableInfo.toolbar, this.config, this.reload);
    let { colIndex } = this.findCol(OpColKey) || {};
    const opColButtons = this.opColButton.toButtons();
    if (opColButtons.length > 0) {
      if (!_.isNumber(colIndex)) {
        this.addOpCol();
      }
      colIndex = this.findCol(OpColKey)?.colIndex;
    }
    if (_.isNumber(colIndex)) {
      const opCol: any = this.tableInfo.columns[colIndex];
      // @ts-ignore
      const { max } = opCol;
      if (!opCol.width && opCol.dataIndex === OpColKey) {

        let opColWidth = 0
        for (let i = 0; i < opColButtons.length; i++) {

          if (i < max) {
            const temBtn: any = opColButtons[i];
            const text = temBtn.text || "    "
            opColWidth = opColWidth + (text.length * 14)//字条大小
            if (i !== max - 1) {
              opColWidth += 20 //按间距
            }
          }
        }
        if (opColButtons.length > max) {
          opColWidth = opColWidth + 36
        }
        opCol.width = opColWidth
      }
      if (!opCol.render) {

        opCol.render = (value: any, record: any, index: number) => {
          const tbuttons: HButtonType[] = [];
          opColButtons.forEach((button) => {
            if (React.isValidElement(button)) {
              tbuttons.push(button);
            } else {
              const { visible, ...restButton } = button;
              if (visible !== undefined) {
                if (_.isBoolean(visible)) {
                  if (visible === true) {
                    tbuttons.push(restButton);
                  }
                }
                if (_.isFunction(visible)) {
                  const retValue = visible(value, record, index);
                  if (React.isValidElement(retValue)) {
                    tbuttons.push(retValue);
                  } else if (_.isBoolean(retValue)) {
                    if (retValue === true) {
                      tbuttons.push(restButton);
                    }
                  } else if (_.isObject(retValue)) {
                    const newButton = _.merge(restButton, retValue);
                    tbuttons.push(newButton);
                  }
                }
              } else {
                tbuttons.push(restButton);
              }
            }
          });
          const Cmp = this.opColButtonCmp || Operation;
          const opRenderCmpProps = {
            tbuttons,
            config: this.config,
            reload: this.reload,
            record,
            max,
            cmp: Cmp,
          };
          return <OpRenderCmp {...opRenderCmpProps} />;
        };
      }
    }
    return this.tableInfo;
  }
}
