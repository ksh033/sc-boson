import * as React from 'react';
import { Modal } from 'antd';
import { ModalProps } from 'antd/lib/modal';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import './style';

const { useState, useMemo, useLayoutEffect } = React;

export interface ScModalProps extends ModalProps {
  canMove?: boolean;
  wrapClassName?: string;
  showFullscreen?: boolean;
  fullscreen?: boolean;
  onToggleFullscreen?: any;
  showHeader?: boolean;
  children: React.ReactElement;
}

const ScModal: React.FC<ScModalProps> = (props: ScModalProps) => {
  const {
    wrapClassName = '',
    showHeader = true,
    showFullscreen,
    fullscreen,
    onToggleFullscreen,
    canMove,
    children,
    ...resProps
  } = props;

  const [state, setState] = useState({
    x: 0,
    y: 100,
    mouseX: 0,
    mouseY: 0,
  });
  const [moveDom, setDoveDom] = useState(null);
  const [enabledMove, setEnabledMove] = useState(false);

  useLayoutEffect(() => {
    if (canMove) {
      window.addEventListener('mousedown', startMove);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', endMove);
    }
    return () => {
      if (canMove) {
        window.removeEventListener('mousedown', startMove);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', endMove);
      }
    };
  }, []);

  const endMove = () => {
    setEnabledMove(false);
  };

  const handleMove = (e: any) => {
    const { x, y, mouseX, mouseY } = state;
    let _moveDom: any = moveDom;
    if (enabledMove && _moveDom) {
      //模态窗的宽高
      const winW = document.body.offsetWidth,
        winH = document.body.offsetHeight;
      const w = _moveDom.offsetWidth,
        h = _moveDom.offsetHeight;

      let offsetX = e.screenX - mouseX,
        offsetY = e.screenY - mouseY;
      let targetX = x + offsetX,
        targetY = y + offsetY;
      if (targetX < (-winW + w) / 2) {
        targetX = (-winW + w) / 2;
      }
      if (targetX > (winW - w) / 2) {
        targetX = (winW - w) / 2;
      }
      if (targetY < 0) {
        targetY = 0;
      }
      if (targetY > winH - h) {
        targetY = winH - h;
      }

      _moveDom.style.left = targetX + 'px';
      _moveDom.style.top = targetY + 'px';

      setDoveDom(_moveDom);
    }
  };

  const startMove = (e: any) => {
    const { className } = e.target;
    if (className && className === 'ant-modal-title') {
      e.preventDefault();
      const parentNode = e.target.parentNode.parentNode.parentNode;
      //console.log('startMove')
      //启动移动，并初始化偏移值
      let _x = 0,
        _y = 100;
      if (parentNode.style.top) {
        _x = parseInt(parentNode.style.left);
        _y = parseInt(parentNode.style.top);
      }
      setState(oldState => ({
        ...oldState,
        ...{
          x: _x,
          y: _y,
          mouseX: e.screenX,
          mouseY: e.screenY,
        },
      }));
      setEnabledMove(true);
      setDoveDom(parentNode);
    }
  };

  let fullsreenControl = useMemo(() => {
    let _fullsreenControl = null;
    if (showFullscreen) {
      const iconProps = {
        onClick: () => {
          if (onToggleFullscreen) {
            onToggleFullscreen(fullscreen);
          }
        },
      };
      _fullsreenControl = fullscreen ? (
        <span {...iconProps} className="sc-modal-full-screen">
          <FullscreenExitOutlined />
        </span>
      ) : (
        <span {...iconProps} className="sc-modal-full-screen">
          <FullscreenOutlined />
        </span>
      );
    }
    return _fullsreenControl;
  }, [showFullscreen, fullscreen]);

  const _wrapClassName = useMemo(() => {
    let _className = wrapClassName;
    if (showFullscreen) {
      _className =
        _className + ' ' + (fullscreen ? 'fullscreen-modal' : '') + ' c-modal';
    }
    if (!showHeader) {
      _className = _className + ' ' + 'c-modal-hide-header';
    }
    return _className;
  }, [wrapClassName, showFullscreen, fullscreen]);

  return (
    <Modal wrapClassName={_wrapClassName} {...resProps}>
      {fullsreenControl}
      {children}
    </Modal>
  );
};

export default ScModal;
