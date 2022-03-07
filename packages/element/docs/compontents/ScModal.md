---
title: ScModal 弹窗
order: 10
nav:
  title: 组件
---

## ScModal 弹窗

对 Modal 组件的拓展，可全屏显示，可拖动位置。

## 代码演示

```jsx
/** Title: 基础 */
import React, { useState } from 'react';
import { ScModal } from 'sc-element';
import { Button } from 'antd';

export default () => {
  const [visible, setVisible] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div>
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        显示模态窗
      </Button>
      <ScModal
        showFullscreen={true}
        fullscreen={fullscreen}
        title="Basic Modal"
        visible={visible}
        onOk={() => {
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
        onToggleFullscreen={(_fullscreen) => {
          setFullscreen(!_fullscreen);
        }}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </ScModal>
    </div>
  );
};
```

## API

## ScModalProps

弹窗。

| 参数               | 说明                     | 类型               | 默认值 |
| ------------------ | ------------------------ | ------------------ | ------ |
| showFullscreen     | 是否开启全屏功能         | boolean            | false  |
| fullscreen         | 全屏状态                 | boolean            | false  |
| onToggleFullscreen | 切换全屏状态后触发的方法 | function(status){} | null   |

更多 api 请访问[Modal](https://ant.design/components/modal-cn/)。
