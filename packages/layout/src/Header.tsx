import './Header.less';

import React, { Component } from 'react';
import { Layout } from 'antd';
import type { HeaderProps } from '@ant-design/pro-layout';
import { DefaultHeader } from '@ant-design/pro-layout';
import type { PrivateSiderMenuProps } from './components/SiderMenu/SiderMenu';

const { Header } = Layout;

type HeaderViewState = {
  visible: boolean;
};

class HeaderView extends Component<HeaderProps & PrivateSiderMenuProps, HeaderViewState> {
  render(): React.ReactNode {
    return <DefaultHeader {...this.props} />;
  }
}

export default HeaderView;
