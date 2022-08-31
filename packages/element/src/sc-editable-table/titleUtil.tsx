import React from 'react';
import { Input, Space } from 'antd';
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
      title: rColumn.title,
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
  if (column.editable) {
    newTitle = (
      <div style={{ padding: '10px 0' }}>
        <div>
          <EditOutlined style={{ marginRight: '8px' }} />
          {newTitle}
        </div>
        <div>
          {column.totalSet ? (
            <a
              style={{ marginLeft: '8px' }}
              onClick={() => {
                handleClick(column, onChange);
              }}
            >
              统一设置
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return <div className="sc-cell-th">{newTitle}</div>;
};

export default TitleSet;
