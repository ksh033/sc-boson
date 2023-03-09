import transformRoute from './transformRoute';

import type { MenuDataItem, Route, MessageDescriptor } from '../typings';

function fromEntries(iterable: any) {
  return [...iterable].reduce((obj: Record<string, MenuDataItem>, [key, val]) => {
    // eslint-disable-next-line no-param-reassign
    obj[key] = val;
    return obj;
  }, {});
}



function fromMaps(iterable: MenuDataItem[], menuMap: Record<string, MenuDataItem>) {
  iterable.forEach((item) => {

    const { key, children } = item
    menuMap[key as string] = item
    if (children && children.length > 0) {
      fromMaps(children, menuMap)
    }

  })
}

export default (
  routes: Route[],
  menu?: { locale?: boolean },
  formatMessage?: (message: MessageDescriptor) => string,
  menuDataRender?: (menuData: MenuDataItem[]) => MenuDataItem[],
) => {
  const { menuData, breadcrumb } = transformRoute(
    routes,
    menu?.locale || false,
    formatMessage,
    true,
  );
  if (!menuDataRender) {
    return {
      breadcrumb: fromEntries(breadcrumb),
      breadcrumbMap: breadcrumb,
      menuData,
    };
  }
  const customMenuData: MenuDataItem[] = menuDataRender(menuData);


  const menuMap: Record<string, MenuDataItem> = {}
  if (customMenuData) {
    fromMaps(customMenuData, menuMap)

  }
  const renderData = transformRoute(
    menuDataRender(menuData),
    menu?.locale || false,
    formatMessage,
    true,
  );
  const editListUrl: { key: string, item: MenuDataItem }[] = [];
  renderData.breadcrumb.forEach((menuItem, key) => {

    const editKey = `${key}/:editpage`

    if (breadcrumb.get(editKey)) {
      editListUrl.push({ key: editKey, item: breadcrumb.get(editKey) as MenuDataItem })
    }

  })
  editListUrl.forEach(({ key, item }) => {
    renderData.breadcrumb.set(key, item)
  })
  return {
    breadcrumb: fromEntries(renderData.breadcrumb),
    breadcrumbMap: renderData.breadcrumb,
    menuData: renderData.menuData,
    menuMap
  };
};
