import React from 'react';
import { Space, Input } from 'antd';
import CModal from '../c-modal';
import type { ProColumns } from './typing';

const UnifiedSetComponent = (props: { pageProps: any }) => {
  const { pageProps } = props;

  let component: any = pageProps.component || <Input />;
  const { rowData, ...cprops } = pageProps.props || {};

  const isElement = React.isValidElement(component);
  component = !isElement
    ? React.createElement(component, {
        ...cprops,
      })
    : React.cloneElement(component, {
        ...cprops,
      });

  return <div style={{ padding: '14px' }}>{component}</div>;
};

const handleClick = (rColumn: any, onChange: (dataIndex: string, value: any) => void) => {
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
      props: {
        onChange: handleChange,
        ...(rColumn.props || {}),
      },
    },
    onOk: () => {
      onChange(rColumn.dataIndex, ref);
    },
  });
};

const TitleSet = (column: ProColumns<any>, onChange: (dataIndex: string, value: any) => void) => {
  let newTitle = typeof column.title === 'function' ? column.title({}) : column.title;
  if (column.totalSet) {
    newTitle = (
      <Space direction="vertical">
        <span>{newTitle}</span>
        <a
          onClick={() => {
            handleClick(column, onChange);
          }}
        >
          统一设置
        </a>
      </Space>
    );
  }
  return newTitle;
};

export default TitleSet;
