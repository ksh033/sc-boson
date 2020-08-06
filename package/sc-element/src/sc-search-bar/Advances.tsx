import * as React from 'react'
import { MyContext } from './context-manager'

const { useContext } = React

const Advances: React.FC<React.PropsWithChildren<Element>> = (props: any) => {
  const { getState } = useContext(MyContext)
  const state = getState ? getState() : false
  const { children } = props
  if (state) return <div>{children}</div>
  else {
    return null
  }
}

export default Advances
