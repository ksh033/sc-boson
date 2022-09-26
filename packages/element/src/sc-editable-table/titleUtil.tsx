import React from 'react';
import { Input, Space, Button } from 'antd';
import CModal from '../c-modal';
import type { ProColumns } from './typing';
import EditOutlined from '@ant-design/icons/EditOutlined';

const UnifiedSetComponent = (props: { pageProps: any }) => {
  const { pageProps } = props;

  let component: any = pageProps.component || <Input />;
  const { rowData, totalSetRender, ...cprops } = pageProps.props || {};

  const isElement = React.isValidElement(component);
  component = !isElement
    ? React.createElement(component, {
        ...cprops,
      })
    : React.cloneElement(component, {
        ...cprops,
      });

  if (totalSetRender) {
    component = totalSetRender(component, props);
  }

  return (
    <Space style={{ padding: '14px' }}>
      {pageProps.title ? <span>{pageProps.title}:</span> : null}
      {component}
    </Space>
  );
};

const handleClick = (
  rColumn: any,
  onChange: (
    dataIndex: string,
    value: any,
    fn?: (list: any[], dataIndex: string, changeValue: any) => any[],
  ) => void,
) => {
  let ref: any = null;

  const handleChange = (value: any) => {
    if (value.target && value.target.value) {
      ref = value.target.value;
    } else {
      ref = value;
    }
  };

  CModal.show({
    title: '统一设置',
    width: '600px',
    content: UnifiedSetComponent,
    pageProps: {
      component: rColumn.component,
      title: rColumn.title,
      props: {
        onChange: handleChange,
        ...(rColumn.props || {}),
      },
    },
    onOk: () => {
      onChange(rColumn.dataIndex, ref, rColumn.totalSetFormat);
    },
  });
};

const TitleSet = (
  column: ProColumns<any>,
  onChange: (
    dataIndex: string,
    value: any,
    fn?: (list: any[], dataIndex: string, changeValue: any) => any[],
  ) => void,
  readonly: boolean,
) => {
  let newTitle = typeof column.title === 'function' ? column.title({}) : column.title;
  if (column.editable) {
    newTitle = (
      <div style={{ padding: '4px 8px' }}>
        <div>
          {!Boolean(readonly) ? <EditOutlined style={{ marginRight: '8px' }} /> : null}
          {newTitle}
        </div>
        <div>
          {column.totalSet ? (
            <Button
              type="link"
              onClick={() => {
                handleClick(column, onChange);
              }}
            >
              统一设置
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return <div className="sc-cell-th">{newTitle}</div>;
};

export default TitleSet;
