import * as React from 'react'

interface ScFragmentProps {
  children: React.ReactElement
}

const ScFragment: React.FC<ScFragmentProps> = ({ children }) => {
  return <React.Fragment>{children}</React.Fragment>
}

export default ScFragment
