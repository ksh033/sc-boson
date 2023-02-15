import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SiderProps } from 'antd/lib/layout/Sider';
import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React from 'react';
import type { AppMenuProps, MenuDataItem, WithFalse } from '../../typings';
import type { BaseMenuProps } from './BaseMenu';
import BaseMenu from './BaseMenu';
import MenuCounter from '@ant-design/pro-layout/es/components/SiderMenu/Counter';
import './index.less';
import type { MenuProps } from 'antd/es/menu';
import getMenuData from '../../utils/getMenuData';
import { useDebounceFn, useHover } from 'ahooks';

const { Sider } = Layout;

export const defaultRenderLogo = (
  logo: React.ReactNode | (() => React.ReactNode),
): React.ReactNode => {
  if (typeof logo === 'string') {
    return <img src={logo} alt="logo" />;
  }
  if (typeof logo === 'function') {
    return logo();
  }
  return logo;
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
  const titleDom = <h1>{title ?? 'Ant Design Pro'}</h1>;

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

export type SiderMenuProps = {
  logo?: React.ReactNode;
  siderWidth?: number;
  appsMenu?: AppMenuProps[];
  appsMenuProps: any,

  /**
   * @name  菜单 logo 和 title 区域的渲染
   *
   * @example 不要logo : menuHeaderRender={(logo,title)=> title}
   * @example 不要title : menuHeaderRender={(logo,title)=> logo}
   * @example 展开的时候显示title,收起显示 logo： menuHeaderRender={(logo,title,props)=> props.collapsed ? logo : title}
   * @example 不要这个区域了 : menuHeaderRender={false}
   */
  menuHeaderRender?: WithFalse<
    (logo: React.ReactNode, title: React.ReactNode, props?: SiderMenuProps) => React.ReactNode
  >;
  /**
   * @name 侧边菜单底部的配置，可以增加一些底部操作
   *
   * @example 底部增加超链接 menuFooterRender={()=><a href="https://pro.ant.design">pro.ant.design</a>}
   * @example 根据收起展开配置不同的 dom  menuFooterRender={()=>collapsed? null :<a href="https://pro.ant.design">pro.ant.design</a>}
   */
  menuFooterRender?: WithFalse<(props?: SiderMenuProps) => React.ReactNode>;

  /**
   * @name  侧边菜单，菜单区域的处理,可以单独处理菜单的dom
   *
   * @example 增加菜单区域的背景颜色 menuContentRender={(props,defaultDom)=><div style={{backgroundColor:"red"}}>{defaultDom}</div>}
   * @example 某些情况下不显示菜单 menuContentRender={(props)=> return <div>不显示菜单</div>}
   */
  menuContentRender?: WithFalse<
    (props: SiderMenuProps, defaultDom: React.ReactNode) => React.ReactNode
  >;
  /**
   * @name 侧边菜单 title 和 logo 下面区域的渲染，一般会增加个搜索框
   *
   * @example  增加一个搜索框 menuExtraRender={()=>(<Search placeholder="请输入" />)}
   * @example  根据收起展开配置不同的 dom： menuExtraRender={()=>collapsed? null : <Search placeholder="请输入" />}
   */
  menuExtraRender?: WithFalse<(props: SiderMenuProps) => React.ReactNode>;
  /**
   * @name 自定义展开收起按钮的渲染
   *
   * @example 使用文字渲染 collapsedButtonRender={(collapsed)=>collapsed?"展开":"收起"})}
   * @example 使用icon渲染 collapsedButtonRender={(collapsed)=>collapsed?<MenuUnfoldOutlined />:<MenuFoldOutlined />}
   * @example 不渲染按钮 collapsedButtonRender={false}
   */
  collapsedButtonRender?: WithFalse<(collapsed?: boolean) => React.ReactNode>;
  /**
   * @name 菜单是否收起的断点，设置成false 可以禁用
   *
   * @example 禁用断点  breakpoint={false}
   * @example 最小的屏幕再收起 breakpoint={"xs"}
   */
  breakpoint?: SiderProps['breakpoint'] | false;

  /**
   * @name 菜单顶部logo 和 title 区域的点击事件
   *
   * @example 点击跳转到首页 onMenuHeaderClick={()=>{ history.push('/') }}
   */
  onMenuHeaderClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * @name 侧边菜单底部的一些快捷链接
   *
   * @example links={[<a href="ant.design"> 访问官网 </a>,<a href="help.ant.design"> 帮助 </a>]}
   */
  links?: React.ReactNode[];
  onOpenChange?: (openKeys: WithFalse<string[]>) => void;
  getContainer?: false;

  /**
   * @name 侧边菜单的logo的样式，可以调整下大小
   *
   * @example 设置logo的大小为 42px logoStyle={{width: '42px', height: '42px'}}
   */
  logoStyle?: CSSProperties;
  hide?: boolean;
  className?: string;
  style?: CSSProperties;
} & Pick<BaseMenuProps, Exclude<keyof BaseMenuProps, ['onCollapse']>>;

export const defaultRenderCollapsedButton = (collapsed?: boolean) =>
  collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />;

export type PrivateSiderMenuProps = {
  matchMenuKeys: string[];
  appSelectedKeys: string[];
  appTitle: string
  appMenuProps: MenuProps;
  overAppMenuDataRender?: (appCode: string) => MenuDataItem[];
  onHover?: (isOver: boolean, menuData: MenuDataItem) => void
};

const SiderMenu: React.FC<SiderMenuProps & PrivateSiderMenuProps> = (props) => {
  const {
    collapsed = false,
    fixSiderbar,
    menuFooterRender,
    onCollapse,
    theme = "light",
    siderWidth,
    isMobile,
    onMenuHeaderClick,
    breakpoint = 'lg',
    style,
    appTitle,
    appMenuProps,
    appSelectedKeys,
    layout,
    appsMenu,
    menuExtraRender = false,
    collapsedButtonRender = defaultRenderCollapsedButton,
    links,
    menuContentRender,
    prefixCls,
    menu,
    onOpenChange,
    formatMessage,
    overAppMenuDataRender,
    headerHeight,
    route,
    logoStyle,
  } = props;


  const baseClassName = `${prefixCls}-sider`;
  const { flatMenuKeys } = MenuCounter.useContainer();
  const siderClassName = classNames(`${baseClassName}`, {
    [`${baseClassName}-fixed`]: fixSiderbar,
    [`${baseClassName}-layout-${layout}`]: layout && !isMobile,
    [`${baseClassName}-light`]: theme !== 'dark',
  });
  const ref = useRef(null);
  const overRef = useRef(false);

  const [overMenu, setOverMenu] = useState<MenuDataItem | null>(null)
  const isHovering = useHover(ref, {
    onLeave: () => {
      setOverMenu(null)
    }
  });
  const collapsedWidth = 92
  const headerDom = defaultRenderLogoAndTitle(props);

  const extraDom = menuExtraRender && menuExtraRender(props);

  const menuDom = menuContentRender !== false && flatMenuKeys && (
    <BaseMenu
      {...props}
      menuProps={{ ...props.menuProps }}
      key="base-menu"
      mode="inline"
      handleOpenChange={onOpenChange}
      style={{
        width: '100%',
      }}
      className={`${baseClassName}-menu`}
    />
  );
  const {
    run,

  } = useDebounceFn(
    (isHover: boolean, menuData: MenuDataItem) => {
      if (isHover) {
        const [key] = appSelectedKeys
        if (menuData.key !== key) {
          overRef.current = isHover
          setOverMenu(menuData)
        } else {
          setOverMenu(null)
        }
      } else {
        if (!isHovering) {
          setOverMenu(null)
        }
        overRef.current = isHover
      }


    },
    {
      wait: 50,
    },
  );
  const overMenuDom = useMemo(() => {


    if (!overMenu) {
      return null
    }

    const menuInfo = getMenuData(route?.routes || [], menu, formatMessage, () => {

      if (overMenu?.key) {
        return overAppMenuDataRender ? overAppMenuDataRender(overMenu.key) : []
      }
      return []

    })

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const menuDom = <BaseMenu
      {...props}
      menuData={menuInfo.menuData}
      menuProps={{
        ...props.menuProps, onSelect: () => {
          if (overMenu) {
            const selectInfo: any = { selectedKeys: [overMenu.key] }
            //appMenuProps.onSelect && appMenuProps.onSelect(selectInfo)
          }

        }
      }}
      key="base-menu"
      mode="inline"
      handleOpenChange={onOpenChange}
      style={{
        width: '100%',
      }}
      className={`${baseClassName}-menu`}
    />
    return menuDom
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(overMenu)])
  const firstMenuDom = (
    <BaseMenu
      {...props}
      selectedKeys={appSelectedKeys}
      theme="dark"
      menuData={appsMenu}
      key="base-menu"
      onHover={run}
      mode="inline"
      menuProps={{ ...appMenuProps, activeKey: overMenu?.key }}
      handleOpenChange={onOpenChange}
      style={{
        width: '100%',
      }}
      className={`${baseClassName}-menu`}
    />
  );

  const menuRenderDom = menuContentRender ? menuContentRender(props, menuDom) : menuDom;

  const linksMenuItems: ItemType[] = (links || []).map((node, index) => ({
    className: `${baseClassName}-link`,
    label: node,
    key: index,
  }));

  if (collapsedButtonRender && !isMobile) {
    linksMenuItems.push({
      className: `${baseClassName}-collapsed-button`,
      //@ts-ignore
      title: false,
      key: 'collapsed',
      onClick: () => {
        if (onCollapse) {
          onCollapse(!collapsed);
        }
      },
      label: collapsedButtonRender(collapsed),
    });
  }
  return (
    <>
      {fixSiderbar && (
        <div
          style={{
            width: collapsed ? collapsedWidth : siderWidth,
            overflow: 'hidden',
            flex: `0 0 ${collapsed ? collapsedWidth : siderWidth}px`,
            maxWidth: collapsed ? collapsedWidth : siderWidth,
            minWidth: collapsed ? collapsedWidth : siderWidth,
            transition: `background-color 0.3s, min-width 0.3s, max-width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)`,
            ...style,
          }}
        />
      )}
      <>
        <Sider
          collapsible
          trigger={null}
          collapsed={false}
          breakpoint={breakpoint === false ? undefined : breakpoint}
          onCollapse={(collapse) => {
            if (isMobile) return;
            onCollapse?.(collapse);
          }}
          collapsedWidth={92}
          style={{
            overflow: 'hidden',
            paddingTop: layout === 'mix' && !isMobile ? headerHeight : undefined,
            ...style,
          }}
          width={92}
          theme={theme}
          className={`${siderClassName} ${baseClassName}-first`}
        >
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
          {extraDom && (
            <div
              className={`${baseClassName}-extra ${!headerDom && `${baseClassName}-extra-no-logo`}`}
            >
              {extraDom}
            </div>
          )}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >

            {firstMenuDom}
          </div>
          <div className={`${baseClassName}-links`}>
            {/* <Menu
            theme={theme}
            inlineIndent={16}
            className={`${baseClassName}-link-menu`}
            selectedKeys={[]}
            openKeys={[]}
            mode="inline"
            items={linksMenuItems}
          /> */}
          </div>
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
        <Sider
          collapsible
          trigger={null}
          collapsed={false}
          breakpoint={breakpoint === false ? undefined : breakpoint}
          onCollapse={(collapse) => {
            if (isMobile) return;
            onCollapse?.(collapse);
          }}
          style={{
            overflow: 'hidden',
            paddingTop: layout === 'mix' && !isMobile ? headerHeight : undefined,
            left: '92px',
            ...style,
          }}
          width={132}
          theme={'light'}
          className={`${siderClassName}  ${baseClassName}-second`}
        >
          {headerDom && (
            <div
              className={`${baseClassName}-sidebar-title`}

            >{appTitle}</div>
          )}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >

            {menuRenderDom}
          </div>
        </Sider>
        <div ref={ref}>{overMenu ? (<Sider
          collapsible
          trigger={null}
          collapsed={false}
          breakpoint={breakpoint === false ? undefined : breakpoint}

          style={{
            overflow: 'hidden',
            zIndex: '101',
            position: 'fixed',
            left: 92,

          }}
          width={132}
          theme={'light'}
          className={`${siderClassName}  ${baseClassName}-second ${baseClassName}-second-fixed`}
        >
          {headerDom && (
            <div
              className={`${baseClassName}-sidebar-title`}

            ><h1>{overMenu.name}</h1></div>
          )}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {overMenuDom}
          </div></Sider>) : null}</div>
      </>
    </>
  );
};

export default SiderMenu;
