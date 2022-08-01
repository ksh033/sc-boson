import React, { useRef } from 'react';
import type { ActionRenderFunction, ActionType } from '../index';
import ScTree from '../index';

export default () => {
  const saveRef = useRef<ActionType>();
  const initTreeDate = [
    { title: 'Expand to load', key: '0', isLeaf: false },
    { title: 'Expand to load', key: '1', isLeaf: false },
    { title: 'Tree Node', key: '2', isLeaf: true },
  ];

  const request = (params: any) => {
    // eslint-disable-next-line func-names
    return new Promise(function (reslove) {
      let data = initTreeDate;
      if (params !== null) {
        data = [
          { title: 'Child Node', key: `${params.key}-0`, isLeaf: false },
          { title: 'Child Node', key: `${params.key}-1`, isLeaf: false },
        ];
      }
      reslove(data);
    });
  };

  const actionRender: ActionRenderFunction<any> = (row: any, options) => {
    return {
      add: () => {
        options.add(row.key, {
          title: '子节点3',
          key: Math.ceil(Math.random() * 10000),
        });
      },
      edit: () => {
        options.edit(row.key, {
          title: '子节点3',
        });
      },
      delete: () => {
        options.delete(row.key, row);
      },
      extendAction: () => {
        return <div key={row.key}>13</div>;
      },
    };
  };
  return (
    <ScTree
      saveRef={saveRef}
      canSearch={false}
      placeholder={'search'}
      onSearch={(value: any) => {
        console.log(`the search value is ${value}`);
      }}
      async={true}
      actionRender={actionRender}
      data={initTreeDate}
      autoload={true}
      request={request}
    />
  );
};
