/* eslint-disable @typescript-eslint/no-shadow */

import React, { Component } from 'react';
import { Layout } from 'antd';
import type { GlobalHeaderProps } from '@ant-design/pro-layout/es/components/GlobalHeader';
import type { WithFalse } from '@ant-design/pro-layout/es/typing';

const { Header } = Layout;
export interface AppMenuProps {
  /** 应用名称 */
  name: string;
  /** 应用编码 */
  code: string;
  /** 应用路径 */
  path: string;
  /** 应用路径 */
  icon: string;

  key: string;
}
export type HeaderViewProps = GlobalHeaderProps & {
  isMobile?: boolean;
  collapsed?: boolean;
  logo?: React.ReactNode;
  headerRender?: WithFalse<
  (props: HeaderViewProps, defaultDom: React.ReactNode) => React.ReactNode
>;
headerTitleRender?: WithFalse<
(
  logo: React.ReactNode,
  title: React.ReactNode,
  props: HeaderViewProps,
) => React.ReactNode
>;
headerContentRender?: WithFalse<
(props: HeaderViewProps, defaultDom: React.ReactNode) => React.ReactNode
>;
  siderWidth?: number;
  hasSiderMenu?: boolean;
  appsMenu?: AppMenuProps[];
  appSelect?: (appCode: any) => void;
  location: any;
  appMenuProps: any;
  appSelectedKeys: any;
  headerHeight: number
};

type HeaderViewState = {
  visible: boolean;
  selectedKeys?: any[];
};

