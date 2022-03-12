/* eslint-disable no-param-reassign */
import React from 'react';
import { PlusCircleOutlined, MinusCircleOutlined, EditOutlined } from '@ant-design/icons';

export function updateTreeData(list: any[], key: React.Key, node: any): any[] {
  return list.map((item: any) => {
    if (item.children) {
      item.children = updateTreeData(item.children, key, node);
    }
    if (item.key === key) {
      return {
        ...item,
        ...node,
      };
    }
    return item;
  });
}

export function deleteTreeData(list: any[], key: React.Key, node: any): any[] {
  return list
    .map((item) => {
      if (item.children) {
        const children = deleteTreeData(item.children, key, node);
        item.children = children;
        item.isLeaf = !(Array.isArray(children) && children.length > 0);
      }
      if (item.key !== key) {
        return item;
      }
      return null;
    })
    .filter((item) => item != null);
}

export function addTreeData(
  list: any[],
  key: React.Key,
  node: any,
  valueField: string,
  isRoot?: boolean,
): any[] {
  if (isRoot) {
    return [...list.filter((it: any) => it[valueField] !== node[valueField]), node];
  }
  return list.map((item) => {
    if (item.children) {
      item.children = addTreeData(item.children, key, node, valueField);
    }
    if (item.key === key) {
      item.isLeaf = false;
      item.children = item.children
        ? [...item.children.filter((it: any) => it[valueField] !== node[valueField]), node]
        : [node];
      return item;
    }
    return item;
  });
}

export const defaultNode = (
  rowData: any,
  type: 'add' | 'edit' | 'del',
  callback: (rowData: any) => void,
) => {
  let icon = <PlusCircleOutlined />;
  switch (type) {
    case 'add':
      icon = <PlusCircleOutlined />;
      break;
    case 'edit':
      icon = <EditOutlined />;
      break;
    case 'del':
      icon = <MinusCircleOutlined />;
      break;
    default:
      icon = <PlusCircleOutlined />;
      break;
  }

  return (
    <a
      
      onClick={async (e) => {
        e.stopPropagation();
        callback(rowData);
      }}
    >
      {icon}
    </a>
  );
};
