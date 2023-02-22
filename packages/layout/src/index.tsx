import type { BasicLayoutProps } from './BasicLayout';
import BasicLayout from './BasicLayout';
//import MasterLayout from './Layout';
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

import { PageContainer } from '@ant-design/pro-layout';
export { default as MasterLayout } from './MasterLayout'
export { default as ScCard } from '@ant-design/pro-card';
export { StatisticCard as ScStatisticCard, Statistic as ScStatistic, CheckCard as ScCheckCard } from '@ant-design/pro-card';

export type { ProCardTabsProps as ScCardTabsProps, ProCardProps as ScCardProps, StatisticCardProps as ScStatisticCardProps, StatisticsCardProps as ScStatisticsCardProps, CheckCardGroupProps as ScCheckCardGroupProps, CheckCardProps as ScCheckCardProps, StatisticProps as ScStatisticProps } from '@ant-design/pro-card';
// import type { SettingDrawerProps, SettingDrawerState } from './components/SettingDrawer';
// import SettingDrawer from './components/SettingDrawer';

// import type { FooterProps } from './Footer';StatisticCard, Statistic, CheckCard, 
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
  // MasterLayout,
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
