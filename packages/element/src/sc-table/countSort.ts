import type { SortValueList } from './container';
import type { SorterItem } from './typing';

export function changeCountSort(_sorter: any, _sortOrderMap: SorterItem) {
  const ordersMap: SorterItem = {};
  let innerSorter = _sorter;

  if (Array.isArray(_sorter)) {
    innerSorter = [];
    const sortOrderMap = _sortOrderMap || {};
    // 为了给_sorter排序用
    const newSorterMap = {};
    // 旧的排序
    const oldSortList: Partial<SortValueList>[] = [];
    // 新增加的排序
    const newSortList: Partial<SortValueList>[] = [];
    // 新的全部排序
    _sorter.forEach((it) => {
      newSorterMap[it.field] = it;
      if (it.order != null) {
        if (sortOrderMap[it.field]) {
          oldSortList.push({
            ...sortOrderMap[it.field],
            value: it.order,
            dataIndex: it.field,
          });
        } else {
          newSortList.push({
            value: it.order,
            dataIndex: it.field,
          });
        }
      }
    });
    // 获取权重
    let maxWi = 1;
    if (oldSortList.length > 0) {
      oldSortList.sort((a, b) => {
        return Number(a.multiple || 0) - Number(b.multiple || 0);
      });
      maxWi = Number(oldSortList[oldSortList.length - 1].multiple);
    }
    maxWi = maxWi + 1;

    // 格式化新的排序
    [...oldSortList, ...newSortList].forEach((it, index) => {
      if (it.dataIndex) {
        innerSorter.push(newSorterMap[it.dataIndex]);
        let multiple = it.multiple;
        if (multiple == null) {
          multiple = maxWi;
          maxWi++;
        }
        ordersMap[it.dataIndex || ''] = {
          value: it.value || 'ascend',
          multiple: multiple,
          showNum: index + 1,
        };
      }
    });

    // 格式化排序
  }

  // 因为复合表头每次只返回一个如果做复合排序需要的是覆盖而不是替换
  if (Object.prototype.toString.call(_sorter) === '[object Object]' && _sorter !== null) {
    const { field, order } = _sorter;
    // // 是否是复合查询
    // if (multipleSort) {
    //   ordersMap = _sortOrderMap || {};
    // }

    // const keys = Object.keys(ordersMap);
    // let maxWi = 1;
    // keys.forEach((key: string) => {
    //   if (ordersMap[key] && ordersMap[key].sort > maxWi) {
    //     maxWi = ordersMap[key].sort;
    //   }
    // });

    // 有没有排序
    if (order) {
      // 新增
      ordersMap[field] = {
        value: order,
        multiple: 1,
        showNum: 1,
      };
      // // 替换
      // if (ordersMap[field]) {
      //   ordersMap[field] = {
      //     ...ordersMap[field],
      //     value: order,
      //   };
      // } else {
      //   // 新增
      //   ordersMap[field] = {
      //     value: order,
      //     sort: maxWi + 1,
      //     showNum: keys.length + 1,
      //   };
      // }
    }

    innerSorter = Object.keys(ordersMap).map((key) => {
      return {
        columnKey: key,
        field: key,
        order: ordersMap[key],
      };
    });
  }

  return {
    ordersMap,
    innerSorter,
  };
}
