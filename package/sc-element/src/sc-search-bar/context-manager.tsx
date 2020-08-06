import React from 'react'
import { FormInstance } from 'antd/lib/form'

export interface MyContextProps {
  toggleForm?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  handleFormReset?: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => void
  form?: FormInstance
  getState?: Function
}

export const MyContext = React.createContext<MyContextProps>({})
