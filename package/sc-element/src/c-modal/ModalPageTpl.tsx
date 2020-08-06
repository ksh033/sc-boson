import React, { useCallback } from 'react'
import { Button } from 'antd'

const ModalEditPageTpl: React.FC<any> = (props) => {
  const { toolbar, children } = props

  /**
   * 表单顶部合并 以及通用方法引入
   */
  const mergedFormButtons = useCallback(() => {
    return toolbar.map((item: any, index: number) => {
      const buttonProps = item
      const { buttonType, text, ...resprops } = buttonProps
      return (
        <Button key={`formButton${index}`} {...resprops}>
          {text}
        </Button>
      )
    })
  }, [toolbar])

  return (
    <div className="sc-modal-pagetpl">
      <div className="sc-modal-pagetpl-content">{children}</div>
      {toolbar ? (
        <div className="ant-modal-footer sc-modal-pagetpl-content-footer">
          {mergedFormButtons()}
        </div>
      ) : null}
    </div>
  )
}

export default ModalEditPageTpl
