/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */

import type { CSSProperties } from 'react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Layout, ConfigProvider } from 'antd';
import type { BreadcrumbProps as AntdBreadcrumbProps, BreadcrumbProps } from 'antd/lib/breadcrumb';
import classNames from 'classnames';
import warning from 'warning';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { stringify } from 'use-json-comparison';
import useAntdMediaQuery from 'use-media-antd-query';
import { useDeepCompareEffect, useDocumentTitle, isBrowser } from '@ant-design/pro-utils';
import Omit from 'omit.js';
import { getMatchMenu } from '../utils/getMatchMenu';
import {UnorderedListOutlined} from '@ant-design/icons'

import type { HeaderViewProps } from './Header';
import Header from './Header';
import type { MenuDataItem, MessageDescriptor, Route, RouterTypes, WithFalse } from '../typings';
import type { GetPageTitleProps } from '../getPageTitle';
import { getPageTitleInfo } from '../getPageTitle';
import type { ProSettings } from '../defaultSettings';
import defaultSettings from '../defaultSettings';
import type { LocaleType } from '@ant-design/pro-layout/es/locales';
import getLocales from '@ant-design/pro-layout/es/locales';
import type { BaseMenuProps } from '../components/SiderMenu/BaseMenu';
import { DefaultFooter as Footer } from '@ant-design/pro-layout';
import { RouteContext } from '@ant-design/pro-layout';
import SiderMenu from '@ant-design/pro-layout/es/components/SiderMenu';
import type { SiderMenuProps } from '@ant-design/pro-layout/es/components/SiderMenu/SiderMenu';
import { getBreadcrumbProps } from '../utils/getBreadcrumbProps';
import getMenuData from '../utils/getMenuData';
import PageLoading from '../components/PageLoading';
import MenuCounter from '@ant-design/pro-layout/es/components/SiderMenu/Counter';
import WrapContent from '../WrapContent';
import compatibleLayout from '../utils/compatibleLayout';
import useCurrentMenuLayoutProps from '../utils/useCurrentMenuLayoutProps';
import { clearMenuItem } from '../utils/utils';
import type { WaterMarkProps } from '@ant-design/pro-layout/es/components/WaterMark';
import type { AppMenuProps } from './Header';
import './index.less';

export type AppProps = Omit<AppMenuProps, 'component'>;

const findAppCode = (pathname: string, appMenu?: AppMenuProps[]) => {
  const keys = pathname.replace('//', '/').split('/');

  if (keys.length > 1) {
    const appCode = keys[1];
    if (appMenu) {
      const index = appMenu.findIndex(({ code }) => code === appCode);
      if (index > -1) {
        return [appCode];
      }
    }
  }

  return null;
};

export type MasterLayoutProps = Partial<RouterTypes<Route>> &
  SiderMenuProps &
  {setCurrentMenu?: (currentMenu: any) => void; }
  &
  HeaderViewProps & {
    pure?: boolean;
    /** @name logo url */
    logo?: React.ReactNode | WithFalse<() => React.ReactNode>;

    /** @name 页面切换的时候触发 */
    onPageChange?: (location?: RouterTypes<Route>['location'],currentMenu?: any) => void;

    loading?: boolean;

    locale?: LocaleType;

    onCollapse?: (collapsed: boolean) => void;

    footerRender?: WithFalse<
      (props: HeaderViewProps, defaultDom: React.ReactNode) => React.ReactNode
    >;

    breadcrumbRender?: WithFalse<
      (routers: AntdBreadcrumbProps['routes']) => AntdBreadcrumbProps['routes']
    >;

    menuItemRender?: BaseMenuProps['menuItemRender'];
    pageTitleRender?: WithFalse<
      (
        props: GetPageTitleProps,
        defaultPageTitle?: string,
        info?: {
          // 页面标题
          title: string;
          // locale 的 title
          id: string;
          // 页面标题不带默认的 title
          pageName: string;
        },
      ) => string
    >;
    menuDataRender?: (menuData: MenuDataItem[]) => MenuDataItem[];
    itemRender?: AntdBreadcrumbProps['itemRender'];

    formatMessage?: (message: MessageDescriptor) => string;
    /** 是否禁用移动端模式，有的管理系统不需要移动端模式，此属性设置为true即可 */
    disableMobile?: boolean;
    contentStyle?: CSSProperties;
    isChildrenLayout?: boolean;

    className?: string;

    /** 兼用 content的 margin */
    disableContentMargin?: boolean;

    /** PageHeader 的 BreadcrumbProps 配置，会透传下去 */
    breadcrumbProps?: BreadcrumbProps;
    /** @name 水印的相关配置 */
    waterMarkProps?: WaterMarkProps;
    apps: AppProps[];
    appMenuProps: any;
  };

const headerRender = (
  props: MasterLayoutProps & {
    hasSiderMenu: boolean;
    selectedKeys: any;
    menuProps: any;
  },
  matchMenuKeys: string[],
): React.ReactNode => {
  if (props.headerRender === false || props.pure) {
    return null;
  }

  return <Header matchMenuKeys={matchMenuKeys} {...props} />;
};

const footerRender = (props: MasterLayoutProps): React.ReactNode => {
  if (props.footerRender === false || props.pure) {
    return null;
  }
  if (props.footerRender) {
    return props.footerRender({ ...props }, <Footer />);
  }
  return null;
};

const renderSiderMenu = (
  props: any,
  matchMenuKeys: string[],
  appSelectKeys: any[],
): React.ReactNode => {
  const { layout, isMobile, openKeys, splitMenus, menuRender, apps } = props;
  if (props.menuRender === false || props.pure) {
    return null;
  }
  let { menuData } = props;

  let appTitle: any=null;
  if (appSelectKeys&&appSelectKeys.length>0){
    const appItem=apps.find((item: any)=>{
        return item.code===appSelectKeys[0]
    })
    if (appItem){
      appTitle=<h1>{appItem.name}</h1>
    }
  }
  /** 如果是分割菜单模式，需要专门实现一下 */
  if (splitMenus && openKeys !== false && !isMobile) {
    const [key] = matchMenuKeys;
    if (key) {
      menuData = props.menuData?.find((item: any) => item.key === key)?.children || [];
    } else {
      menuData = [];
    }
  }
  // 这里走了可以少一次循环
  const clearMenuData = clearMenuItem(menuData || []);
  if (clearMenuData && clearMenuData?.length < 1 && splitMenus) {
    return null;
  }
  if (layout === 'top' && !isMobile) {
    return <SiderMenu matchMenuKeys={matchMenuKeys} {...props} hide />;
  }
  if (menuRender) {
    const defaultDom = (
      <SiderMenu
        matchMenuKeys={matchMenuKeys}
        {...props}
        // 这里走了可以少一次循环
        menuData={clearMenuData}
      />
    );
    return menuRender(props, defaultDom);
  }

  return (
    <SiderMenu
      matchMenuKeys={matchMenuKeys}
      menuHeaderRender={(logo,title,sideProps: any) => {
        const {collapsed}=sideProps
        return <a>{collapsed?<UnorderedListOutlined style={{ fontSize: '24px',color:'#C1C6C8'}} />:appTitle}</a>;
      }}
      {...props}
      theme="dark"
      // 这里走了可以少一次循环
      menuData={clearMenuData}
    />
  );
};

const defaultPageTitleRender = (
  pageProps: GetPageTitleProps,
  props: MasterLayoutProps,
): {
  title: string;
  id: string;
  pageName: string;
} => {
  const { pageTitleRender } = props;
  const pageTitleInfo = getPageTitleInfo(pageProps);
  if (pageTitleRender === false) {
    return {
      title: props.title || '',
      id: '',
      pageName: '',
    };
  }
  if (pageTitleRender) {
    const title = pageTitleRender(pageProps, pageTitleInfo.title, pageTitleInfo);
    if (typeof title === 'string') {
      return {
        ...pageTitleInfo,
        title,
      };
    }
    warning(
      typeof title === 'string',
      'pro-layout: renderPageTitle return value should be a string',
    );
  }
  return pageTitleInfo;
};

export type BasicLayoutContext = { [K in 'location']: MasterLayoutProps[K] } & {
  breadcrumb: Record<string, MenuDataItem>;
};

const getPaddingLeft = (
  hasLeftPadding: boolean,
  collapsed: boolean | undefined,
  siderWidth: number,
): number | undefined => {
  if (hasLeftPadding) {
    return collapsed ? 48 : siderWidth;
  }
  return 0;
};

const getAppMenus = (apps?: AppProps[]): AppMenuProps[] => {
  if (apps) {
    return apps.map((app) => ({ ...app, key: app.code }));
  }
  return [];
};
/**
 * 🌃 Powerful and easy to use beautiful layout 🏄‍ Support multiple topics and layout types
 *
 * @param props
 */
const MaterLayout: React.FC<MasterLayoutProps> = (props) => {
  const {
    children,
    onCollapse: propsOnCollapse,
    location = { pathname: '/' },
    contentStyle,
    route,
    defaultCollapsed,
    style,
    disableContentMargin,
    setCurrentMenu,
    siderWidth = 208,
    menu,
    isChildrenLayout: propsIsChildrenLayout,
    menuDataRender,
    loading,
    apps,
    appSelectedKeys,
    appMenuProps,
  } = props;
  const context = useContext(ConfigProvider.ConfigContext);
  const prefixCls = props.prefixCls ?? context.getPrefixCls('pro');
  const appMenuData = getAppMenus(apps);
  const formatMessage = ({
    id,
    defaultMessage,
    ...restParams
  }: {
    id: string;
    defaultMessage?: string;
  }): string => {
    if (props.formatMessage) {
      return props.formatMessage({
        id,
        defaultMessage,
        ...restParams,
      });
    }
    const locales = getLocales();
    return locales[id] ? locales[id] : (defaultMessage as string);
  };

  const [menuInfoData, setMenuInfoData] = useMergedState<{
    breadcrumb?: Record<string, MenuDataItem>;
    breadcrumbMap?: Map<string, MenuDataItem>;
    menuData?: MenuDataItem[];
  }>(() => getMenuData(route?.routes || [], menu, formatMessage, menuDataRender));

  const { breadcrumb = {}, breadcrumbMap, menuData = [] } = menuInfoData;

  const matchMenus = useMemo(() => getMatchMenu(location.pathname || '/', menuData, true,true), [
    location.pathname,
    menuInfoData,
  ]);

  const matchMenuKeys = useMemo(
    () => {

      return Array.from(new Set(matchMenus.map((item) => item.key || item.path || '')))
    },
    [matchMenus],
  );
  // 当前选中的menu，一般不会为空
  const currentMenu =useMemo(()=>{
       const menuItem=(matchMenus[matchMenus.length - 1] || {}) as ProSettings & MenuDataItem;
       setCurrentMenu&&setCurrentMenu(menuItem)
       return menuItem
  },[matchMenus])

  const currentMenuLayoutProps = useCurrentMenuLayoutProps(currentMenu);

  const { fixSiderbar, navTheme, layout: defaultPropsLayout, ...rest } = {
    ...props,
    ...currentMenuLayoutProps,
  };

  const propsLayout = compatibleLayout(defaultPropsLayout);

  const colSize = useAntdMediaQuery();

  const isMobile = (colSize === 'sm' || colSize === 'xs') && !props.disableMobile;

  /** 如果 menuRender 不存在，可以做一下性能优化 只要 routers 没有更新就不需要重新计算 */
  useDeepCompareEffect(() => {
    if (menu?.loading) {
      return () => null;
    }
    const infoData = getMenuData(route?.routes || [], menu, formatMessage, menuDataRender);
    // 稍微慢一点 render，不然会造成性能问题，看起来像是菜单的卡顿
    const animationFrameId = requestAnimationFrame(() => {
      setMenuInfoData(infoData);
    });
    return () => window.cancelAnimationFrame && window.cancelAnimationFrame(animationFrameId);
  }, [props.route, stringify(menu), props.location?.pathname]);

  // If it is a fix menu, calculate padding
  // don't need padding in phone mode
  const hasLeftPadding = propsLayout !== 'top' && !isMobile;

  const [collapsed, onCollapse] = useMergedState<boolean>(() => defaultCollapsed || false, {
    value: props.collapsed,
    onChange: propsOnCollapse,
  });

  // Splicing parameters, adding menuData and formatMessage in props
  const defaultProps = Omit(
    {
      prefixCls,
      ...props,
      siderWidth,
      ...currentMenuLayoutProps,
      formatMessage,
      breadcrumb,
      layout: propsLayout as 'side',
    },
    ['className', 'style', 'breadcrumbRender'],
  );

  // gen page title
  const pageTitleInfo = defaultPageTitleRender(
    {
      pathname: location.pathname,
      ...defaultProps,
      breadcrumbMap,
    },
    props,
  );

  // gen breadcrumbProps, parameter for pageHeader
  const breadcrumbProps = getBreadcrumbProps({
    ...defaultProps,
    breadcrumbRender: props.breadcrumbRender,
    breadcrumbMap,
  });

  const [appSelectedKey, setAppSelectedKey] = useState(null);
  const appkey = findAppCode(location.pathname, appMenuData);
  const appSelected = appSelectedKey || appkey || appSelectedKeys;

  // render sider dom
  const siderMenuDom = renderSiderMenu(
    {
      ...defaultProps,
      menuData,
      onCollapse,
      isMobile,
      theme: (navTheme || 'dark').toLocaleLowerCase().includes('dark') ? 'dark' : 'light',
      collapsed,
      appSelected,
    },
    matchMenuKeys,
    appSelected,
  );

  // render header dom

  const { onSelect, ...resProps } = appMenuProps || {};
  const menuProps = {
    ...resProps,
    onSelect: ({ selectedKeys }: any) => {
      if (selectedKeys) {
        setAppSelectedKey(selectedKeys);
        onSelect && onSelect(selectedKeys);
      }
    }
  
    
  };
  const headerDom = headerRender(
    {
      ...defaultProps,
      hasSiderMenu: !!siderMenuDom,
      menuData,
      isMobile,
      collapsed,
      appsMenu: appMenuData,
      fixedHeader: true,
      onCollapse,
      theme: (navTheme || 'dark').toLocaleLowerCase().includes('dark') ? 'dark' : 'light',
      selectedKeys: appSelected,
      menuProps,
    },
    matchMenuKeys,
  );

  // render footer dom
  const footerDom = footerRender({
    isMobile,
    collapsed,
    ...defaultProps,
  });

  const { isChildrenLayout: contextIsChildrenLayout } = useContext(RouteContext);

  // 如果 props 中定义，以 props 为准
  const isChildrenLayout =
    propsIsChildrenLayout !== undefined ? propsIsChildrenLayout : contextIsChildrenLayout;

  const baseClassName = `${prefixCls}-basicLayout`;
  // gen className
  const className = classNames(
    props.className,
    'ant-design-pro ant-sc-master-layout',
    baseClassName,
    {
      [`screen-${colSize}`]: colSize,
      [`${baseClassName}-top-menu`]: propsLayout === 'top',
      [`${baseClassName}-is-children`]: isChildrenLayout,
      [`${baseClassName}-fix-siderbar`]: fixSiderbar,
      [`${baseClassName}-${propsLayout}`]: propsLayout,
    },
  );

  /** 计算 slider 的宽度 */
  const leftSiderWidth = getPaddingLeft(!!hasLeftPadding, collapsed, siderWidth);

  // siderMenuDom 为空的时候，不需要 padding
  const genLayoutStyle: CSSProperties = {
    position: 'relative',
  };

  // if is some layout children, don't need min height
  if (isChildrenLayout || (contentStyle && contentStyle.minHeight)) {
    genLayoutStyle.minHeight = 0;
  }

  const contentClassName = classNames(`${baseClassName}-content`, {
    [`${baseClassName}-has-header`]: headerDom,
    [`${baseClassName}-content-disable-margin`]: disableContentMargin,
  });

  /** 页面切换的时候触发 */
  useEffect(() => {
    const { onPageChange } = props;
    if (onPageChange) {
      onPageChange(props.location,currentMenu);
    }
  }, [props.location?.pathname, props.location?.pathname?.search]);

  const [hasFooterToolbar, setHasFooterToolbar] = useState(false);

  useDocumentTitle(pageTitleInfo, props.title || defaultSettings.title);
  return (
    <MenuCounter.Provider>
      <RouteContext.Provider
        value={{
          ...defaultProps,
          breadcrumb: breadcrumbProps,
          menuData,
          isMobile,
          collapsed,
          isChildrenLayout: true,
          title: pageTitleInfo.pageName,
          hasSiderMenu: !!siderMenuDom,
          hasHeader: !!headerDom,
          siderWidth: leftSiderWidth,
          hasFooter: !!footerDom,
          hasFooterToolbar,
          setHasFooterToolbar,
          pageTitleInfo,
          matchMenus,
          matchMenuKeys,
          currentMenu,
        }}
      >
        {props.pure ? (
          children
        ) : (
          <div className={className}>
            <Layout
              style={{
                minHeight: '100%',
                ...style,
              }}
            >
              {headerDom}
              <Layout>
                {siderMenuDom}
                <div style={genLayoutStyle} className={context.getPrefixCls('layout')}>
                  <WrapContent
                    isChildrenLayout={isChildrenLayout}
                    {...rest}
                    className={contentClassName}
                    style={contentStyle}
                  >
                    {loading ? <PageLoading /> : children}
                  </WrapContent>
                  {footerDom}
                </div>
              </Layout>
            </Layout>
          </div>
        )}
      </RouteContext.Provider>
    </MenuCounter.Provider>
  );
};

MaterLayout.defaultProps = {
  logo: 'https://gw.alipayobjects.com/zos/antfincdn/PmY%24TNNDBI/logo.svg',
  ...defaultSettings,
  location: isBrowser() ? window.location : undefined,
};

export default MaterLayout;
