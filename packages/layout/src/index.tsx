//import MasterLayout from './Layout';
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
import { ErrorBoundary } from '@ant-design/pro-utils';
import { PageContainer } from '@ant-design/pro-layout';
import {MasterLayout} from './MasterLayout';
export {MasterLayout}
export { default as ScCard } from '@ant-design/pro-card';
export {LayoutContext} from './context/LayoutContext'
export type {LayoutContextType} from './context/LayoutContext'
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
  RouteContext,
  PageLoading,
  GridContent,
  TopNavHeader,
  DefaultFooter,
  SettingDrawer,
  getPageTitle,
  ErrorBoundary,
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
  RouteContextType,
  HeaderProps,
  SettingDrawerProps,
  SettingDrawerState,
  ProSettings,
};

export default MasterLayout;
