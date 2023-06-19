import './Header.less';

import React, { Component } from 'react';
import type { HeaderProps } from '@ant-design/pro-layout';
import { DefaultHeader } from '@ant-design/pro-layout';

export type PrivateSiderMenuProps = {
  matchMenuKeys: string[];
};


type HeaderViewState = {
  visible: boolean;
};

class HeaderView extends Component<HeaderProps & PrivateSiderMenuProps, HeaderViewState> {
  render(): React.ReactNode {
    return <DefaultHeader {...this.props} />;
  }
}

export default HeaderView;
