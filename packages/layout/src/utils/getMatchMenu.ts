import { pathToRegexp } from '@qixian.cs/path-to-regexp';

export interface Route extends MenuDataItem {
  routes?: Route[];
}

export interface MessageDescriptor {
  id: any;
  description?: string;
  defaultMessage?: string;
}

export interface MenuDataItem {
  children?: MenuDataItem[];
  hideChildrenInMenu?: boolean;
  hideInMenu?: boolean;
  icon?: any;
  locale?: string | false;
  name?: string;
  key?: string;
  pro_layout_parentKeys?: string[];
  path?: string;
  parentKeys?: string[];
  [key: string]: any;
}
export function stripQueryStringAndHashFromPath(url: string) {
  return url.split('?')[0].split('#')[0];
}

export const isUrl = (path: string): boolean => {
  if (!path.startsWith('http')) {
    return false;
  }
  try {
    const url = new URL(path);
    return !!url;
  } catch (error) {
    return false;
  }
};
/**
 * 获取打平的 menuData 已 path 为 key
 *
 * @param menuData
 */
export const getFlatMenus = (menuData: MenuDataItem[] = []): Record<string, MenuDataItem> => {
  let menus: Record<string, MenuDataItem> = {};
  menuData.forEach((item) => {
    if (!item || !item.key) {
      return;
    }

    menus[stripQueryStringAndHashFromPath(item.path ||item.key ||  '/')] = {
      ...item,
    };
    menus[item.path || item.key || '/'] = { ...item };

    if (item.children) {
      menus = { ...menus, ...getFlatMenus(item.children) };
    }
  });
  return menus;
};

export const findMenuItemByPath = (
  menuData: MenuDataItem[] = [],
  path: string,
): MenuDataItem | null => {
  let menusItem: any = null;
  menuData.forEach((item) => {
    if (!item || !item.path) {
      return;
    }
    if (menusItem) {
      return;
    }
    if (item.path === path) {
      menusItem = item;
    }
    if (item.children) {
      menusItem = findMenuItemByPath(item.children, path);
    }
  });
  return menusItem;
};

export const getMenuMatches = (
  flatMenuKeys: string[] = [],
  path: string,
  exact?: boolean,
): string[] | undefined => {
  return  flatMenuKeys.filter((item: any) => {
    if (item === '/' && path === '/') {
      return true;
    }
    if (item !== '/' && item !== '/*' && item && !isUrl(item)) {
      const pathKey = stripQueryStringAndHashFromPath(item);

      try {
        // exact
        if (exact) {
          if (pathToRegexp("".concat(pathKey)).test(path)) {
            return true;
          }
         
          if (pathToRegexp(`${pathKey}/(.*)`).test(path)) {
            return true;
          }
          
        } else {
          // /a
          if (pathToRegexp(`${pathKey}`, []).test(path)) {
            return true;
          }
          // /a/b/b
          if (pathToRegexp(`${pathKey}/(.*)`).test(path)) {
            return true;
          }
        }
      } catch (error) {
        // console.log(error, path);
      }
    }
    return false;
  }).sort((a, b) => {
    // 如果完全匹配放到最后面
    if (a === path) {
      return 10;
    }
    if (b === path) {
      return -10;
    }
    return a.substr(1).split('/').length - b.substr(1).split('/').length;
  }) as string[];
};
let flatMenus: any = null;
/**
 * 获取当前的选中菜单列表
 *
 * @param pathname
 * @param menuData
 * @returns MenuDataItem[]
 */
export const getMatchMenu = (
  pathname: string,
  menuData: MenuDataItem[],
  /** 要不要展示全部的 key */
  fullKeys?: boolean,
  exact?: boolean,
): MenuDataItem[] => {
  if (!flatMenus) {
    flatMenus = getFlatMenus(menuData);
  }
  const flatMenuKeys = Object.keys(flatMenus);
  let menuPathKeys = getMenuMatches(flatMenuKeys, pathname || '/', exact);

  if (!menuPathKeys || menuPathKeys.length < 1) {
    return [];
  }
  if (!fullKeys) {
    menuPathKeys = [menuPathKeys[menuPathKeys.length - 1]];
  }
if (flatMenus[pathname]){
  menuPathKeys = [menuPathKeys[menuPathKeys.length - 1]];
}
 // console.log(flatMenus[pathname])
  // console.log(menuPathKeys)
 // if
  const keys= menuPathKeys
    .map((menuPathKey) => {
      const menuItem = flatMenus[menuPathKey] || {
        pro_layout_parentKeys: '',
        key: '',
      };

      // 去重
      const map = new Map();
      const parentItems = (menuItem.parentKeys || [])
        .map((key: any) => {
          if (map.has(key)) {
            return null;
          }
          map.set(key, true);
          return flatMenus[key];
        })
        .filter((item: any) => item) as MenuDataItem[];
      if (menuItem.key) {
        parentItems.push(menuItem);
      }
      return parentItems;
    })
    .flat(1);
    return keys
};

export default getMatchMenu;
