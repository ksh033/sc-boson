import { Form, Input } from 'antd';
import React from 'react';
import type { ProColumns } from './typing';

const defaultComponent = (_columnProps: ProColumns<any>, name: any, text: any) => {
  const formItemProps = {
    ..._columnProps?.formItemProps,
  };
  return (
    <Form.Item shouldUpdate noStyle>
      {(form: any) => {
        const newProps = {
          form,
          name,
        };
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const defaultComponent: any = Input;

        let component: any = defaultComponent;
        if (_columnProps.component) {
          component =
            typeof _columnProps.component === 'function'
              ? React.createElement(_columnProps.component, newProps)
              : React.cloneElement(_columnProps.component, newProps);
        }
        return (
          <Form.Item
            style={{
              margin: '-5px 0',
            }}
            preserve={false}
            name={name}
            {...formItemProps}
            initialValue={text || formItemProps?.initialValue}
          >
            {component}
          </Form.Item>
        );
      }}
    </Form.Item>
  );
};

export { defaultComponent };
