import * as React from 'react';
import './style/index';

export interface ScIconsProps {
  color?: string;
  type: string;
  size?: string;
  text?: React.ReactNode | string;
  className?: string;
  style?: any;
  onClick?: (params: any) => void;
  isImg?: boolean;
  fillWord?: React.ReactNode | string;
}

// ScIcons 扩展图标组件 - 带点击事件、文字等
const ScIcons: React.FC<ScIconsProps> = (props) => {
  const {
    isImg = false,
    type = '',
    color,
    className = '',
    text,
    size = 'm',
    onClick = () => {},
    style,
    fillWord,
  } = props;

  let defaultcls = ['icon', 'bs-icon', `bs-icon-${size}`, className];
  if (!isImg) {
    defaultcls.push(`bs-icon-${type}`);
  }
  let cls = defaultcls.join(' ');

  let rtext: any;
  if (text) {
    rtext = text;
  }
  let stys = {};

  if (style) {
    stys = { ...style };
  }
  if (color) {
    stys = {
      ...stys,
      color: color,
    };
  }

  return (
    <div className={'bs-icon-box'} onClick={onClick}>
      <span>
        <span>{fillWord}</span>
        {!isImg ? (
          <svg className={cls} aria-hidden="true" style={stys}>
            <use xlinkHref={`#icon-${type}`} />
          </svg>
        ) : (
          <img src={type} style={stys} className={cls} />
        )}
      </span>
      {rtext}
    </div>
  );
};

export default ScIcons;
