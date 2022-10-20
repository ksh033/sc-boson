import type { BasicLayoutProps } from './BasicLayout';
import BasicLayout from './BasicLayout';
import MasterLayout from './MasterLayout';
import NewLayout from './NewLayout';
import DefaultHeader from './Header';
import defaultSettings from './defaultSettings'
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

import {ProLayoutContext} from '@ant-design/pro-layout/es/context/ProLayoutContext'
import { PageContainer } from '@ant-design/pro-layout';
export { default as ScCard } from '@ant-design/pro-card';
export { TopLayoutToket} from   './NewLayout/style';

export type { MenuDataItem } from './typings';
//const PageHeaderWrapper = PageContainer;
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
 // PageHeaderWrapper,
  getMenuData,
  PageContainer,
  FooterToolbar,
  WaterMark,
  MasterLayout,
  NewLayout,
  defaultSettings,
  ProLayoutContext
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
