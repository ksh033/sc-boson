import { Form, Input } from 'antd';
import React from 'react';
import type { ProColumns } from './typing';

const defaultComponent = (_columnProps: ProColumns<any>, name: any, text: any, rowData: any) => {
  const formItemProps = {
    ..._columnProps?.formItemProps,
  };
  return (
    <Form.Item shouldUpdate noStyle>
      {(form: any) => {
        const initVal = text !== undefined && text != null ? text : formItemProps?.initialValue;
        const props = _columnProps.props || {};
        const newProps = {
          form,
          name,
          rowData,
          ...props,
        };
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const defaultComponent: any = <Input></Input>;

        let component: any = defaultComponent;
        const isElement = React.isValidElement(_columnProps.component);
        if (_columnProps.component) {
          if (_columnProps.component.customView) {
            component = !isElement
              ? React.createElement(_columnProps.component, newProps)
              : React.cloneElement(_columnProps.component, newProps);
          } else {
            component = !isElement
              ? React.createElement(_columnProps.component, {...props,"data-row":rowData})
              : React.cloneElement(_columnProps.component, {...props,"data-row":rowData});
          }
        }

        return (
          <Form.Item
            style={{
              margin: '-5px 0',
            }}
            preserve={false}
            name={name}
            {...formItemProps}
            initialValue={initVal}
          >
            {component}
          </Form.Item>
        );
      }}
    </Form.Item>
  );
};

export { defaultComponent };
