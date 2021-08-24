/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useMemo } from "react";
import { Layout, ConfigProvider } from "antd";
import type {
  BreadcrumbProps as AntdBreadcrumbProps,
  BreadcrumbProps,
} from "antd/es/breadcrumb";
import type {
  MenuDataItem,
  MessageDescriptor,
  Route,
  RouterTypes,
  WithFalse,
} from "./typings";
import Omit from "omit.js";
import { stringify } from "use-json-comparison";

import type { SiderMenuProps } from "./components/SiderMenu/SiderMenu";
import type { HeaderProps } from "@ant-design/pro-layout";
import type { BaseMenuProps } from "./components/SiderMenu/BaseMenu";
import type { GetPageTitleProps } from "./getPageTitle";
import classNames from "classnames";
import useAntdMediaQuery from "use-media-antd-query";
import MenuCounter from "./components/SiderMenu/Counter";
import type { CSSProperties } from "react";
import { clearMenuItem } from "./utils/utils";
import SiderMenu from "./components/SiderMenu";
import getMenuData from "./utils/getMenuData";
import useMergedState from "rc-util/lib/hooks/useMergedState";
import { getPageTitleInfo } from "./getPageTitle";
import useCurrentMenuLayoutProps from "./utils/useCurrentMenuLayoutProps";
import compatibleLayout from "./utils/compatibleLayout";
import WrapContent from "./WrapContent";
import  Header from "./Header";
import { getMatchMenu } from "@umijs/route-utils";
import type { ProSettings } from "./defaultSettings";
import { useDeepCompareEffect } from '@ant-design/pro-utils';

import defaultSettings from './defaultSettings';

import { PageLoading ,DefaultFooter,RouteContext} from "@ant-design/pro-layout";
import warning from "warning";


const headerRender = (
  props: BasicLayoutProps & {
    hasSiderMenu: boolean;
  },
  matchMenuKeys: string[]
): React.ReactNode => {
  if (props.headerRender === false || props.pure) {
    return null;
  }
  return <Header matchMenuKeys={matchMenuKeys} {...props} />;
};

const footerRender = (props: BasicLayoutProps): React.ReactNode => {
  if (props.footerRender === false || props.pure) {
    return null;
  }
  if (props.footerRender) {
    return props.footerRender({ ...props }, <DefaultFooter />);
  }
  return null;
};

const renderSiderMenu = (
  props: BasicLayoutProps,
  matchMenuKeys: string[]
): React.ReactNode => {
  const { layout, isMobile, openKeys, splitMenus, menuRender } = props;
  if (props.menuRender === false || props.pure) {
    return null;
  }
  let { menuData } = props;

  /** 如果是分割菜单模式，需要专门实现一下 */
  if (splitMenus && openKeys !== false && !isMobile) {
    const [key] = matchMenuKeys;
    if (key) {
      menuData =
        props.menuData?.find((item) => item.key === key)?.children || [];
    } else {
      menuData = [];
    }
  }
  // 这里走了可以少一次循环
  const clearMenuData = clearMenuItem(menuData || []);
  if (clearMenuData && clearMenuData?.length < 1 && splitMenus) {
    return null;
  }
  if (layout === "top" && !isMobile) {
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
      {...props}
      // 这里走了可以少一次循环
      menuData={clearMenuData}
    />
  );
};

const defaultPageTitleRender = (
  pageProps: GetPageTitleProps,
  props: BasicLayoutProps
): {
  title: string;
  id: string;
  pageName: string;
} => {
  const { pageTitleRender } = props;
  const pageTitleInfo = getPageTitleInfo(pageProps);
  if (pageTitleRender === false) {
    return {
      title: props.title || "",
      id: "",
      pageName: "",
    };
  }
  if (pageTitleRender) {
    const title = pageTitleRender(
      pageProps,
      pageTitleInfo.title,
      pageTitleInfo
    );
    if (typeof title === "string") {
      return {
        ...pageTitleInfo,
        title,
      };
    }
    warning(
      typeof title === "string",
      "pro-layout: renderPageTitle return value should be a string"
    );
  }
  return pageTitleInfo;
};

export type BasicLayoutContext = { [K in "location"]: BasicLayoutProps[K] } & {
  breadcrumb: Record<string, MenuDataItem>;
};

const getPaddingLeft = (
  hasLeftPadding: boolean,
  collapsed: boolean | undefined,
  siderWidth: number
): number | undefined => {
  if (hasLeftPadding) {
    return collapsed ? 48 : siderWidth;
  }
  return 0;
};

export type BasicLayoutProps = Partial<RouterTypes<Route>> &
  SiderMenuProps &
  HeaderProps & {
    pure?: boolean;
    /** @name logo url */
    logo?: React.ReactNode | WithFalse<() => React.ReactNode>;

    /** @name 页面切换的时候触发 */
    onPageChange?: (location?: RouterTypes<Route>["location"]) => void;

    loading?: boolean;

    // locale?: LocaleType;

    onCollapse?: (collapsed: boolean) => void;

    footerRender?: WithFalse<
      (props: HeaderProps, defaultDom: React.ReactNode) => React.ReactNode
    >;

    breadcrumbRender?: WithFalse<
      (routers: AntdBreadcrumbProps["routes"]) => AntdBreadcrumbProps["routes"]
    >;

    menuItemRender?: BaseMenuProps["menuItemRender"];
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
        }
      ) => string
    >;
    menuDataRender?: (menuData: MenuDataItem[]) => MenuDataItem[];
    itemRender?: AntdBreadcrumbProps["itemRender"];

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
  };

const BaseLayout: React.FC<BasicLayoutProps> = (props) => {
   props={...defaultSettings,...props}
  const {
    children,
    onCollapse: propsOnCollapse,
    location = { pathname: "/" },
    contentStyle,
    route,
    defaultCollapsed,
    style,
    disableContentMargin,
    siderWidth = 232,
    headerHeight = 48,
    menu,
    isChildrenLayout: propsIsChildrenLayout,
    menuDataRender,
    loading,
  } = props;

  const [menuInfoData, setMenuInfoData] = useMergedState<{
    breadcrumb?: Record<string, MenuDataItem>;
    breadcrumbMap?: Map<string, MenuDataItem>;
    menuData?: MenuDataItem[];
  }>(() => getMenuData(route?.routes || [], menu, ()=>{return ""}, menuDataRender));

  const context = useContext(ConfigProvider.ConfigContext);
  
  const prefixCls = props.prefixCls ?? context.getPrefixCls("sc");
  const colSize = useAntdMediaQuery();
  const { breadcrumb = {}, breadcrumbMap, menuData = [] } = menuInfoData;
  const isMobile =
    (colSize === "sm" || colSize === "xs") && !props.disableMobile;

  const matchMenus = useMemo(
    () => {

      return getMatchMenu(location.pathname || "/", menuData, true)
    },
    [location.pathname, menuInfoData]
  );
  // siderMenuDom 为空的时候，不需要 padding
  const genLayoutStyle: CSSProperties = {
    position: "relative",
  };

  const { isChildrenLayout: contextIsChildrenLayout } = useContext(
    RouteContext
  );

  // 如果 props 中定义，以 props 为准
  const isChildrenLayout =
    propsIsChildrenLayout !== undefined
      ? propsIsChildrenLayout
      : contextIsChildrenLayout;
  // if is some layout children, don't need min height
  if (isChildrenLayout || (contentStyle && contentStyle.minHeight)) {
    genLayoutStyle.minHeight = 0;
  }

  const matchMenuKeys = useMemo(
    () =>
      Array.from(
        new Set(matchMenus.map((item) =>{
          const t=item.key || item.path || ""
          return t

        }))
      ),
    [matchMenus]
  );
  // 当前选中的menu，一般不会为空
  const currentMenu = (matchMenus[matchMenus.length - 1] || {}) as ProSettings &
    MenuDataItem;

  const currentMenuLayoutProps = useCurrentMenuLayoutProps(currentMenu);

  const { fixSiderbar, navTheme="light", layout: defaultPropsLayout, ...rest } = {
    ...props,
    ...currentMenuLayoutProps,
  };

  const propsLayout = compatibleLayout(defaultPropsLayout);

  /** 如果 menuRender 不存在，可以做一下性能优化 只要 routers 没有更新就不需要重新计算 */
  useDeepCompareEffect(() => {
    if (menu?.loading) {
      return () => null;
    }
    const infoData = getMenuData(
      route?.routes || [],
      menu,
      undefined,
      menuDataRender
    );
    // 稍微慢一点 render，不然会造成性能问题，看起来像是菜单的卡顿
    const animationFrameId = requestAnimationFrame(() => {
      setMenuInfoData(infoData);
    });
    return () =>
      window.cancelAnimationFrame &&
      window.cancelAnimationFrame(animationFrameId);
  }, [props.route, stringify(menu), props.location?.pathname]);

  // If it is a fix menu, calculate padding
  // don't need padding in phone mode
  const hasLeftPadding = propsLayout !== "top" && !isMobile;

  const [collapsed, onCollapse] = useMergedState<boolean>(
    () => defaultCollapsed || false,
    {
      value: props.collapsed,
      onChange: propsOnCollapse,
    }
  );

  const baseClassName = `${prefixCls}-basicLayout`;

  const className = classNames(
    props.className,
    "ant-design-pro",
    baseClassName,
    {
      [`screen-${colSize}`]: colSize,
      // [`${baseClassName}-top-menu`]: propsLayout === 'top',
      //// [`${baseClassName}-is-children`]: isChildrenLayout,
      // [`${baseClassName}-fix-siderbar`]: fixSiderbar,
      // [`${baseClassName}-${propsLayout}`]: propsLayout,
    }
  );
  // Splicing parameters, adding menuData and formatMessage in props
  const defaultProps = Omit(
    {
      prefixCls,
      ...props,
      siderWidth,
      ...currentMenuLayoutProps,

      breadcrumb,
      layout: propsLayout as "side",
    },
    ["className", "style", "breadcrumbRender"]
  );
  // render sider dom
  const siderMenuDom = renderSiderMenu(
    {
      ...defaultProps,
      menuData,
      onCollapse,
      isMobile,
      theme: (navTheme || "dark").toLocaleLowerCase().includes("dark")
        ? "dark"
        : "light",
      collapsed,
    },
    matchMenuKeys
  );

  // render header dom
  const headerDom = headerRender(
    {
      ...defaultProps,
      hasSiderMenu: !!siderMenuDom,
      menuData,
      isMobile,
      collapsed,
      onCollapse,
      theme: (navTheme || "dark").toLocaleLowerCase().includes("dark")
        ? "dark"
        : "light",
    },
    matchMenuKeys
  );
    // render footer dom
    const footerDom = footerRender({
      isMobile,
      collapsed,
      ...defaultProps,
    });
  
  const contentClassName = classNames(`${baseClassName}-content`, {
    [`${baseClassName}-has-header`]: headerDom,
    [`${baseClassName}-content-disable-margin`]: disableContentMargin,
  });
  return (
    <MenuCounter.Provider>
      <RouteContext.Provider
        value={
          {
            // ...defaultProps,
            // breadcrumb: breadcrumbProps,
            menuData,
            // isMobile,
            // collapsed,
            // isChildrenLayout: true,
            // title: pageTitleInfo.pageName,
            // hasSiderMenu: !!siderMenuDom,
            // hasHeader: !!headerDom,
            // siderWidth: leftSiderWidth,
            // hasFooter: !!footerDom,
            // hasFooterToolbar,
            // setHasFooterToolbar,
            // pageTitleInfo,
            // matchMenus,
            matchMenuKeys,
            //  currentMenu,
          }
        }
      >
        {props.pure ? (
          children
        ) : (
          <div className={className}>
            <Layout
              style={{
                minHeight: "100%",
                ...style,
              }}
            >
              {siderMenuDom}
              <div
                style={genLayoutStyle}
                className={context.getPrefixCls("layout")}
              >
                {headerDom}
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
          </div>
        )}
      </RouteContext.Provider>
    </MenuCounter.Provider>
  );
};

export default BaseLayout;
