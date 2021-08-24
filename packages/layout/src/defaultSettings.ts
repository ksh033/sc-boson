import type { MenuTheme } from 'antd/es/menu/MenuContext';

import type {ProSettings} from '@ant-design/pro-layout'


const defaultSettings: ProSettings = {
  navTheme: 'dark',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: false,
  menu: {
    locale: false,
  },
  headerHeight: 48,
  title: '长嘴猫平台',
  iconfontUrl: '',
  primaryColor: 'daybreak',
  splitMenus: false,
};
export type {ProSettings} ;
export default defaultSettings;
