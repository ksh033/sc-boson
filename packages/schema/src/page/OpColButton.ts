import React from "react";
import type { ButtonTypeProps, HButtonType } from "../interface";
import { ToolButtons } from "../interface";
import _ from "lodash";


export  default class OperationColumn{
    private buttons: HButtonType[];

    constructor() {
      
        this.buttons=[];

      }
    addButton<T extends keyof typeof ToolButtons>(button: HButtonType | T  ,extraProps?: ButtonTypeProps){
        if (React.isValidElement(button)) {
            this.buttons.push(button)
        }
        if (_.isString(button)){
           const key: string=button
   
           this.buttons.push({...ToolButtons[key],...extraProps})
        }
        if (_.isObject(button)){
            this.buttons.push({...button,...extraProps})
        }
        return this;
      }
    toButtons(){
        return this.buttons
    }
}