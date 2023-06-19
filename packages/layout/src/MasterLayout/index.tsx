
import React, { useMemo, useState } from 'react';
import {
  PageContainer,
  ProLayout,
  ProLayoutProps
} from "@ant-design/pro-layout";

import Header from '../Header';
import { AppMenuProps, HeaderViewProps } from './Header';
export type AppProps = Omit<AppMenuProps, 'component'>;
import { gLocaleObject } from '@ant-design/pro-layout/es/locales';
import { getMatchMenu } from '../utils/getMatchMenu';
import getMenuData from '../utils/getMenuData';
import { getBreadcrumbProps } from '../utils/getBreadcrumbProps';
import { RouteContext } from '@ant-design/pro-layout';
import { getPageTitleInfo } from '../getPageTitle';

import './index.less';

import { TopLayoutToket } from "./style"
import { RouterTypes } from '../typings';

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
const getAppMenus = (apps?: AppProps[]): AppMenuProps[] => {
  if (apps) {
    return apps.map((app) => ({ ...app, key: app.code }));
  }
  return [];
};
type LayoutPro = ProLayoutProps & HeaderViewProps & {

  apps: AppProps[];

  /** @name 页面切换的时候触发 */
  onPageChange?: (location?: RouterTypes['location'], currentMenu?: any) => void;
}
export default (props: LayoutPro) => {

  const userConfig: ProLayoutProps = {
    layout: 'top',
    contentWidth: 'Fluid',
    fixedHeader: false,
    fixSiderbar: false,
    menu: {
      locale: false,
    },
    title: '长嘴猫平台',
    iconfontUrl: '',
    // primaryColor: 'daybreak',
    splitMenus: false,
  };
  const {

    apps,
    menu,
    route,
    logo,
    appSelectedKeys,
    appMenuProps,
    rightContentRender,
    menuData,
    //menuDataRender,
    onPageChange,
    ...layoutProps
  } = props;
  const [appSelectedKey, setAppSelectedKey] = useState(null);
  const appMenuData = getAppMenus(apps);

  const appkey = findAppCode(location.pathname, appMenuData);
  const appSelected = appSelectedKey || appSelectedKeys || appkey;
  const headerRender = (
    props: ProLayoutProps & {
      appsMenu?: any,
      hasSiderMenu?: boolean;
    },
    //  matchMenuKeys: string[],
  ): React.ReactNode => {
    if (props.headerRender === false || props.pure) {
      return null;
    }
    return <Header matchMenuKeys={[]} {...props} />;
  };
  const { onSelect, ...resProps } = appMenuProps || {};
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
    const locales = gLocaleObject();
    return locales[id] ? locales[id] : (defaultMessage as string);
  };
  const matchMenus = useMemo(() => {
    return getMatchMenu(location.pathname || '/', menuData || [], true);
  }, [location.pathname, menuData]);

  const matchMenuKeys = useMemo(
    () => Array.from(new Set(matchMenus.map((item) => item.key || item.path || ''))),
    [matchMenus],
  );

  // 当前选中的menu，一般不会为空
  const currentMenu = (matchMenus[matchMenus.length - 1] || {});

  const menuProps = {
    ...resProps,
    selectedKeys: appSelected,
    mode: "horizontal",
    theme: "light",
    onSelect: ({ selectedKeys }: any) => {
      if (selectedKeys) {
        setAppSelectedKey(selectedKeys);
        onSelect && onSelect(selectedKeys);
      }
    },
  };



  return (

    <ProLayout
      navTheme="light"
      className='sc-master-top-layout'
      token={{ ...TopLayoutToket, header:{heightLayoutHeader:48},pageContainer: { marginBlockPageContainerContent: 0, marginInlinePageContainerContent: 0 }, hashId: 'top-layout' }}
      {...userConfig}
      menuDataRender={(menuData) => {
        return menuData
      }}
      onPageChange={(location) => {

        onPageChange && onPageChange(location, currentMenu)
      }}

      logo={logo}
      layout="top"
      route={{ routes: appMenuData }}
      hasSiderMenu={true}
      rightContentRender={rightContentRender}
      menuData={appMenuData}
      fixedHeader={true}
      collapsedButtonRender={false}
      contentStyle={{ flex: 'auto', marginBlock: '0px', marginInline: '0px' }}
    >

      <ProLayout className='sc-master-content-layout' token={{ hashId: 'content-layout', ...TopLayoutToket, pageContainer: { marginBlockPageContainerContent: 0, marginInlinePageContainerContent: 0 } }} layout='mix' navTheme="realDark" {...layoutProps} style={{ height: '100%' }} menuHeaderRender={false} headerRender={false} fixedHeader={false} fixSiderbar={true} title={false}>



      </ProLayout>

    </ProLayout>

  );
}
export { getMatchMenu, getMenuData, getBreadcrumbProps, getPageTitleInfo, RouteContext }