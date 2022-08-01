import React, { useRef, useState } from 'react';
import ScEditableTable from '../index';
import { Input, Select } from 'antd';
import type { ActionType } from '../typing';

const { Option } = Select;

interface DataProps {
  id: number;
  key?: number;
  name?: string;
  age?: number;
}

export default () => {
  const defaultData: any[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i: number = 0; i < 10; i++) {
    defaultData.push({
      id: i,
      key: i,
      name: `name${i}`,
      age: i + 1,
    });
  }
  const actionRef = useRef<ActionType>();
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  const [dataSource, setDataSource] = useState<DataProps[]>(() => defaultData);
  const [newRecord, setNewRecord] = useState({
    id: Math.random() * 1000000,
  });
  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '25%',
      component: Input,
      editable: true,
    },
    {
      title: 'age',
      dataIndex: 'age',
      width: '15%',
      component: Input,
      editable: true,
    },
    {
      title: 'address',
      dataIndex: 'label',
      width: '40%',
      component: (
        <Select>
          <Option value="1">Option 1</Option>
          <Option value="2">Option 2</Option>
          <Option value="3">Option 3</Option>
        </Select>
      ),
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'options',
      render: (text: any, record: any, _: any, action: { startEditable: (arg0: any) => void }) => [
        <a
          key="editable"
          onClick={() => {
            action.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            setDataSource(dataSource.filter((item: any) => item.id !== record.id));
          }}
        >
          删除
        </a>,
      ],
    },
  ];
  // console.log(actionRef);

  return (
    <ScEditableTable<DataProps>
      columns={columns}
      value={dataSource}
      rowKey="id"
      actionRef={actionRef}
      onChange={setDataSource}
      recordCreatorProps={{
        record: newRecord,
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        onSave: async () => {
          setNewRecord({
            id: Math.random() * 1000000,
          });
        },
        onChange: setEditableRowKeys,
      }}
    />
  );
};
