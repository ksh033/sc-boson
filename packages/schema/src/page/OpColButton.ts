import _ from 'lodash';
import React from 'react';
import type { ButtonTypeProps, HButtonType } from '../interface';
import { ToolButtons } from '../interface';

export default class OperationColumn {
  private buttons: HButtonType[];

  constructor() {
    this.buttons = [];
  }
  addButton<T extends keyof typeof ToolButtons>(
    button: HButtonType | T,
    extraProps?: ButtonTypeProps,
  ) {
    if (React.isValidElement(button)) {
      this.buttons.push(button);
    } else if (_.isString(button)) {
      const key = button;

      this.buttons.push({ ...ToolButtons[key], ...extraProps });
    } else if (_.isObject(button)) {
      this.buttons.push({ ...button, ...extraProps });
    }
    return this;
  }
  toButtons() {
    return this.buttons;
  }
}
