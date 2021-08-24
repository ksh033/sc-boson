/* eslint-disable react-hooks/rules-of-hooks */
import zhCN from 'antd/es/locale/zh_CN';
import React, {
  useState,
  useContext,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import {
  Table,
  Input,
  Popconfirm,
  Form,
  ConfigProvider,
  InputNumber,
} from 'antd';
import { useUpdateEffect } from 'ahooks';
import { TableProps } from 'antd/es/table/Table';

const EditableContext = React.createContext<any>(null);

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean; // 编辑状态
  rowEditable?: boolean; // 整行可编辑
  cellEditable?: boolean; // 单个属性是否可编辑
  inputType?: 'number' | 'text';
  required?: boolean;
  dataIndex: string;
  title: any;
  record: any;
  index: number;
  formItemPorpos?: any;
  props?: any;
  children: React.ReactNode;
  tableRender?: (
    dataIndex: string,
    value: any,
    record: any,
  ) => React.ReactElement;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  rowEditable = false,
  cellEditable = true,
  inputType = 'text',
  dataIndex,
  title,
  record,
  index,
  children,
  required,
  formItemPorpos,
  props,
  tableRender,
  ...restProps
}) => {
  const itemInputClassName = 'bs-edit-form-item-required';
  let inputNode =
    inputType === 'number' ? (
      <InputNumber min={0} {...props} />
    ) : (
      <Input {...props} />
    );
  if (tableRender) {
    inputNode = tableRender(dataIndex, record[dataIndex], record);
  }
  if (!cellEditable) {
    return <td>{children}</td>;
  }
  if (!rowEditable) {
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            {...formItemPorpos}
            {...restProps}
            className={required ? itemInputClassName : ''}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  } else {
    return (
      <td {...restProps}>
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          {...formItemPorpos}
          className={required ? itemInputClassName : ''}
        >
          {inputNode}
        </Form.Item>
      </td>
    );
  }
};

interface EditableRowProps {
  index: number;
  record: any;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  rowHeadRender?: (record: any, index: number) => ReactNode;
}

const EditableRow: React.FC<EditableRowProps> = ({
  index,
  record,
  rowHeadRender,
  onValuesChange,
  ...props
}) => {
  const [form] = Form.useForm();
  const colSpan: number = Array.isArray(props.children)
    ? props.children.length
    : 0;

  useUpdateEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    }
  }, [record]);

  return (
    <Form
      form={form}
      component={false}
      initialValues={record}
      onValuesChange={onValuesChange}
    >
      {rowHeadRender ? (
        <tr className="ant-table-expanded-row ant-table-expanded-row-level-1">
          <td colSpan={colSpan}>
            {rowHeadRender ? rowHeadRender(record, index) : null}
          </td>
        </tr>
      ) : null}
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

export interface EditableTableProps<T> extends TableProps<T> {
  data?: { rows: any[]; total?: number; current?: number; size?: number }; // 列表数据
  request?: (params: any) => Promise<void>; // 请求数据的远程方法
  onLoad?: (data: any) => void; // 数据加载完成后触发,会多次触发
  params?: any; // 请求的参数
  className?: string; // 样式
  pageSize?: number; // 每页显示多少数据
  autoload?: boolean; // 是否自动加载 配合request使用
  saveText?: string;
  cancelText?: string;
  rowHeadRender?: (record: any, index: number) => ReactNode;
  showEditOperation?: boolean; // 是否显示修改等操作
  saveRef?: React.MutableRefObject<any> | ((saveRef: any) => void); // 获取组件对外暴露的参数
  onSubmit?: (key: string, values: any, reocrd: any) => void;
  onDataEditFn?: (data: any[]) => void;
  rowKey?: string;
}

const EditableTable = (props: EditableTableProps<any>) => {
  const {
    data = { rows: [], total: 0, current: 1, size: 10 },
    pageSize = 10,
    autoload,
    saveRef,
    params,
    onLoad,
    request,
    saveText = '提交',
    cancelText = '取消',
    columns = [],
    rowHeadRender,
    onSubmit,
    onDataEditFn,
    rowKey = 'key',
    showEditOperation = true,
    ...restPros
  } = props;
  const isGone = useRef(false);
  const tableRef = useRef<any>();
  const [dataSource, setData] = useState(data);
  const [editingKey, setEditingKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: data.current || 1,
    pageSize: data.size ? data.size : pageSize,
    total: data.total || 0,
  });
  const isEditing = (record: any) => record[rowKey] === editingKey;

  const edit = (record: any) => {
    setEditingKey(record[rowKey]);
  };

  const loadData = async () => {
    const { current } = pagination;
    const payload = {
      size: pagination.pageSize,
      current,
      ...params,
      // ...filters,
      // ...sorter,
    };
    if (!request) {
      throw 'no remote request method';
    }

    try {
      setLoading(true);
      let _data: any = await request(payload);
      if (isGone.current) return;
      if (onLoad) {
        _data = onLoad(_data);
      }
      setData(_data);
      setEditingKey('');
      tableRef.current = _data;
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getData = () => {
    return tableRef.current;
  };

  const getSaveRef = () => {
    const userAction = {
      getData,
      reload: () => {
        loadData();
      },
    };
    if (saveRef && typeof saveRef === 'function') {
      saveRef(userAction);
    }
    if (saveRef && typeof saveRef !== 'function') {
      saveRef.current = userAction;
    }
  };

  const save = async (key: string, form: any) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource.rows];
      const index = newData.findIndex(item => key === item[rowKey]);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
      } else {
        newData.push(row);
      }
      setData(() => {
        return {
          ...dataSource,
          rows: newData,
        };
      });
      setEditingKey('');
      if (onDataEditFn) {
        onDataEditFn(newData);
      }
      if (onSubmit) {
        onSubmit(key, row, newData[index]);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    } finally {
      form && form.resetFields();
    }
  };

  // 合并操作列
  const mergeCustomColumns = columns.map((item: any) => {
    if (item.dataIndex === 'opertaion') {
      return {
        ...item,
        title: item.title ? item.title : '操作',
        width: item.width ? item.width : '300px',
        render: (_: any, record: any, index: number) => {
          const render = item.render
            ? item.render
            : () => {
                return [];
              };
          const form = useContext(EditableContext);
          const editable = isEditing(record);
          const rowEditable = record.editable;
          if (showEditOperation) {
            if (rowEditable !== null && rowEditable !== undefined) {
              if (rowEditable) {
                return (
                  <span>
                    <a
                      onClick={() => save(record[rowKey], form)}
                      style={{ marginRight: 12 }}
                    >
                      {saveText}
                    </a>
                    {render(_, record, index)}
                  </span>
                );
              } else {
                return editable ? (
                  <span>
                    <a
                      onClick={() => save(record[rowKey], form)}
                      style={{ marginRight: 12 }}
                    >
                      {saveText}
                    </a>
                    <Popconfirm
                      title="是否取消修改?"
                      onConfirm={() => {
                        setEditingKey('');
                      }}
                    >
                      <a style={{ marginRight: 12 }}>{cancelText}</a>
                    </Popconfirm>
                    {render(_, record, index)}
                  </span>
                ) : (
                  <span>
                    <a onClick={() => edit(record)} style={{ marginRight: 12 }}>
                      修改
                    </a>
                    {render(_, record, index)}
                  </span>
                );
              }
            } else {
              return <span> {render(_, record, index)}</span>;
            }
          } else {
            return <span> {render(_, record, index)}</span>;
          }
        },
      };
    }
    return item;
  });

  const onChange = (page: number) => {
    setPagination({
      current: page,
      pageSize: pagination.pageSize,
      total: data.total || 0,
    });
  };

  const onShowSizeChange = (current: number, size: number) => {
    setPagination({
      current,
      pageSize: size,
      total: data.total || 0,
    });
  };

  useEffect(() => {
    if (autoload) {
      loadData();
    }
    tableRef.current = data;
    getSaveRef();
    return () => {
      isGone.current = true;
    };
  }, []);

  useUpdateEffect(() => {
    if (autoload) {
      loadData();
    }
  }, [pagination.current, pagination.pageSize, params]);

  const mergedColumns = mergeCustomColumns.map((col: any) => {
    const editable = col.editable ? col.editable : false;
    if (!editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        dataIndex: col.dataIndex,
        inputType: col.inputType,
        formItemPorpos: col.formItemPorpos,
        required: col.required,
        props: col.props,
        rowEditable: record.editable ? record.editable : false,
        title: col.title,
        tableRender: col.tableRender,
        editing: isEditing(record), // 编辑状态
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const createProps = () => {
    const { rows, total } = dataSource;
    let _total = total;
    rows.forEach((item: any, index: number) => {
      item.key = index;
    });
    if (Array.isArray(rows) && rows.length > 0 && total === 0) {
      _total = rows.length;
    }
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
      total: _total,
      onChange,
      onShowSizeChange,
      showTotal: (rowTotal: any, range: any[]) =>
        `共${rowTotal}条记录,当前${range[0]}-${range[1]}条`,
      ...(restPros && restPros.pagination),
    };
    const tableProp: any = {
      loading,
      dataSource: rows || dataSource,
      columns: mergedColumns,
      pagination: paginationProps,
      ...restPros,
    };
    return tableProp;
  };

  const onValuesChange = (changedValues: any, allValues: any) => {
    const newData = [...tableRef.current.rows];
    const index = newData.findIndex(item => allValues[rowKey] === item[rowKey]);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...allValues,
      });
    } else {
      newData.push(allValues);
    }
    tableRef.current = {
      ...tableRef.current,
      rows: newData,
    };
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Table
        onRow={record => {
          return {
            record,
            onValuesChange,
            rowHeadRender,
          };
        }}
        bordered
        components={components}
        columns={mergedColumns}
        rowClassName="sc-editable-row"
        {...createProps()}
      />
    </ConfigProvider>
  );
};
export default EditableTable;
