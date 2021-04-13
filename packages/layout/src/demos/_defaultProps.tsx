import React from 'react';
import { SmileOutlined, CrownOutlined, TabletOutlined, AntDesignOutlined } from '@ant-design/icons';

export default {
  route: {
    path: '/',
    routes: [
   
      {
        path: '/admin',
        name: '商城',
        icon: <CrownOutlined />,
        access: 'canAdmin',
        component: './Admin',
        routes: [
          {
            path: '/admin/sub-page1',
            name: '一级页面',
            icon: <CrownOutlined />,
            component: './Welcome',
          },
          {
            path: '/admin/sub-page2',
            name: '二级页面',
            icon: <CrownOutlined />,
            component: './Welcome',
          },
          {
            path: '/admin/sub-page3',
            name: '三级页面',
            icon: <CrownOutlined />,
            component: './Welcome',
          },
        ],
      },
      {
        path: '/welcome',
        name: '店铺',
        icon: <SmileOutlined />,
        component: './Welcome',
      },
      {
        name: '央厨',
        icon: <TabletOutlined />,
        path: '/list',
        component: './ListTableList',
        routes: [
          {
            path: '/list/sub-page',
            name: '级列表',
            icon: <CrownOutlined />,
            routes: [
              {
                path: 'sub-sub-page1',
                name: '级列表页面2',
                icon: <CrownOutlined />,
                component: './Welcome',
              },
              {
                path: 'sub-sub-page2',
                name: '列表页面3',
                icon: <CrownOutlined />,
                component: './Welcome',
              },
              {
                path: 'sub-sub-page3',
                name: '列表页面4',
                icon: <CrownOutlined />,
                component: './Welcome',
              },
            ],
          },
          {
            path: '/list/sub-page2',
            name: '二级列表页面',
            icon: <CrownOutlined />,
            component: './Welcome',
          },
          {
            path: '/list/sub-page3',
            name: '三级列表页面',
            icon: <CrownOutlined />,
            component: './Welcome',
          },
        ],
      }
    ],
  },
  location: {
    pathname: '/',
  },
};
