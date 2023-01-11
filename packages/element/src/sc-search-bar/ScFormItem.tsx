import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';
import classnames from 'classnames';
// import $ from 'jquery';
import React, { useEffect, useRef } from 'react';
import type { SearchFormItemProp } from './ScSearchBar';
import { WIDTH_SIZE_ENUM } from './ScSearchBar';
import useKeyPress from './useKeyPress';

const FormItem = Form.Item;

type ScFormItemProps = {
  item: SearchFormItemProp;
  index?: number;
  form: FormInstance;
  lightFilter?: boolean;
  onSubmit?: () => Promise<void>;
};

export function genNonDuplicateID() {
  let str = '';
  str = Math.random().toString(36).substr(3);
  str += Date.now().toString(16).substr(4);
  return str;
}

const ScFormItem: React.FC<ScFormItemProps> = (props) => {
  const { item, form, lightFilter = false, onSubmit } = props;
  const { label, name, component, hasFormItem = true, fieldProps } = item;
  const fieldName = name;

  const randomVal = useRef<string>(genNonDuplicateID());

  useEffect(() => {}, []);
  let input: any;

  function getInput(root: any) {
    if (Array.isArray(root.children) && root.children.length > 0) {
      for (let x = 0; x < root.children.length; x++) {
        if (root.children[x].nodeName === 'INPUT') {
          input = root.children[x];
          return;
        }
        getInput(root.children[x]);
      }
    }
  }

  function gets(root: any) {
    if (root.children.length > 0) {
      for (let x = 0; x < root.children.length; x++) {
        if (root.children[x].attributes.form != null) {
          input = root.children[x];
          return;
        }
        gets(root.children[x]);
      }
    }
  }

  const AntModal = window.document.querySelectorAll(
    `.c-custom-modal .sc-search-bar-item-${randomVal.current}`,
  );
  if (AntModal.length > 0) {
    gets(AntModal[0]);
    if (input == null) {
      getInput(AntModal[0]);
    }
  }

  useKeyPress(
    'enter',
    () => {
      onSubmit?.();
    },
    {
      target: () => {
        return input;
      },
    },
  );

  // const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
  //   if (e.keyCode === 13) {
  //     console.log(1333);
  //     onSubmit?.();
  //   }
  // };

  const rchildren: React.ReactNode[] = [];
  if (Array.isArray(item.children) && item.children.length > 0) {
    item.children.forEach((element: any, idx: number) => {
      rchildren.push(
        <ScFormItem
          item={element}
          index={idx}
          form={form}
          lightFilter={lightFilter}
          onSubmit={onSubmit}
        />,
      );
    });
  }

  const formItemWidth = item.width;
  const newWidth = formItemWidth && !WIDTH_SIZE_ENUM[formItemWidth] ? formItemWidth : undefined;

  const className = classnames(item.props?.className, {
    [`sc-field-${formItemWidth}`]: formItemWidth && WIDTH_SIZE_ENUM[formItemWidth],
  });

  let widthObj = {};
  if (newWidth) {
    widthObj = { width: newWidth };
  }
  let createCmp = null;
  if (component) {
    if (component.props) {
      createCmp = component;
    } else {
      const { defaultValue, ...restProps } = item.props || {};
      if (component.customView) {
        if (fieldProps) {
          restProps.fieldProps = fieldProps;
        }
      }
      // 把form设置进组件中
      restProps.form = form;
      if (rchildren.length > 0) {
        createCmp = React.createElement(
          component,
          {
            // style: { width: '100%' },
            key: `form-item-component-${randomVal.current}`,
            ...restProps,
            className,
            style: { ...item.props?.style, ...widthObj },
          },
          rchildren,
        );
      } else {
        createCmp = React.createElement(component, {
          // style: { width: '100%' },
          key: `form-item-component-${randomVal.current}`,
          ...restProps,
          className,
          style: { ...item.props?.style, ...widthObj },
        });
      }
    }
  }

  const fromConfig: any = { ...fieldProps };
  const formItemClassName = classnames(fieldProps?.className, {
    [`sc-search-bar-item-${randomVal.current}`]: true,
  });
  if (hasFormItem) {
    if (createCmp) {
      return (
        <FormItem
          label={!lightFilter ? label : ''}
          name={fieldName}
          {...fromConfig}
          key={`form-item-${randomVal.current}`}
          className={formItemClassName}
        >
          {createCmp}
        </FormItem>
      );
    }
    return (
      <FormItem
        label={!lightFilter ? label : ''}
        name={fieldName}
        {...fromConfig}
        key={`form-item-${randomVal.current}`}
        className={formItemClassName}
      >
        {rchildren}
      </FormItem>
    );
  }
  return createCmp;
};

export default ScFormItem;
