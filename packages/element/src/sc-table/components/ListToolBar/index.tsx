import React, { useContext } from 'react';
import { Tooltip, Space, Input, ConfigProvider, Tabs } from 'antd';
import { useIntl } from '@ant-design/pro-provider';
import classNames from 'classnames';
import { LabelIconTip } from '@ant-design/pro-utils';
import HeaderMenu from './HeaderMenu';
import type { ListToolBarProps, ListToolBarSetting, SearchPropType, SettingPropType } from '../../typing';
import type { SearchProps } from 'antd/lib/input/Search';

/**
 * 获取配置区域 DOM Item
 *
 * @param setting 配置项
 */
function getSettingItem(setting: SettingPropType) {
  if (React.isValidElement(setting)) {
    return setting;
  }
  if (setting) {
    const settingConfig: ListToolBarSetting = setting as ListToolBarSetting;
    const { icon, tooltip, onClick, key } = settingConfig;
    if (icon && tooltip) {
      return (
        <Tooltip title={tooltip}>
          <span
            key={key}
            onClick={() => {
              if (onClick) {
                onClick(key);
              }
            }}
          >
            {icon}
          </span>
        </Tooltip>
      );
    }
    return icon;
  }
  return null;
}

const ListToolBar: React.FC<ListToolBarProps> = ({
  prefixCls: customizePrefixCls,
  title,
  subTitle,
  tooltip,
  className,
  style,
  search,
  onSearch,
  multipleLine = false,
  filter,
  actions = [],
  settings = [],
  tabs = {},
  menu,
}) => {
  const intl = useIntl();

  /**
   * 获取搜索栏 DOM
   *
   * @param search 搜索框相关配置
   */
  const getSearchInput = (searchObject: SearchPropType) => {
    if (!searchObject) {
      return null;
    }
    if (React.isValidElement(searchObject)) {
      return searchObject;
    }
    return (
      <Input.Search
        style={{ width: 200 }}
        placeholder={intl.getMessage('tableForm.inputPlaceholder', '请输入')}
        onSearch={onSearch}
        {...(searchObject as SearchProps)}
      />
    );
  };

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('sc-table-list-toolbar', customizePrefixCls);

  /** 根据配置自动生成的查询框 */
  const searchNode: React.ReactNode = getSearchInput(search);
  /** 轻量筛选组件 */
  const filtersNode = filter ? <div className={`${prefixCls}-filter`}>{filter}</div> : null;

  /** 有没有 title，判断了多个场景 */
  const hasTitle = menu || title || subTitle || tooltip;
  /** 没有 key 的时候帮忙加一下 key 不加的话很烦人 */
  const renderActionsDom = () => {
    if (!Array.isArray(actions)) {
      return actions;
    }
    if (actions.length < 1) {
      return null;
    }
    return (
      <Space align="center">
        {actions.map((action, index) => {
          if (!React.isValidElement(action)) {
            // eslint-disable-next-line react/no-array-index-key
            return <React.Fragment key={index}>{action}</React.Fragment>;
          }
          return React.cloneElement(action, {
            // eslint-disable-next-line react/no-array-index-key
            key: index,
            ...action?.props,
          });
        })}
      </Space>
    );
  };

  const actionDom = renderActionsDom();

  if (!actionDom && !searchNode && !hasTitle) {
    return null;
  }
  return (
    <div style={style} className={classNames(`${prefixCls}`, className)}>
      <div className={`${prefixCls}-container`}>
        <div className={`${prefixCls}-left`}>
          {tooltip || title || subTitle ? (
            <div className={`${prefixCls}-title`}>
              <LabelIconTip tooltip={tooltip} label={title} subTitle={subTitle} />
            </div>
          ) : null}
          {menu && <HeaderMenu {...menu} prefixCls={prefixCls} />}
          {!hasTitle && searchNode && <div className={`${prefixCls}-search`}>{searchNode}</div>}
        </div>
        <Space className={`${prefixCls}-right`} size={16}>
          {hasTitle && searchNode ? (
            <div className={`${prefixCls}-search`}>{searchNode}</div>
          ) : null}
          {!multipleLine ? filtersNode : null}
          {actionDom}
          {settings?.length ? (
            <Space size={12} align="center" className={`${prefixCls}-setting-items`}>
              {settings.map((setting, index) => {
                const settingItem = getSettingItem(setting);
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index} className={`${prefixCls}-setting-item`}>
                    {settingItem}
                  </div>
                );
              })}
            </Space>
          ) : null}
        </Space>
      </div>
      {multipleLine ? (
        <div className={`${prefixCls}-extra-line`}>
          {tabs.items && tabs.items.length ? (
            <Tabs onChange={tabs.onChange} tabBarExtraContent={filtersNode}>
              {tabs.items.map((tab) => (
                <Tabs.TabPane {...tab} />
              ))}
            </Tabs>
          ) : (
            filtersNode
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ListToolBar;
