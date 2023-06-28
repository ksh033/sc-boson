import type { FormInstance } from 'antd';
import { Form, Input } from 'antd';
import React from 'react';
import type { ProColumns } from '../typing';

type defaultComponentProps = {
  columnProps: ProColumns<any>;
  name: any;
  record: any;
  autoFocus: boolean;
  text: any;
  form: FormInstance<any>;
};

const defaultComponent = (comprops: defaultComponentProps) => {
  const { columnProps, name, text, record, autoFocus, form } = comprops;
  const formItemProps = {
    ...columnProps?.formItemProps,
  };

  const initVal = text != null ? text : formItemProps?.initialValue;
  const props = columnProps.props || {};

  let customProps = {};
  if (typeof props === 'function') {
    customProps = props(record);
  } else {
    customProps = props;
  }

  const newProps = {
    form,
    name,
    autoFocus,
    rowData: record,
    ...customProps,
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const defaultComponent: any = <Input {...customProps} autoFocus={autoFocus} />;

  let component: any = defaultComponent;
  const isElement = React.isValidElement(columnProps.component);
  if (columnProps.component) {
    if (columnProps.component.customView) {
      component = !isElement
        ? React.createElement(columnProps.component, newProps)
        : React.cloneElement(columnProps.component, newProps);
    } else {
      component = !isElement
        ? React.createElement(columnProps.component, {
          ...customProps,
          autoFocus,
          'data-row': record,
        })
        : React.cloneElement(columnProps.component, {
          ...customProps,
          autoFocus,
          'data-row': record,
        });
    }
  }

  return (
    <Form.Item name={name} {...formItemProps} initialValue={initVal} noStyle preserve={false} isListField={false}>
      {component}
    </Form.Item>
  );

  // return (
  //   <Form.Item shouldUpdate noStyle>
  //     {(form: any) => {
  //       const initVal = text !== undefined && text != null ? text : formItemProps?.initialValue;
  //       const props = _columnProps.props || {};

  //       let customProps = {};
  //       if (typeof props === 'function') {
  //         customProps = props(rowData);
  //       } else {
  //         customProps = props;
  //       }
  //       // const v={};
  //       // v[name.join(".")]=initVal
  //       //   form.setFieldsValue(v)

  //       const newProps = {
  //         form,
  //         name,
  //         autoFocus,
  //         rowData,
  //         ...customProps,
  //       };

  //       // eslint-disable-next-line @typescript-eslint/no-shadow
  //       const defaultComponent: any = <Input {...customProps} autoFocus={autoFocus} />;

  //       let component: any = defaultComponent;
  //       const isElement = React.isValidElement(_columnProps.component);
  //       if (_columnProps.component) {
  //         if (_columnProps.component.customView) {
  //           component = !isElement
  //             ? React.createElement(_columnProps.component, newProps)
  //             : React.cloneElement(_columnProps.component, newProps);
  //         } else {
  //           component = !isElement
  //             ? React.createElement(_columnProps.component, {
  //                 ...customProps,
  //                 autoFocus,
  //                 'data-row': rowData,
  //               })
  //             : React.cloneElement(_columnProps.component, {
  //                 ...customProps,
  //                 autoFocus,
  //                 'data-row': rowData,
  //               });
  //         }
  //       }

  //       return (
  //         <Form.Item
  //           style={{
  //             margin: '-5px 0',
  //           }}
  //           preserve={false}
  //           name={name}
  //           {...formItemProps}
  //           initialValue={initVal}
  //         >
  //           {component}
  //         </Form.Item>
  //       );
  //     }}
  //   </Form.Item>
  // );
};

export { defaultComponent };
