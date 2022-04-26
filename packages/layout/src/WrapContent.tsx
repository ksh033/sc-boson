import type { CSSProperties, PropsWithChildren } from 'react';
import React from 'react';
import { Layout } from 'antd';
import { ConfigProviderWrap } from '@ant-design/pro-provider';

const WrapContent: React.FC<PropsWithChildren<{
  isChildrenLayout?: boolean;
  className?: string;
  style?: CSSProperties;
  location?: any;
  contentHeight?: number | string;
}>> = (props) => {
  const { style, className, children } = props;
  return (
    <ConfigProviderWrap>
      <Layout.Content className={className} style={style}>
        {children}
      </Layout.Content>
    </ConfigProviderWrap>
  );
};

export default WrapContent;
