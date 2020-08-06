import React from 'react';
import { Dropdown, Menu, Divider, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
const { useCallback, useState } = React;

export interface ButtonProps {
  text: string; // 按钮名称
  params: any; // 之前按钮的参数
  onClick: (params: any) => void; //事件
  icon?: React.ReactNode | string; // 图标
}
export interface OperationProps {
  max: number;
  record: any;
  buttons: Array<ButtonProps>;
}

const Operation: React.FC<OperationProps> = props => {
  const { max = 3, buttons = [], record } = props;

  const renderChild = useCallback(() => {
    let children: any[] = [];
    let moreButtons: any[] = [];
    let moreButtonsClick: any = {};
    const length = buttons.length;
    buttons.forEach(function(item: ButtonProps, index) {
      const { text, icon, onClick, params, ...props } = item;
      let iconObj = null;
      if (index < max) {
        children.push(
          <Button
            type="link"
            key={index}
            icon={icon}
            {...props}
            onClick={() => {
              onClick({ ...params, record });
            }}
          >
            {text}
          </Button>,
        );
        if (index !== length - 1) {
          children.push(<Divider key={'d_' + index} type="vertical" />);
        }
      } else {
        moreButtonsClick[index] = {
          onClick: () => {
            onClick({ ...params, record });
          },
          params,
          ...props,
        };
        moreButtons.push(
          <Menu.Item key={index} {...props}>
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
