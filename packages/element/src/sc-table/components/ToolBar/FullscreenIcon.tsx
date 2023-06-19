import React, { useEffect, useState } from 'react';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { isBrowser } from '@ant-design/pro-utils';

const FullScreenIcon = () => {
  //onst intl = useIntl();
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  useEffect(() => {
    if (!isBrowser()) {
      return;
    }
    document.onfullscreenchange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
  }, []);
  return fullscreen ? (
    <Tooltip title={'退出全屏'}>
      <FullscreenExitOutlined />
    </Tooltip>
  ) : (
    <Tooltip title={'全屏'}>
      <FullscreenOutlined />
    </Tooltip>
  );
};

export default React.memo(FullScreenIcon);
