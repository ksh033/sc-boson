import React, { useContext, useState, useEffect, useRef, useMemo } from 'react'
import { useUpdateEffect } from '@umijs/hooks'
import { Input, Form, Table } from 'antd'
import { TableProps } from 'antd/es/table/Table'

const EditableContext = React.createContext<any>({})

interface EditableRowProps {
  index: number
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

interface EditableCellProps {
  title: React.ReactNode
  editable: boolean
  children: any
  dataIndex: string
  record: any
  editor: any
  handleSave: (record: any) => void
  onClick: (record: any) => void
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  editor,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<any>()
  const form = useContext(EditableContext)

  useEffect(() => {
    if (editing) {
      inputRef.current.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    if (record) {
      form && form.setFieldsValue({ [dataIndex]: record[dataIndex] })
    }
  }

  const save = async (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.stopPropagation()
    try {
      if (form) {
        const values = await form.validateFields()

        toggleEdit()
        handleSave({ ...record, ...values })
      }
    } catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  let childNode = children

  let component = <Input />
  let options = {}
  if (editor) {
    component = editor.component ? editor.component : editor
    options = editor.options ? editor.options : {}
  }
  const newEditor = React.cloneElement(component, {
    ref: (node: any) => (inputRef.current = node),
    onBlur: save,
  })
  let _value = record && record[dataIndex]
  if (Object.prototype.toString.call(_value) === '[object Object]') {
    _value = _value['label']
  }

  if (editable) {
    childNode = editing ? (
      <Form.Item style={{ margin: 0 }} name={dataIndex} {...options}>
        {newEditor}
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap">{_value}</div>
    )
  }
  if (editable && !editing) {
    restProps['onClick'] = (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      toggleEdit()
    }
  }
  return <td {...restProps}>{childNode}</td>
}

export interface EditableTableProps extends TableProps<any> {
  data: any[]
  columns: any[]
  onSubmit?: (data: any[]) => void
  fromProps?: any
  children?: React.ReactNode
  mode?: string
  dataChange?: (data: any[]) => void
}

const EditableTable: React.FC<EditableTableProps> = (
  props: EditableTableProps
) => {
  const {
    data = null,
    columns = [],
    children,
    onSubmit,
    fromProps,
    dataChange,
    mode = 'table',
    ...resProps
  } = props
  const [dataSource, setDataSource] = useState(() => {
    return data || []
  })

  useUpdateEffect(() => {
    setDataSource(data || [])
  }, [data])

  const [wrapForm] = Form.useForm()

  const handleSave = (row: any) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, {
      ...item,
      ...row,
    })
    setDataSource(newData)
    dataChange && dataChange(newData)
  }

  const components: any = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  }
  const _columns = columns.map((col: any) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        editor: col.editor,
        handleSave: handleSave,
      }),
    }
  })

  const onFinish = () => {
    if (onSubmit) {
      onSubmit(dataSource)
    }
  }
  if (mode === 'table') {
    return (
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={_columns}
        {...resProps}
      />
    )
  } else {
    return (
      <Form onFinish={onFinish} form={wrapForm} {...fromProps}>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={_columns}
          {...resProps}
        />
        {props.children}
      </Form>
    )
  }
}

export default EditableTable
