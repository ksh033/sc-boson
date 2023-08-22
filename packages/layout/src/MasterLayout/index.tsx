import type { GenerateStyle, ProTokenType } from "@ant-design/pro-provider";
import {
  isNeedOpenHash,
  ProConfigProvider,
  ProProvider,
} from '@ant-design/pro-provider';
import {
  coverToNewToken,
  isBrowser,
  useDocumentTitle,
  useMountMergeState,
} from '@ant-design/pro-utils';
import { getMatchMenu } from '@umijs/route-utils';
import type { BreadcrumbProps, MenuProps } from 'antd';
import { ConfigProvider, Layout } from 'antd';
import classNames from 'classnames';
import Omit from 'omit.js';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import warning from 'rc-util/lib/warning';
import type { CSSProperties, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import useSWR, { useSWRConfig } from 'swr';
import useAntdMediaQuery from 'use-media-antd-query';
//import { Logo } from './assert/Logo';
import { DefaultFooter as Footer } from '@ant-design/pro-layout';
import type { HeaderViewProps } from '@ant-design/pro-layout/es/components/Header';
import { DefaultHeader as Header } from '@ant-design/pro-layout/es/components/Header';


import PageLoading from '../components/PageLoading';
import { SiderMenu } from './SiderMenu';

import { RouteContext } from '@ant-design/pro-layout';
import type { ProSettings, RouteContextType } from '@ant-design/pro-layout';
import defaultSettings from '../defaultSettings';
import type { GetPageTitleProps } from '@ant-design/pro-layout/es/getPageTitle';
import { getPageTitleInfo } from '@ant-design/pro-layout/es/getPageTitle';
import { gLocaleObject } from '@ant-design/pro-layout/es/locales';
import { useStyle } from '@ant-design/pro-layout/es/style';
import { AppstoreOutlined } from '@ant-design/icons'
import type {
  MenuDataItem,
  MessageDescriptor,
  RouterTypes,
  WithFalse,
} from '@ant-design/pro-layout/es/typing';
import type { BreadcrumbProLayoutProps } from '../utils/getBreadcrumbProps';
import { getBreadcrumbProps } from '../utils/getBreadcrumbProps';
import getMenuData from '../utils/getMenuData';
import { useCurrentMenuLayoutProps } from '@ant-design/pro-layout/es/utils/useCurrentMenuLayoutProps';
import { clearMenuItem } from '../utils/utils';
import { WrapContent } from '@ant-design/pro-layout/es/WrapContent';

import "./index.less"
import { AppMenuProps } from "../typings";
export type AppProps = Omit<AppMenuProps, 'component'>;
import type { ProLayoutProps as LayoutProps } from '@ant-design/pro-layout'
import { LayoutContext } from "../context/LayoutContext";
import { useSize } from 'ahooks'
let layoutIndex = 0;
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
const getAppMenus = (apps?: AppProps[]): MenuDataItem[] => {
  if (apps) {
    return apps.map((app) => ({ ...app, key: app.code, icon: <AppstoreOutlined></AppstoreOutlined> }));
  }
  return [];
};

export type LayoutBreadcrumbProps = {
  minLength?: number;
};


export type ProLayoutProps = LayoutProps & {
  apps: AppProps[];
  appMenuProps: MenuProps;
  appSelectedKeys: string[],
  //routeContextRef?: React.MutableRefObject<RouteContextType | undefined> | ((actionRef: ActionType) => void);
}
const headerRender = (
  props: ProLayoutProps & {
    hasSiderMenu: boolean;
  },
  matchMenuKeys: string[],
): React.ReactNode => {
  if (props.headerRender === false || props.pure) {
    return null;
  }
  return (
    <Header
      matchMenuKeys={matchMenuKeys}
      {...props}
      menuData={[]}
      stylish={props.stylish?.header}
    />
  );
};

const footerRender = (props: ProLayoutProps): React.ReactNode => {
  if (props.footerRender === false || props.pure) {
    return null;
  }
  if (props.footerRender) {
    return props.footerRender({ ...props }, <Footer />);
  }
  return null;
};

const renderSiderMenu = (
  props: ProLayoutProps,
  matchMenuKeys: string[],
): React.ReactNode => {
  const {
    layout,
    isMobile,
    selectedKeys,
    openKeys,
    splitMenus,
    suppressSiderWhenMenuEmpty,
    menuRender,
  } = props;
  if (props.menuRender === false || props.pure) {
    return null;
  }
  let { menuData } = props;

  /** 如果是分割菜单模式，需要专门实现一下 */
  if (splitMenus && (openKeys !== false || layout === 'mix') && !isMobile) {
    const [key] = selectedKeys || matchMenuKeys;
    if (key) {
      menuData =
        props.menuData?.find((item) => item.key === key)?.children || [];
    } else {
      menuData = [];
    }
  }
  // 这里走了可以少一次循环
  const clearMenuData = clearMenuItem(menuData || []);
  if (
    clearMenuData &&
    clearMenuData?.length < 1 &&
    (splitMenus || suppressSiderWhenMenuEmpty)
  ) {
    return null;
  }
  if (layout === 'top' && !isMobile) {
    return (
      <SiderMenu
        matchMenuKeys={matchMenuKeys}
        {...props}
        hide
        stylish={props.stylish?.sider}
      />
    );
  }

  const defaultDom = (
    <SiderMenu
      matchMenuKeys={matchMenuKeys}
      {...props}
      // 这里走了可以少一次循环
      menuData={clearMenuData}
      stylish={props.stylish?.sider}
    />
  );
  if (menuRender) {
    return menuRender(props, defaultDom);
  }

  return defaultDom;
};

const defaultPageTitleRender = (
  pageProps: GetPageTitleProps,
  props: ProLayoutProps,
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
    const title = pageTitleRender(
      pageProps,
      pageTitleInfo.title,
      pageTitleInfo,
    );
    if (typeof title === 'string') {
      return getPageTitleInfo({
        ...pageTitleInfo,
        title,
      });
    }
    warning(
      typeof title === 'string',
      'pro-layout: renderPageTitle return value should be a string',
    );
  }
  return pageTitleInfo;
};

export type BasicLayoutContext = { [K in 'location']: ProLayoutProps[K] } & {
  breadcrumb: Record<string, MenuDataItem>;
};

const getpaddingInlineStart = (
  hasLeftPadding: boolean,
  collapsed: boolean | undefined,
  siderWidth: number,
): number | undefined => {
  if (hasLeftPadding) {
    return collapsed ? 60 : siderWidth;
  }
  return 0;
};

/**
 * 🌃 Powerful and easy to use beautiful layout 🏄‍ Support multiple topics and layout types
 *
 * @param props
 */
const BaseProLayout = React.forwardRef((props: ProLayoutProps, ref) => {
  const {
    children,
    onCollapse: propsOnCollapse,
    location = { pathname: '/' },
    contentStyle,
    route,
    defaultCollapsed,
    style,
    siderWidth: propsSiderWidth,
    menu,
    siderMenuType,
    isChildrenLayout: propsIsChildrenLayout,
    menuDataRender,
    actionRef,
    bgLayoutImgList,
    formatMessage: propsFormatMessage,
    loading,

    apps,
  } = props || {};


  //const appMenuData=getAppMenus(apps)
  const siderWidth = useMemo(() => {
    if (propsSiderWidth) return propsSiderWidth;
    if (props.layout === 'mix') return 228;
    return 256;
  }, [props.layout, propsSiderWidth]);

  const context = useContext(ConfigProvider.ConfigContext);



  const prefixCls = props.prefixCls ?? context.getPrefixCls('pro');

  const [menuLoading, setMenuLoading] = useMountMergeState(false, {
    value: menu?.loading,
    onChange: menu?.onLoadingChange,
  });

  // give a default key for swr
  const [defaultId] = useState(() => {
    layoutIndex += 1;
    return `pro-layout-${layoutIndex}`;
  });



  /**
   * 处理国际化相关 formatMessage
   * 如果有用户配置的以用户为主
   * 如果没有用自己实现的
   */
  const formatMessage = useCallback(
    ({
      id,
      defaultMessage,
      ...restParams
    }: {
      id: string;
      defaultMessage?: string;
    }): string => {
      if (propsFormatMessage) {
        return propsFormatMessage({
          id,
          defaultMessage,
          ...restParams,
        });
      }
      const locales = gLocaleObject();
      return locales[id] ? locales[id] : (defaultMessage as string);
    },
    [propsFormatMessage],
  );

  const { data, mutate, isLoading } = useSWR(
    [defaultId, menu?.params],
    async ([, params]) => {
      setMenuLoading(true);
      const menuDataItems = await menu?.request?.(
        params || {},
        route?.children || route?.routes || [],
      );
      setMenuLoading(false);
      return menuDataItems;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      revalidateOnReconnect: false,
    },
  );

  useEffect(() => {
    setMenuLoading(isLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const { cache } = useSWRConfig();
  useEffect(() => {
    return () => {
      if (cache instanceof Map) cache.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuInfoData = useMemo<{
    breadcrumb?: Record<string, MenuDataItem>;
    breadcrumbMap?: Map<string, MenuDataItem>;
    menuData?: MenuDataItem[];
    menuMap?: any
  }>(
    () =>
      getMenuData(
        data || route?.children || route?.routes || [],
        menu,
        formatMessage,
        menuDataRender,
      ),
    [formatMessage, menu, menuDataRender, data, route?.children, route?.routes],
  );

  const { breadcrumb = {}, breadcrumbMap, menuData = [], menuMap } = menuInfoData || {};



  if (actionRef && menu?.request) {
    actionRef.current = {
      reload: () => {
        mutate();
      },
    };
  }
  const matchMenus = useMemo(() => {
    return getMatchMenu(location.pathname || '/', menuData || [], true);
  }, [location.pathname, menuData]);

  const matchMenuKeys = useMemo(
    () =>
      Array.from(
        new Set(matchMenus.map((item) => item.key || item.path || '')),
      ),
    [matchMenus],
  );
  console.log(matchMenuKeys)
  // 当前选中的menu，一般不会为空
  const currentMenu = (matchMenus[matchMenus.length - 1] || {}) as ProSettings &
    MenuDataItem;

  const currentMenuLayoutProps = useCurrentMenuLayoutProps(currentMenu);

  const {
    fixSiderbar,
    navTheme,
    layout: propsLayout,
    ...rest
  } = {
    ...props,
    ...currentMenuLayoutProps,
  };

  const colSize = useAntdMediaQuery();

  const isMobile =
    (colSize === 'sm' || colSize === 'xs') && !props.disableMobile;

  // If it is a fix menu, calculate padding
  // don't need padding in phone mode
  /* Checking if the menu is loading and if it is, it will return a skeleton loading screen. */
  const hasLeftPadding = propsLayout !== 'top' && !isMobile;

  const [collapsed, onCollapse] = useMergedState<boolean>(
    () => {
      if (defaultCollapsed !== undefined) return defaultCollapsed;
      if (isNeedOpenHash() === false) return false;
      if (isMobile) return true;
      if (colSize === 'md') return true;
      return false;
    },
    {
      value: props.collapsed,
      onChange: propsOnCollapse,
    },
  );

  // Splicing parameters, adding menuData and formatMessage in props
  const defaultProps = Omit(
    {
      prefixCls,
      ...props,
      siderWidth,
      ...currentMenuLayoutProps,
      formatMessage,
      breadcrumb,
      menu: {
        ...menu,
        type: siderMenuType || menu?.type,
        loading: menuLoading,
      },
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
  const breadcrumbProps = getBreadcrumbProps(
    {
      ...(defaultProps as BreadcrumbProLayoutProps),
      breadcrumbRender: props.breadcrumbRender,
      breadcrumbMap,
      menuMap
    },
    props,
  );

  // render sider dom
  const siderMenuDom = renderSiderMenu(
    {
      ...defaultProps,
      menuData,
      onCollapse,
      siderWidth: 124,

      isMobile,
      collapsed,
    },
    matchMenuKeys,
  );

  // render header dom
  const headerDom = headerRender(
    {
      ...defaultProps,
      children: null,
      hasSiderMenu: !!siderMenuDom,
      menuData,
      isMobile,
      collapsed,
      onCollapse,
    },
    matchMenuKeys,
  );

  // render footer dom
  const footerDom = footerRender({
    isMobile,
    collapsed,
    ...defaultProps,
  });

  const { isChildrenLayout: contextIsChildrenLayout } =
    useContext(RouteContext);

  // 如果 props 中定义，以 props 为准
  const isChildrenLayout =
    propsIsChildrenLayout !== undefined
      ? propsIsChildrenLayout
      : contextIsChildrenLayout;

  const proLayoutClassName = `${prefixCls}-layout`;
  const { wrapSSR, hashId } = useStyle(proLayoutClassName);

  // gen className
  const className = classNames(
    props.className,
    hashId,
    'ant-design-pro',
    'sc-master-layout',
    proLayoutClassName,
    {
      [`screen-${colSize}`]: colSize,
      [`${proLayoutClassName}-top-menu`]: propsLayout === 'top',
      [`${proLayoutClassName}-is-children`]: isChildrenLayout,
      [`${proLayoutClassName}-fix-siderbar`]: fixSiderbar,
      [`${proLayoutClassName}-${propsLayout}`]: propsLayout,
    },
  );

  /** 计算 slider 的宽度 */
  const leftSiderWidth = getpaddingInlineStart(
    !!hasLeftPadding,
    collapsed,
    siderWidth,
  );

  // siderMenuDom 为空的时候，不需要 padding
  const genLayoutStyle: CSSProperties = {
    position: 'relative',
  };

  // if is some layout children, don't need min height
  if (isChildrenLayout || (contentStyle && contentStyle.minHeight)) {
    genLayoutStyle.minHeight = 0;
  }

  /** 页面切换的时候触发 */
  useEffect(() => {

    //@ts-ignore
    props.onPageChange?.(props.location, currentMenu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.pathname?.search]);

  const [hasFooterToolbar, setHasFooterToolbar] = useState(false);
  /**
   * 使用number是因为多标签页的时候有多个 PageContainer，只有有任意一个就应该展示这个className
   */
  const [hasPageContainer, setHasPageContainer] = useState(1);
  const usePageCon = useRef<any>();

  //const size=useSize(usePageCon)
  // pageHeight=size?.height;
  //const [pageContainerHeight, setPageContainerHeight] = useState<any>(pageHeight);


  useDocumentTitle(pageTitleInfo, props.title || false);
  const bgImgStyleList = useMemo(() => {
    if (bgLayoutImgList && bgLayoutImgList.length > 0) {
      return bgLayoutImgList.map((item, index) => {
        return (
          <img
            key={index}
            src={item.src}
            style={{
              position: 'absolute',
              ...item,
            }}
          />
        );
      });
    }
    return null;
  }, [bgLayoutImgList]);


  // useEffect(()=>{
  //   console.log("layout",size)
  //   if (size){
  //   setPageContainerHeight(size.height)
  //   return () => {
  //     setPageContainerHeight(size.height);
  //   };
  //   }else{
  //     return () => {};
  //   }




  // },[pageHeight])
  //const routeContextRef = useRef<RouteContextType>(null);



  const routeContextVal = {
    ...defaultProps,
    breadcrumb: breadcrumbProps,
    menuData,
    isMobile,
    collapsed,
    hasPageContainer,
    setHasPageContainer,
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
    currentMenu
  }

  useImperativeHandle(ref, () => {
    return {
      breadcrumb: breadcrumbProps,
      menuData,
      hasPageContainer,
      setHasPageContainer,
      title: pageTitleInfo.pageName,
      matchMenus,
      matchMenuKeys,
      currentMenu,
      pageContainer: usePageCon
      // pageContainerHeight,
      // setPageContainerHeight
    };
  }, [breadcrumbProps]);
  const { token } = useContext(ProProvider);
  return wrapSSR(
    <RouteContext.Provider
      value={routeContextVal}
    >


      {props.pure ? (
        <>{children}</>
      ) : (
        <div className={className}>
          <div className={classNames(`${proLayoutClassName}-bg-list`, hashId)}>
            {bgImgStyleList}
          </div>
          <Layout
            style={{
              minHeight: '100%',
              // hack style
              flexDirection: siderMenuDom ? 'row' : undefined,
              ...style,
            }}
          >
            <ConfigProvider
              theme={{
                hashed: isNeedOpenHash(),
                token: {

                },
                components: {

                  Menu: coverToNewToken({
                    colorMenuBackground: "#fff",
                    colorItemBg:
                      token?.layout?.sider?.colorMenuBackground ||
                      'transparent',
                    colorSubItemBg:
                      token?.layout?.sider?.colorMenuBackground ||
                      'transparent',
                    radiusItem: 4,
                    controlHeightLG:
                      token?.layout?.sider?.menuHeight ||
                      token?.controlHeightLG,
                    itemHoverBg: '#f7f7f7',
                    colorItemBgSelected: 'rgba(21,91,212,.08)',
                    // token?.layout?.sider?.colorBgMenuItemSelected ||
                    // token?.colorBgTextHover,
                    colorItemBgActive: '#f7f7f7',
                    // token?.layout?.sider?.colorBgMenuItemHover ||
                    // token?.colorBgTextHover,
                    colorItemBgSelectedHorizontal:
                      token?.layout?.sider?.colorBgMenuItemSelected ||
                      token?.colorBgTextHover,
                    colorActiveBarWidth: 0,
                    colorActiveBarHeight: 0,
                    colorActiveBarBorderSize: 0,
                    colorItemText:
                      token?.layout?.sider?.colorTextMenu ||
                      token?.colorTextSecondary,
                    colorItemTextHover: '#155bd4',
                    // token?.layout?.sider?.colorTextMenuActive ||
                    // 'rgba(0, 0, 0, 0.85)',
                    colorItemTextSelected: '#155bd4',
                    // token?.layout?.sider?.colorTextMenuSelected ||
                    // 'rgba(0, 0, 0, 1)',
                    colorBgElevated:
                      token?.layout?.sider?.colorBgMenuItemCollapsedElevated ||
                      '#fff',
                  }),
                },
              }}
            >


              {siderMenuDom}
            </ConfigProvider>

            <div
              style={genLayoutStyle}
              ref={usePageCon}
              className={`${proLayoutClassName}-container ${hashId}`.trim()}
            >
              {headerDom}
              <LayoutContext.Provider value={
                {

                  pageContainer: usePageCon
                }
              } >
                <WrapContent
                  hasPageContainer={hasPageContainer}
                  isChildrenLayout={isChildrenLayout}
                  {...rest}
                  hasHeader={!!headerDom}
                  prefixCls={proLayoutClassName}
                  style={contentStyle}

                >


                  {loading ? <PageLoading /> : children}


                </WrapContent>
              </LayoutContext.Provider>
              {footerDom}
              {hasFooterToolbar && (
                <div
                  className={`${proLayoutClassName}-has-footer`}
                  style={{
                    height: 64,
                    marginBlockStart:
                      token?.layout?.pageContainer
                        ?.paddingBlockPageContainerContent,
                  }}
                />
              )}
            </div>
          </Layout>
        </div>
      )}
    </RouteContext.Provider>,
  );
})
// ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>
const MasterLayout: ForwardRefExoticComponent<PropsWithoutRef<ProLayoutProps> & RefAttributes<RouteContextType>> = React.forwardRef<RouteContextType, ProLayoutProps>(

  (props: ProLayoutProps, ref) => {
    const { colorPrimary, token = {} } = props;
    console.log("props", props)
    const newToken = { ...token, sider: { colorMenuBackground: "#000" } }
    const darkProps =
      props.navTheme !== undefined
        ? {
          dark: props.navTheme === 'realDark',
        }
        : {};

    return (
      <ConfigProvider
        theme={
          colorPrimary
            ? {
              token: {

                colorPrimary: colorPrimary,
              },
            }
            : undefined
        }
      >
        <ProConfigProvider


          {...darkProps}
          token={{
            ...props.token,

            layout: {

              pageContainer: {

              }
            }
          }}


        >
          <BaseProLayout

            {...defaultSettings}
            location={isBrowser() ? window.location : undefined}
            {...props}

            ref={ref}
          />
        </ProConfigProvider>
      </ConfigProvider>
    );
  }

)

export { MasterLayout, getBreadcrumbProps, getMenuData };
