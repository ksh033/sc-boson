import type { CSSProperties } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from 'antd';
import classNames from 'classnames';
import type { SiderProps } from 'antd/es/layout/Sider';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';

import './index.less';
import type { WithFalse } from '../../typings';
import type { BaseMenuProps } from './BaseMenu';
import BaseMenu from './BaseMenu';
import MenuCounter from './Counter';

const { Sider } = Layout;

export const defaultRenderLogo = (logo: React.ReactNode): React.ReactNode => {
  if (typeof logo === 'string') {
    return <img src={logo} alt="logo" />;
  }
  if (typeof logo === 'function') {
    return logo();
  }
  return logo;
};

export type SiderMenuProps = {
  logo?: React.ReactNode;
  siderWidth?: number;
  menuHeaderRender?: WithFalse<
    (logo: React.ReactNode, title: React.ReactNode, props?: SiderMenuProps) => React.ReactNode
  >;
  menuFooterRender?: WithFalse<(props?: SiderMenuProps) => React.ReactNode>;
  menuContentRender?: WithFalse<
    (props: SiderMenuProps, defaultDom: React.ReactNode) => React.ReactNode
  >;
  menuExtraRender?: WithFalse<(props: SiderMenuProps) => React.ReactNode>;
  collapsedButtonRender?: WithFalse<(collapsed?: boolean) => React.ReactNode>;
  breakpoint?: SiderProps['breakpoint'] | false;
  onMenuHeaderClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  hide?: boolean;
  className?: string;
  style?: CSSProperties;
  links?: React.ReactNode[];
  onOpenChange?: (openKeys: WithFalse<string[]>) => void;
  getContainer?: false;
  logoStyle?: CSSProperties;
} & Pick<BaseMenuProps, Exclude<keyof BaseMenuProps, ['onCollapse']>>;

export const defaultRenderCollapsedButton = (collapsed?: boolean) =>
  collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />;

export type PrivateSiderMenuProps = {
  matchMenuKeys: string[];
};

export const defaultRenderLogoAndTitle = (
  props: SiderMenuProps,
  renderKey: string = 'menuHeaderRender',
): React.ReactNode => {
  const { logo, title, layout } = props;
  const renderFunction = props[renderKey || ''];
  if (renderFunction === false) {
    return null;
  }
  const logoDom = defaultRenderLogo(logo);
  const titleDom = <h1>{title}</h1>;

  if (renderFunction) {
    // when collapsed, no render title
    return renderFunction(logoDom, props.collapsed ? null : titleDom, props);
  }

  if (layout === 'mix' && renderKey === 'menuHeaderRender') {
    return null;
  }

  return (
    <a>
      {logoDom}
      {props.collapsed ? null : titleDom}
    </a>
  );
};

const SiderMenu: React.FC<SiderMenuProps & PrivateSiderMenuProps> = (props) => {
  const {
    collapsed,
    fixSiderbar,
    menuFooterRender,
    onCollapse,
    theme,
    siderWidth,
    isMobile,
    onMenuHeaderClick,
    breakpoint = 'lg',
    style,
    layout,
    menuExtraRender = false,
    // collapsedButtonRender = defaultRenderCollapsedButton,
    // links,
    matchMenuKeys,
    menuData = [],
    menuContentRender,
    prefixCls,
    onOpenChange,
    headerHeight,
    logoStyle,
  } = props;
  const baseClassName = `${prefixCls}-sider`;
  const { flatMenuKeys } = MenuCounter.useContainer();
  const siderClassName = `${prefixCls}-sider-layout`;
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // classNames(`${baseClassName}`, {
  //  // [`${baseClassName}-fixed`]: fixSiderbar,
  //   //[`${baseClassName}-layout-${layout}`]: layout && !isMobile,
  //  // [`${baseClassName}-light`]: theme === "light",
  // });
  useEffect(() => {
    let actionItem = null;
    if (matchMenuKeys.length > 0) {
      const key = matchMenuKeys[0];
      actionItem = menuData.find((item) => {
        return item.key === key;
      });
    } else {
      actionItem = menuData && menuData.length > 0 ? menuData[0] : null;
    }
    if (actionItem)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      handleSelect(actionItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const headerDom = defaultRenderLogoAndTitle(props);

  // const extraDom = menuExtraRender && menuExtraRender(props);
  const childMenuData = selectedRow ? selectedRow.children : [];
  const menuDom = menuContentRender !== false && flatMenuKeys && (
    <BaseMenu
      {...props}
      mode="inline"
      handleOpenChange={onOpenChange}
      style={{
        width: '100%',
      }}
      theme="light"
      className={`${baseClassName}-menu`}
      menuData={childMenuData}
    />
  );
  const selectKey = selectedRow ? selectedRow.key : '';
  const itemClassName = useCallback(
    (key: string) => {
      const clazz: string[] = [];
      if (selectKey === key) {
        clazz.push('active');
      }
      // if (hoverRow.key === key && selectKey !== hoverRow.key && show) {
      // clazz.push('hover');
      // }
      return clazz.join(' ');
    },
    [selectedRow],
  );
  const handleSelect = (param: any) => {
    setSelectedRow(param);

    // console.log(param)
    // const { key, defaultPath } = param;
    // const index = menuData.findIndex((item: any) => {
    // return item.key === key;
    // });

    // if (index > -1) {
    // setSelectedRow(menuData[index]);
    // }

    // if (defaultPath) {
    // history.push(defaultPath);
    // const breadcrumbRouters: any[] = getBreadcrumbRoutes(defaultPath);
    // const _defaultSelectedKeys = breadcrumbRouters.slice(1).map(item => item.key);
    // setDefaultSelectedKeys(_defaultSelectedKeys);
    // }
  };
  return (
    <>
      {fixSiderbar && (
        <div
          style={{
            width: collapsed ? 48 : siderWidth,
            //  overflow: "hidden",
            flex: `0 0 ${collapsed ? 48 : siderWidth}px`,
            maxWidth: collapsed ? 48 : siderWidth,
            minWidth: collapsed ? 48 : siderWidth,
            transition: `background-color 0.3s, min-width 0.3s, max-width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)`,
            ...style,
          }}
        />
      )}
      <Sider
        collapsible
        trigger={null}
        collapsed={collapsed}
        breakpoint={breakpoint === false ? undefined : breakpoint}
        onCollapse={(collapse) => {
          if (!isMobile) {
            if (onCollapse) {
              onCollapse(collapse);
            }
          }
        }}
        collapsedWidth={48}
        style={{
          // overflow: "hidden",
          paddingTop: layout === 'mix' && !isMobile ? headerHeight : undefined,
          ...style,
        }}
        width={siderWidth}
        theme={theme}
        className={siderClassName}
      >
        <nav className={`${baseClassName}`}>
          {headerDom && (
            <div
              className={classNames(`${baseClassName}-logo`, {
                [`${baseClassName}-collapsed`]: collapsed,
              })}
              onClick={layout !== 'mix' ? onMenuHeaderClick : undefined}
              id="logo"
              style={logoStyle}
            >
              {headerDom}
            </div>
          )}
          <ul className={`${baseClassName}-nav`}>
            {menuData.map((item: any) => {
              const { icon } = item;
              return (
                <li
                  key={item.key}
                  className={itemClassName(item.key)}
                  onClick={() => {
                    handleSelect(item);
                  }}
                >
                  <a>
                    {icon}
                    <span className={`${baseClassName}-nav-title`}>{item.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {menuContentRender ? menuContentRender(props, menuDom) : menuDom}

        {menuFooterRender && (
          <div
            className={classNames(`${baseClassName}-footer`, {
              [`${baseClassName}-footer-collapsed`]: !collapsed,
            })}
          >
            {menuFooterRender(props)}
          </div>
        )}
      </Sider>
    </>
  );
};

export default SiderMenu;
