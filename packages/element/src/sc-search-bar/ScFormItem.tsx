import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';
import classnames from 'classnames';
import useKeyPress from './useKeyPress';
// import $ from 'jquery';
import React, { useEffect } from 'react';
import type { SearchFormItemProp } from './ScSearchBar';
import { WIDTH_SIZE_ENUM } from './ScSearchBar';

const FormItem = Form.Item;

type ScFormItemProps = {
  item: SearchFormItemProp;
  index: number;
  form: FormInstance;
  lightFilter?: boolean;
  onSubmit?: () => Promise<any>;
};

const ScFormItem: React.FC<ScFormItemProps> = (props) => {
  const { item, index, form, lightFilter = false, onSubmit } = props;
  const { label, name, component, hasFormItem = true, fieldProps } = item;
  const fieldName = name;

  // const id = Array.isArray(fieldName) ? fieldName.join('_') : fieldName || '';
  useEffect(() => {}, []);
  let input: any;
  // const Inputs = $(`.ant-modal .sc-field-${index} *[form]`);

  // if (Inputs.length > 0) {
  //   input = Inputs[Inputs.length - 1];
  // }
  // if (input == null) {
  //   const inputList = $(`.ant-modal .sc-field-${index} input`);
  //   if (inputList.length > 0) {
  //     input = inputList[inputList.length - 1];
  //   }
  // }

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

  const AntModal = window.document.querySelectorAll(`.ant-modal .sc-field-${index}`);
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
            key: `form-item-component-${index}`,
            ...restProps,
            className,
            style: { ...item.props?.style, ...widthObj },
          },
          rchildren,
        );
      } else {
        createCmp = React.createElement(component, {
          // style: { width: '100%' },
          key: `form-item-component-${index}`,
          ...restProps,
          className,
          style: { ...item.props?.style, ...widthObj },
        });
      }
    }
  }

  const fromConfig: any = { ...fieldProps };
  const formItemClassName = classnames(fieldProps?.className, {
    [`sc-field-${index}`]: true,
  });
  if (hasFormItem) {
    if (createCmp) {
      return (
        <FormItem
          label={!lightFilter ? label : ''}
          name={fieldName}
          {...fromConfig}
          key={`form-item-${index}`}
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
        key={`form-item-${index}`}
        className={formItemClassName}
      >
        {rchildren}
      </FormItem>
    );
  }
  return createCmp;
};

export default ScFormItem;
