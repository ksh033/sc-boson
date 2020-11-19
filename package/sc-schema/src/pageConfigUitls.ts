/* eslint-disable max-len */
import _ from 'lodash'
import {
  PageConfig,
  FormItem,
  FormConfig,
  QueryConfigItem,
  ProColumn,
  FormFilterProp,
  SearchFilterProp,
  TableFilterProp,
} from './interface'
import { cmps } from './register'

const getRequest = (item: any, pageConfig: PageConfig) => {
  const { service } = pageConfig
  const { props } = item
  if (props && props.request) {
    if (service && service[props.request]) {
      item.props = {
        ...item.props,
        request: service[props.request],
      }
    }
  }

  return item
}

const getConfig = (nodeType: string, pageConfig: PageConfig) => {
  let typeConfig: any = null
  switch (nodeType) {
    case 'event':
      typeConfig = pageConfig.event
      break
    case 'formConfig':
      typeConfig = pageConfig.formConfig
      break
    case 'queryConfig':
      typeConfig = pageConfig.queryConfig
      break
    case 'service':
      typeConfig = pageConfig.service
      break
    case 'tableConfig':
      typeConfig = pageConfig.tableConfig
      break
    default:
      break
  }
  return typeConfig
}

// 过滤表单项
/**
 *
 * @param pageConfig 页面配置对象
 * @param filter  过滤条件
 */

const filterFormConfig = (pageConfig: PageConfig, filter: FormFilterProp) => {
  let newFormInfos: any[] = []
  const { nodeType = "formConfig", action, fieldsProp, callBack, key } = filter
  const typeConfig: any = getConfig(nodeType, pageConfig)
  if (typeConfig) {
    let itemInfos: Array<FormConfig> = []
    if (_.isArray(typeConfig)) {
      itemInfos = _.cloneDeep(typeConfig)
    } else {
      itemInfos = _.cloneDeep(typeConfig[key || ''])
    }
    if (itemInfos && itemInfos.length > 0) {
      newFormInfos = itemInfos.map((element: FormConfig) => {
        const groupItems: any[] = []
        const { group, items } = element
        items.forEach((it: FormItem) => {
          let item = it;
          if (!item) {
            groupItems.push(item)
            return
          }
          // 获取组建属性
          if (!item.props) {
            item.props = {}
          }
          // 获取组建表单属性,用于getFieldDecorator(id, options)
          if (!item.formItemProps) {
            item.formItemProps = {}
          }
          // 有不同操作时覆盖对应不同的值
          if (action && item[action]) {
            const itenOtherProps = item[`${action}`] || {}
            item = _.defaultsDeep(item, itenOtherProps)
          }
          
          // 查找注册组建
          if (item.component && cmps[item.component]) {
            item.component = cmps[item.component]
          } else {
            item.component = cmps.Input
          }

          if (Array.isArray(item.children) && item.children.length > 0) {
            item.children.forEach((ite: any) => {
              if (ite.component && cmps[ite.component]) {
                ite.component = cmps[ite.component]
              } else {
                ite.component = cmps.Input
              }
            })
          }

          let extProps = null
          if (typeof item.name === 'string') { 
            if (fieldsProp && fieldsProp[item.name]) {
              if (_.isFunction(fieldsProp[item.name])) {
                extProps = fieldsProp[item.name](item)
              } else {
                extProps = fieldsProp[item.name]
              }
            }
          }
          if (Array.isArray(item.name)) { 
            const fieldsName = item.name.join(".")
            if (fieldsProp && fieldsProp[fieldsName]) {
              if (_.isFunction(fieldsProp[fieldsName])) {
                extProps = fieldsProp[fieldsName](item)
              } else {
                extProps = fieldsProp[fieldsName]
              }
            }
          }

        
          // 查找注册远程请求
          item = getRequest(item, pageConfig)
          // 业务字段属性覆盖，用于事件或其它需要根据业务需要控制组建属性
          if (extProps) {
            if (extProps.formProps) {
              item.formItemProps = {
                ...item.formItemProps,
                ...extProps.formProps,
              }
            }
            if (extProps.props) {
              item.props = { ...item.props, ...extProps.props }
            }
          }

          // item={...item,{...props,...otherprops}}
          // 自由控制属性
          if (callBack) {
            const re = callBack(item, group || '')
            if (re !== false) {
              // 为false时字段不返回
              groupItems.push(item)
            }
          } else {
            groupItems.push(item)
          }
        })
        element.items = groupItems
        return element
      })
    }
  }
  return newFormInfos
}

const filterSearchConfig = (
  pageConfig: PageConfig,
  filter: SearchFilterProp
) => {

  const newSearchInfos: any = []
  const { nodeType="queryConfig", action } = filter
  let typeConfig: any = getConfig(nodeType, pageConfig)
  typeConfig = action ? typeConfig[action] : typeConfig

  if (typeConfig) {
    const typeConfigCopy = _.cloneDeep(typeConfig)
    typeConfigCopy.forEach((item: QueryConfigItem) => {
      const { component, props } = item
      // 查找注册组建
      if (component && cmps[component]) {
        item.component = cmps[component]
      }
      if (Array.isArray(item.children) && item.children.length > 0) {
        item.children.forEach((ite) => {
          if (ite.component && cmps[ite.component]) {
            ite.component = cmps[ite.component]
          }
        })
      }

      // 查找注册远程请求
      item = getRequest(item, pageConfig)
      // 获取组建属性
      if (!props) {
        item.props = {}
      }
      newSearchInfos.push(item)
    })
  }
  return newSearchInfos
}
const filterPageConfig = (pageConfig: PageConfig, filter: TableFilterProp) => {
  const { nodeType="tableConfig", key, callBack } = filter
  const newFormInfos: any = []
  const typeConfig: any = getConfig(nodeType, pageConfig)
  if (typeConfig) {
    let itemInfos = []
    if (_.isArray(typeConfig)) {
      itemInfos = _.cloneDeep(typeConfig)
    } else {
      itemInfos = _.cloneDeep(typeConfig[key || ''])
    }
    if (itemInfos) {
      itemInfos.forEach((element: ProColumn) => {
        const { component } = element
        if (component && cmps[component]) {
          element.component = cmps[component]
        }
        // 查找注册远程请求
        element = getRequest(element, pageConfig)
        if (callBack) {
          const re = callBack(element)
          if (re !== false) {
            newFormInfos.push(re)
          }
        } else {
          newFormInfos.push(element)
        }
      })
    }
  }
  return newFormInfos
}

export const getFormInfo = (
  pageConfig: PageConfig,
  key: string | undefined,
  fieldsProp: any = {},
  callBack: any = null,
  action: any = null
) =>
  filterFormConfig(pageConfig, {
    nodeType: 'formConfig',
    key,
    callBack,
    action,
    fieldsProp,
  })
export const getTableInfo = (
  pageConfig: PageConfig,
  key: string | undefined,
  callBack: any,
  action: any
) =>
  filterPageConfig(pageConfig, {
    nodeType: 'tableConfig',
    key,
    callBack,
    action,
  })
export const getSearchInfo = (
  pageConfig: PageConfig,
  key: string | undefined,
  callBack: any,
  action: any
) =>
  filterSearchConfig(pageConfig, {
    nodeType: 'queryConfig',
    key,
    callBack,
    action,
  })

// const getFormInfo = (pageConfig:PageConfig,formFilter:FormFilterProp={nodeType:"formConfig"}) => filterFormConfig(pageConfig, formFilter)
// const getTableInfo = (pageConfig:PageConfig, tableFilter:TableFilterProp={nodeType:"tableConfig"}) => filterPageConfig(pageConfig, tableFilter)
// const getSearchInfo = (pageConfig:PageConfig, searchFilter:SearchFilterProp={nodeType:"queryConfig"}) => filterSearchConfig(pageConfig, searchFilter)
// #endregion
const schema = {
  getFormInfo,
  getTableInfo,
  getSearchInfo,
}
export default schema
