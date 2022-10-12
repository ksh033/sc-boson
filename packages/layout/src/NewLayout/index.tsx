
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
import  './index.less';

import { TopLayoutToket} from "./style"

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
export default (props: ProLayoutProps&HeaderViewProps&{
  apps: AppProps[];
}) => {

  const userConfig:ProLayoutProps= {
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
  //menuDataRender,
  ...layoutProps
} = props;
const [appSelectedKey, setAppSelectedKey] = useState(null);
const appMenuData = getAppMenus(apps);

const appkey = findAppCode(location.pathname, appMenuData);
const appSelected = appSelectedKey || appSelectedKeys || appkey;
console.log(appSelected)
const headerRender = (
  props: ProLayoutProps & {
    appsMenu?:any,
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

// const [menuInfoData, setMenuInfoData] = useMergedState<{
//   breadcrumb?: Record<string, MenuDataItem>;
//   breadcrumbMap?: Map<string, MenuDataItem>;
//   menuData?: MenuDataItem[];
// }>(() => getMenuData(route?.routes || [], menu, formatMessage, menuDataRender));

// const { breadcrumb = {}, breadcrumbMap, menuData = [] } = menuInfoData;
const menuProps = {
  ...resProps,
  selectedKeys:appSelected,
  mode:"horizontal",
  theme:"light",
  onSelect: ({ selectedKeys }: any) => {
    if (selectedKeys) {
      setAppSelectedKey(selectedKeys);
      onSelect && onSelect(selectedKeys);
    }
  },
};
console.log(menuProps)


  return (

    <ProLayout
    navTheme="light"
    className='sc-master-top-layout'
    token={TopLayoutToket}
     {...userConfig}

     menuDataRender={(menuData)=>{

      console.log("appMenus",menuData)
      return menuData
     }}
      
    //  headerRender={()=>{
    //   return headerDom;
    //  }}
    
    menuProps={menuProps}
    
     logo={logo} 
    layout="top"
    route={{routes:appMenuData}}
    hasSiderMenu={true}
    rightContentRender={rightContentRender}
    menuData={appMenuData}
    fixedHeader={true}
    collapsedButtonRender={false}

    contentStyle={{flex:'auto',marginBlock:'0px',marginInline:'0px'}}
    >
    
       <ProLayout   className='sc-master-content-layout'   token={TopLayoutToket} layout='mix' navTheme="realDark" {...layoutProps}   style={{height:'100%'}}  menuHeaderRender={false} headerRender={false} fixedHeader={false}   fixSiderbar={true} title={false}>



        </ProLayout> 
    
    </ProLayout>
  
  );
}
