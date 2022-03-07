---
title: CModal 通用模态框
order: 3
nav:
  title: 组件
---

## CForm 通用模态框

## API

| 参数      | 说明                                                  | 类型   | 默认值 |
| --------- | ----------------------------------------------------- | ------ | ------ |
| url       | 展示页面的路由地址                                    | String |        |
| pageProps | 展示页面的属性（从页面传入）                          | Object |        |
| show      | 显示模态窗（非全屏） 例子： Cmodal.show(options);     |        |        |
| showFull  | 显示模态窗（非全屏） 例子： Cmodal.showFull(options); |        |        |

## options 参数说明

| 参数    | 说明       | 类型 | 默认值 |
| ------- | ---------- | ---- | ------ |
| content | 展示的内容 | 组件 | ---    |

## config 说明

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- | --- | --- | --- |
| afterClose | Modal 完全关闭后的回调 | function | [] |
| cancelButtonProps | cancel 按钮 props | [ButtonProps](https://ant.design/components/button-cn/#API) | [] |
| centered | 垂直居中展示 Modal | boolean | false |
| closable | 是否显示右上角的关闭按钮 | boolean | true |
| customToolbar | 增加自定义按钮 | array | [] |
| getContainer | 指定 Modal 挂载的 HTML 节点, false 为挂载在当前 dom | HTMLElement | () => HTMLElement | Selectors | false | document.body |
| onCancel | 点击遮罩层或右上角叉或取消按钮的回调 | function(e) | 无 |
| onOk | 点击确定回调 | function(e) | 无 |
| showHeader | 控制显示 Modal Header | boolean | true |
| showFullscreen | 设置为全屏， 设置后 fullscreen 属性无效 | boolean | false |
| zIndex | 设置 Modal 的 z-index | number |  |

其他属性参照 [Antd-Modal](https://ant.design/components/modal-cn/#API)
