import type H from 'history';
import type { BreadcrumbProps  } from 'antd';
import React from 'react';
import pathToRegexp from 'path-to-regexp';
import { compareVersions,isBrowser } from '@ant-design/pro-utils';
import { version } from 'antd';
import type {
  BreadcrumbItemType,
  ItemType,
} from 'antd/lib/breadcrumb/Breadcrumb';
import type { ProSettings } from '../defaultSettings';
import type { ProLayoutProps } from '../MasterLayout/index';
export const getVersion = () => {
  if (typeof process === 'undefined') return version;
  return process?.env?.ANTD_VERSION || version;
};

import type { MenuDataItem, MessageDescriptor, WithFalse } from '../typings';
import { urlToList } from './pathTools';

export type BreadcrumbProLayoutProps =  {
  breadcrumbList?: { title: string; href: string }[];
  home?: string;
  location?:
    | H.Location
    | {
        pathname?: string;
      };
  menu?: ProSettings['menu'];
  breadcrumbMap?: Map<string, MenuDataItem>;
  formatMessage?: (message: MessageDescriptor) => string;
  menuMap?:any,
  breadcrumbRender?: WithFalse<
    (routers: BreadcrumbProps['items']) => BreadcrumbProps['items']
  >;
  itemRender?: BreadcrumbProps['itemRender'];
    }
// 渲染 Breadcrumb 子节点
// Render the Breadcrumb child node
const defaultItemRender: BreadcrumbProps['itemRender'] = (route, _, routes) => {
  const { breadcrumbName, title, path } = route as BreadcrumbItemType & {
    breadcrumbName: string;
  };

  const last =
    routes.findIndex(
      (i) =>
        // @ts-ignore
        i.linkPath === route.path,
    ) ===
    routes.length - 1;

  return last ? (
    <span>{title || breadcrumbName}</span>
  ) : (
    <span onClick={path ? () => (location.href = path) : undefined}>
      {title || breadcrumbName}
    </span>
  );
};

const renderItemLocal = (
  item: MenuDataItem,
  props: BreadcrumbProLayoutProps,
): string => {
  const { formatMessage, menu } = props;
  if (item.locale && formatMessage && menu?.locale !== false) {
    return formatMessage({ id: item.locale, defaultMessage: item.name });
  }
  return item.name as string;
};
export const getBreadcrumb = (
  breadcrumbMap: Map<string, MenuDataItem>,
  url: string,
): MenuDataItem => {
  let breadcrumbItem = breadcrumbMap.get(url);
  if (!breadcrumbItem) {
    // Find the first matching path in the order defined by route config
    // 按照 route config 定义的顺序找到第一个匹配的路径
    const targetPath = [...breadcrumbMap.keys()].find((path) =>
      // remove ? ,不然会重复
      pathToRegexp(path.replace('?', '')).test(url),
    );
    if (targetPath) breadcrumbItem = breadcrumbMap.get(targetPath);
  }
  return breadcrumbItem || { path: '' };
};

export const getBreadcrumbFromProps = (
  props: BreadcrumbProLayoutProps,
): {
  location: BreadcrumbProLayoutProps['location'];
  breadcrumbMap: BreadcrumbProLayoutProps['breadcrumbMap'];
  menuMap:any
} => {
  const { location, breadcrumbMap, menuMap } = props;
  return {
    location,
    breadcrumbMap,
    menuMap
  };
};

const conversionFromLocation = (
  routerLocation: BreadcrumbProLayoutProps['location'],
  breadcrumbMap: Map<string, MenuDataItem>,
  props: BreadcrumbProLayoutProps,
  menuMap?: Record<string, MenuDataItem>,
): BreadcrumbProps['routes'] => {
  // Convertor the url to an array
  const pathSnippets = urlToList(routerLocation?.pathname);
  // Loop data mosaic routing

  const extraBreadcrumbItems: BreadcrumbProps['items'] = pathSnippets
    .map((url) => {
      // For application that has configured router base
      // @ts-ignore
      // const { routerBase = '/' } = isBrowser() ? window : {};
      // const realPath = routerBase === '/' ? url : `${routerBase}${url}`;
      // const currentBreadcrumb = getBreadcrumb(breadcrumbMap, url);

      // const name = renderItemLocal(currentBreadcrumb, props);
      // const { hideInBreadcrumb } = currentBreadcrumb;
      // return name && !hideInBreadcrumb
      //   ? {
      //     path: realPath,
      //     breadcrumbName: name,
      //     key: currentBreadcrumb.key,
      //     parentKeys: currentBreadcrumb.parentKeys,
      //     component: currentBreadcrumb.component,
      //   }
      //   : { path: '', breadcrumbName: '' };
      const currentBreadcrumb = getBreadcrumb(breadcrumbMap, url);
      const name = renderItemLocal(currentBreadcrumb, props);
      const { hideInBreadcrumb } = currentBreadcrumb;
      return name && !hideInBreadcrumb
        ? {
            linkPath: url,
            breadcrumbName: name,
            title: name,
            key:currentBreadcrumb.key,
            parentKeys:currentBreadcrumb.parentKeys,
            component: currentBreadcrumb.component,
          }
        : { linkPath: '', breadcrumbName: '', title: '' };
      
    })
    .filter((item) => item && item.linkPath);

  //本地路由目录结构与后端返回菜单不一致时，面包屑以后台菜单为主
  if (extraBreadcrumbItems.length > 0 && menuMap) {
    const lastItem: any = extraBreadcrumbItems[extraBreadcrumbItems.length - 1]
    // if (menuMap[lastItem.key]){

    // }
    const keys = [...lastItem.parentKeys, lastItem.key]

    const menuBreadcrumbItems: BreadcrumbProps['items'] = keys.map((tkey: any) => {
      const menuItemData = menuMap[tkey]
      const com = menuItemData.path ? breadcrumbMap.get(menuItemData.path) : null
      return {
        linkPath: menuItemData.path as string||"",
        path: menuItemData.path as string||"",
        breadcrumbName: menuItemData.name as string,
        // key: breadcrumbMap[Symbol].key,
        // parentKeys: currentBreadcrumb.parentKeys,
        component: com,
      }
    })
    if (menuBreadcrumbItems && menuBreadcrumbItems.length > extraBreadcrumbItems.length) {
      return menuBreadcrumbItems;
    }

  }



  return extraBreadcrumbItems;
};

export type BreadcrumbListReturn = Pick<
  BreadcrumbProps,
  
  Extract<keyof BreadcrumbProps, 'items' | 'itemRender'>
>&{
  menuMap:any
};


/** 将参数转化为面包屑 Convert parameters into breadcrumbs */
export const genBreadcrumbProps = (
  props: BreadcrumbProLayoutProps,
): BreadcrumbProps['items'] => {
  const { location, breadcrumbMap,menuMap } = getBreadcrumbFromProps(props);

  // 根据 location 生成 面包屑
  // Generate breadcrumbs based on location
  if (location && location.pathname && breadcrumbMap) {
    return conversionFromLocation(location, breadcrumbMap, props, menuMap,);
  }
  return [];
};


// 声明一个导出函数，接收两个参数：BreadcrumbProps和ProLayoutProps，返回一个BreadcrumbListReturn类型的对象
export const getBreadcrumbProps = (
  props: Omit<BreadcrumbProLayoutProps, 'breadcrumbRender'> & {
    breadcrumbRender?: WithFalse<
      (routers: BreadcrumbProps['items']) => BreadcrumbProps['items']
    >;
    menuMap?: Record<string, MenuDataItem>;
  }, // BreadcrumbProps类型的props
  layoutPros: ProLayoutProps, // ProLayoutProps类型的layoutPros
): BreadcrumbListReturn => {
// 解构赋值获取props中的breadcrumbRender和props中的itemRender，如果props中没有itemRender则使用默认的defaultItemRender函数
const { breadcrumbRender, itemRender: propsItemRender } = props;
// 解构赋值获取layoutPros.breadcrumbProps.minLenght的值，如果没有设置，则默认为2
const { minLength = 2 } = layoutPros.breadcrumbProps || {};
// 生成面包屑的路由数组，该数组中包含菜单项和面包屑项
const routesArray = genBreadcrumbProps(props);
// 如果props中有itemRender，则使用props中的itemRender，否则使用默认函数defaultItemRender
const itemRender: BreadcrumbProps['itemRender'] = (item, ...rest) => {
  const renderFunction = propsItemRender || defaultItemRender;
  return renderFunction?.(
    {
      ...item,
      // 如果item.linkPath存在，则使用item.linkPath，否则使用item.path
      // @ts-ignore
      path: item.linkPath || item.path,
    },
    ...rest,
  );
};
let items = routesArray as ItemType[] | undefined;
// 如果面包屑渲染函数breadcrumbRender存在，则使用其渲染数组items
if (breadcrumbRender) {
  items = breadcrumbRender(items || []) || undefined;
}
// 如果items（渲染后的数组）的长度小于minLength或者breadcrumbRender为false，则items为undefined
if ((items && items.length < minLength) || breadcrumbRender === false) {
  items = undefined;
}
// 如果当前 ant design 包的版本大于等于5.3.0，则返回一个对象{items,itemRender},否则返回一个对象{routes:item,itemRender}
return compareVersions(getVersion(), '5.3.0') > -1
  ? ({
      items,
      itemRender,
    } as BreadcrumbListReturn)
  : ({
      routes: items,
      itemRender,
    } as unknown as BreadcrumbListReturn);
};
