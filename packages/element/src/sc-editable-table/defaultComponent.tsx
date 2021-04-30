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
        const initVal = text || formItemProps?.initialValue;
        const newProps = {
          form,
          name,
          rowData,
        };
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const defaultComponent: any = <Input></Input>;

        let component: any = defaultComponent;
        if (_columnProps.component) {
          if (_columnProps.component.customView) {
            component =
              typeof _columnProps.component === 'function'
                ? React.createElement(_columnProps.component, newProps)
                : React.cloneElement(_columnProps.component, newProps);
          } else {
            component =
              typeof _columnProps.component === 'function'
                ? React.createElement(_columnProps.component)
                : React.cloneElement(_columnProps.component);
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
