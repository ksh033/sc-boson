/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
import { PageContainer as APageContainer } from '@ant-design/pro-layout';
import type { PageContainerProps } from '@ant-design/pro-layout';
import { Button } from 'antd';
import "./index.less";

const PageContainer: React.FC<PageContainerProps> = (props) => {
  const { children, footer } = props;

  const efooter = useMemo(() => {
    /** 表单顶部合并 以及通用方法引入 */
    let mergedFormButtons: React.ReactNode[] = [];
    if (Array.isArray(footer)) {
      mergedFormButtons = footer.map((item: any, index: number) => {
        const buttonProps = item;
        const { buttonType, text, ...resprops } = buttonProps;
        return (
          <Button key={`formButton${index}`} {...resprops}>
            {text}
          </Button>
        );
      });
    }
    return mergedFormButtons;
  }, [footer]);

  return (
    <APageContainer {...props} footer={efooter}>
      {children}
    </APageContainer>
  );
};

export default PageContainer;
