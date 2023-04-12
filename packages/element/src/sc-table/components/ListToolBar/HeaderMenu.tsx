/*
 * @Description:
 * @Version: 1.0
 * @Autor: yangyuhang
 * @Date: 2022-11-02 15:36:44
 * @LastEditors: yangyuhang
 * @LastEditTime: 2023-03-15 10:22:00
 */
import React from 'react';
import { Dropdown, Menu, Space, Tabs } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import type { MenuInfo } from 'rc-menu/es/interface';
import type { ListToolBarHeaderMenuProps } from '../../typing';

const HeaderMenu: React.FC<ListToolBarHeaderMenuProps> = (props) => {
  const { items = [], type = 'inline', prefixCls, activeKey: propActiveKey } = props;

  const [activeKey, setActiveKey] = useMergedState<React.Key>(propActiveKey as React.Key, {
    value: propActiveKey,
    onChange: props.onChange,
  });

  if (items.length < 1) {
    return null;
  }

  const activeItem =
    items.find((item) => {
      return item.key === activeKey;
    }) || items[0];

  if (type === 'inline') {
    return (
      <div className={classNames(`${prefixCls}-menu`, `${prefixCls}-inline-menu`)}>
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => {
              setActiveKey(item.key);
            }}
            className={classNames(
              `${prefixCls}-inline-menu-item`,
              activeItem.key === item.key ? `${prefixCls}-inline-menu-item-active` : undefined,
            )}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'tab') {
    return (
      <div className={classNames(`${prefixCls}-menu`)}>
        <Tabs activeKey={activeItem.key as string} onTabClick={(key) => setActiveKey(key)}>
          {items.map(({ label, key, ...rest }) => {
            return <Tabs.TabPane tab={label} key={key} {...rest} />;
          })}
        </Tabs>
      </div>
    );
  }

  const onMenuClick = (item: MenuInfo) => {
    setActiveKey(item.key);
  };

  return (
    <div className={classNames(`${prefixCls}-menu`, `${prefixCls}-dropdownmenu`)}>
      <Dropdown
        trigger={['click']}
        menu={{ items, onClick: onMenuClick, selectedKeys: [activeItem.key as string] }}
        overlay={
          <Menu selectedKeys={[activeItem.key as string]} onClick={onMenuClick}>
            {items.map((item) => (
              <Menu.Item key={item.key} disabled={item.disabled}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <Space className={`${prefixCls}-dropdownmenu-label`}>
          {activeItem.label}
          <DownOutlined />
        </Space>
      </Dropdown>
    </div>
  );
};

export default HeaderMenu;
