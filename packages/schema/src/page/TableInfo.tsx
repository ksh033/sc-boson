import type { ProColumn, ProColumns, PageConfig, ButtonTypeProps, HButtonType } from '../interface';
import _ from 'lodash';
import { ToolButtons } from '../interface';
import OpColButton from './OpColButton';
import { bindEvents } from '../event/BindEventUtil';
import {ScTable} from '@scboson/sc-element'
import React from 'react';

const {Operation} = ScTable
const OpColKey = '_OperateKey';

export interface TableInfoProps {
  //
  columns: ProColumns;
  toolbar: HButtonType[];
  params: any;
  onLoad: (_data: any) => any;
  saveRef: any;
  size: any;
  scroll: { x: number };
}
export default class TableInfo {
  private tableInfo: TableInfoProps;
  private config: PageConfig;
  private opColButton: OpColButton;
  private opColButtonCmp: any;
  private reload: any;
  constructor(table: TableInfoProps, config: PageConfig,opColButtonCmp: any,reload: () => void) {
    this.tableInfo = table;
    this.config = config;
    this.opColButton = new OpColButton();
    this.tableInfo.toolbar = [];
    this.opColButtonCmp=opColButtonCmp;
    this.reload=reload
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
    let newCol = {};

    newCol = { ...col };
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
      let newCol = {};
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
  addOpCol(col?: ProColumn&{max?: number}) {
    const defaultCol = {
      title: '操作',
      align: 'center',
      dataIndex: OpColKey,
      fixed:'right',
      width:180,
      max:3,
    };
    let newCol = {};
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
    extraProps?: ButtonTypeProps) {
    this.opColButton.addButton(button, extraProps);
    return this;
  }
  toConfig() {
    this.tableInfo.toolbar = bindEvents(this.tableInfo.toolbar, this.config);
    let { colIndex } = this.findCol(OpColKey) || {};
    const opColButtons = this.opColButton.toButtons();
    if (opColButtons.length>0){
      if (!_.isNumber(colIndex)){
        this.addOpCol();
      }
      colIndex=this.findCol(OpColKey)?.colIndex
    }
    if (_.isNumber(colIndex)) {
      const opCol = this.tableInfo.columns[colIndex];
      // @ts-ignore 
      const {max} = opCol
      if (!opCol.render) {
        opCol.render = (value: any, record: any, index: number) => {
          const tbuttons: HButtonType[] = [];
          opColButtons.forEach((button) => {
            if (React.isValidElement(button)) {
              tbuttons.push(button)
            }else{
            const {visible,...restButton}=button
            if (visible !== undefined) {
              if (_.isBoolean(visible)) {
                if (visible === true) {
                  tbuttons.push(restButton);
                }
                
              }
              if (_.isFunction(visible)) {
                const retValue = visible(value, record, index);
                if (_.isBoolean(retValue)) {
                  if (retValue === true) {
                    tbuttons.push(restButton);
                  }
                }
                if (_.isObject(retValue)) {
                  const newButton = _.merge(restButton, retValue);
                  tbuttons.push(newButton);
                }
              }
            } else {
              tbuttons.push(restButton);
            }
          }
          });
          const Cmp=this.opColButtonCmp || Operation;
          const buttons=bindEvents(tbuttons, this.config,this.reload);
     
          return <Cmp buttons={buttons} max={max} record={record}/>
        };
      }
    }
    return this.tableInfo;
  }
}