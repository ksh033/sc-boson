import * as React from 'react'

export interface DataComponentProps {
  textField?: any
  valueField?: string
  data?: any[]
  params?: any
  request?: (params: any) => Promise<void>
  onLoad?: (dataSource: any) => void
  modelKey?: string
  loading?: boolean
  autoload?: boolean
  model?: string
}

export type DataComponent = React.ComponentClass<DataComponentProps>
