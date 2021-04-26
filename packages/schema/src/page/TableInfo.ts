import type { ProColumn, ProColumns,PageConfig,ButtonTypeProps, HButtonType  } from "../interface";
import _ from "lodash";
import  { ToolButtons } from "../interface";
import {bindEvents} from '../event/BindEventUtil'
import React from "react";

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
    private config: PageConfig
    constructor(table: TableInfoProps, config: PageConfig) {
      this.tableInfo = table;
      this.config=config;
      this.tableInfo.toolbar=[];
    }
    private findCol(dataIndex: string): { item: ProColumn; colIndex: number | null } | null {
      let colIndex=null;
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
     *
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
     * @param dataIndex
     * @param col
     * @returns
     */
    changeCol(dataIndex: string, col: ProColumn ) {

      const oldCol = this.findCol(dataIndex);
      if (oldCol) {
        const { item, colIndex } = oldCol;
        let newCol = {};
        if (_.isFunction(col)) {
          newCol = col(item);
        } else {
          newCol = col;
        }
        newCol=_.merge(item,newCol)
        if (colIndex!==null) this.tableInfo.columns[colIndex] = newCol;
      }
  
      return this;
    }
    /**
     * 添加操作列
     */
    addOpCol(col: ProColumn) {
      const defaultCol = {
        title: '操作',
        align: 'right',
        dataIndex: OpColKey,
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
     * @param button 按钮
     * @param extraProps 按钮属性扩展
     * @returns 
     */
    addButton<T extends keyof typeof ToolButtons>(button: HButtonType | T  ,extraProps?: ButtonTypeProps){

      if (React.isValidElement(button)) {
        this.tableInfo.toolbar?.push(button)
      }
      if (_.isString(button)){
         const key: string=button
        this.tableInfo.toolbar?.push({...ToolButtons[key],...extraProps})
      }
      if (_.isObject(button)){
        this.tableInfo.toolbar?.push({...button,...extraProps})
      }
       
      return this;
    }
    toConfig() {
      this.tableInfo.toolbar=bindEvents(this.tableInfo.toolbar,this.config)
      return this.tableInfo;
    }
  }