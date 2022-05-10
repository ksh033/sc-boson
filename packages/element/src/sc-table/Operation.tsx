/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Dropdown, Menu, Divider, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { useCallback } = React;

export interface ButtonProps {
  text: string; // 按钮名称
  loading?: boolean;
  params: any; // 之前按钮的参数
  onClick: (params: any, e?: any) => void; // 事件
  icon?: React.ReactNode | string; // 图标
}
export interface OperationProps {
  max: number;
  record: any;
  buttons: ButtonProps[];
}

const Operation: React.FC<OperationProps> = (props) => {
  const { max = 4, buttons = [], record } = props;

  const renderChild = useCallback(() => {
    const children: any[] = [];
    const moreButtons: any[] = [];
    const moreButtonsClick: any = {};
    const { length } = buttons;
    buttons.forEach((item: ButtonProps, index: number) => {
      const { text, icon, onClick, params, ...buttonProps } = item;
      const iconObj = null;
      if (index < max) {
        children.push(
          <Button
            type="link"
            key={index}
            icon={icon}
            {...buttonProps}
            onClick={(e: any) => {
              onClick({ ...params, record }, e);
            }}
          >
            {text}
          </Button>,
        );
        if (index !== length - 1) {
          // eslint-disable-next-line react/no-array-index-key
          children.push(<Divider key={`d_${index}`} type="vertical" />);
        }
      } else {
        delete buttonProps.loading;
        moreButtonsClick[index] = {
          onClick: (e: any) => {
            onClick({ ...params, record }, e);
          },
          params,
          ...buttonProps,
        };
        moreButtons.push(
          // eslint-disable-next-line react/no-array-index-key
          <Menu.Item key={index} {...buttonProps}>
            {iconObj}
            {text}
          </Menu.Item>,
        );
      }
    });
    const dropDownClick = ({ key }: any) => {
      if (moreButtonsClick[key]) {
        moreButtonsClick[key].onClick && moreButtonsClick[key].onClick();
      }
    };
    if (moreButtons.length > 0) {
      const menu = <Menu onClick={dropDownClick}>{moreButtons}</Menu>;
      children.push(
        <Dropdown key={'moreBtn'} overlay={menu}>
          <Button type="link">
            更多
            <DownOutlined />
          </Button>
        </Dropdown>,
      );
    }

    return children;
  }, [buttons, max]);

  return (
    <div className={'sc-table-operation'} style={{ display: 'inline-block' }}>
      {renderChild()}
    </div>
  );
};

export default React.memo(Operation);
