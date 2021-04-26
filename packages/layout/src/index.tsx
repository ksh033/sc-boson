import type { BasicLayoutProps } from './BasicLayout';
import BasicLayout from './BasicLayout';
import MasterLayout from './MasterLayout';
import DefaultHeader from './Header';
import type {
  TopNavHeaderProps,
  FooterProps,
  RouteContextType,
  PageContainerProps,
  HeaderProps,
  SettingDrawerProps,
  ProSettings,
  SettingDrawerState,
} from '@ant-design/pro-layout';
import {
  TopNavHeader,
  GridContent,
  SettingDrawer,
  DefaultFooter,
  RouteContext,
  getMenuData,
  getPageTitle,
  PageLoading,
  FooterToolbar,
  WaterMark,
} from '@ant-design/pro-layout';

import PageContainer from './components/PageContainer';

// import type { SettingDrawerProps, SettingDrawerState } from './components/SettingDrawer';
// import SettingDrawer from './components/SettingDrawer';

// import type { FooterProps } from './Footer';
// import DefaultFooter from './Footer';
// import GridContent from './components/GridContent';
// import PageContainer from './components/PageContainer';
// import type { PageContainerProps } from './components/PageContainer';
// import type { RouteContextType } from './RouteContext';
// import RouteContext from './RouteContext';
// import getMenuData from './utils/getMenuData';
// import getPageTitle from './getPageTitle';
// import PageLoading from './components/PageLoading';
// import FooterToolbar from './components/FooterToolbar';

// export type { ProSettings as Settings, ProSettings } from "./defaultSettings";

export type { MenuDataItem } from './typings';

const PageHeaderWrapper = PageContainer;

export {
  BasicLayout,
  RouteContext,
  PageLoading,
  GridContent,
  DefaultHeader,
  TopNavHeader,
  DefaultFooter,
  SettingDrawer,
  getPageTitle,
  PageHeaderWrapper,
  getMenuData,
  PageContainer,
  FooterToolbar,
  WaterMark,
  MasterLayout,
};

export type {
  FooterProps,
  PageContainerProps,
  TopNavHeaderProps,
  BasicLayoutProps,
  RouteContextType,
  HeaderProps,
  SettingDrawerProps,
  SettingDrawerState,
  ProSettings,
};

export default BasicLayout;
