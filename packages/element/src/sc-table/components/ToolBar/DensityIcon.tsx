import { useIntl } from '@ant-design/pro-provider';
import React from 'react';
import { ColumnHeightOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Tooltip } from 'antd';
import type { MenuInfo } from 'rc-menu/es/interface';
import Container from '../../container';

export type DensitySize = 'middle' | 'small' | 'large' | undefined;

const DensityIcon = () => {
  const counter = Container.useContainer();
  const intl = useIntl();

  const items = [
    {
      key: 'large',
      label: intl.getMessage('tableToolBar.densityLarger', '默认'),
    },
    {
      key: 'middle',
      label: intl.getMessage('tableToolBar.densityMiddle', '中等'),
    },
    {
      key: 'small',
      label: intl.getMessage('tableToolBar.densitySmall', '紧凑'),
    },
  ];
  const onMenuClick = ({ key }: MenuInfo) => {
    if (counter.setTableSize) {
      counter.setTableSize(key as DensitySize);
    }
  };

  return (
    <Dropdown
      menu={{
        items,
        onClick: onMenuClick,
        selectedKeys: [counter.tableSize as string],
        style: { width: 80 },
      }}
      overlay={
        <Menu
          selectedKeys={[counter.tableSize as string]}
          onClick={onMenuClick}
          style={{
            width: 80,
          }}
        >
          <Menu.Item key="large">{intl.getMessage('tableToolBar.densityLarger', '默认')}</Menu.Item>
          <Menu.Item key="middle">
            {intl.getMessage('tableToolBar.densityMiddle', '中等')}
          </Menu.Item>
          <Menu.Item key="small">{intl.getMessage('tableToolBar.densitySmall', '紧凑')}</Menu.Item>
        </Menu>
      }
      trigger={['click']}
    >
      <Tooltip title={intl.getMessage('tableToolBar.density', '表格密度')}>
        <ColumnHeightOutlined />
      </Tooltip>
    </Dropdown>
  );
};

export default React.memo(DensityIcon);
