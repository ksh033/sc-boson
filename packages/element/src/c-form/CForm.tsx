/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo } from 'react';
import { Row, Form,  Col, Anchor, Space } from 'antd';
import type { FormProps } from 'antd/es/form';
import _ from 'lodash';
import classnames from 'classnames';
import ViewItem from './ViewItem';
import './style/index';
import type {  FormConfig, FormItemProp } from './interface';

const FormItem = Form.Item;
const { Link } = Anchor;
// const Panel = Page.PagePanel;

export function deepGet(obj: any, keys: any, defaultVal?: any): any {
  return (
    (!Array.isArray(keys) ? keys.replace(/\[/g, '.').replace(/\]/g, '').split('.') : keys).reduce(
      (o: any, k: any) => (o || {})[k],
      obj,
    ) || defaultVal
  );
}

export interface CFormProps extends FormProps {
  formConfig: FormConfig[];
  anchor?: boolean|any;
  action: 'edit' | 'add' | 'view';
  form: any;
}
const WIDTH_SIZE_ENUM = {
  // 适用于短数字，短文本或者选项
  xs: 104,
  s: 216,
  // 适用于较短字段录入、如姓名、电话、ID 等。
  sm: 216,
  m: 328,
  // 标准宽度，适用于大部分字段长度。
  md: 328,
  l: 440,
  // 适用于较长字段录入，如长网址、标签组、文件路径等。
  lg: 440,
  // 适用于长文本录入，如长链接、描述、备注等，通常搭配自适应多行输入框或定高文本域使用。
  xl: 552,
};
const CForm: React.FC<CFormProps> = (props) => {
  const {
    formConfig = [],
    layout = 'horizontal',
    labelCol = {},
    wrapperCol = {},
    labelAlign = 'right',
    anchor = false,

    initialValues,
    action,
    form,
    ...respPorps
  } = props;
  const formProps = { layout, labelCol, wrapperCol, labelAlign, ...respPorps };
  const [waForm] = Form.useForm();

  useEffect(() => {
    if (form && typeof form === 'function') {
      form(waForm);
    }
    if (form && typeof form !== 'function') {
      form.current = waForm;
    }
  }, []);

  useEffect(() => {
    if (initialValues) {
      waForm.setFieldsValue(initialValues);
    }
  }, [initialValues]);

  const convertData = (name: string|string[], dataName: string, _props: any, data: any) => {
    let itemValue;
    if (_.isArray(name)){
      name.forEach((key)=>{
        itemValue=data[key]||null;

      })
    }else{
      itemValue = data ? data[name] : null;
    }
    
    let isDict = false;
   // if ()
    if (dataName && data) {
      if (data[`${dataName}Id`] || data[`${dataName}Name`]) {
        if (_props.textField && _props.valueField) {
          itemValue = {
            [_props.textField]: data[`${dataName}Name`],
            [_props.valueField]: data[`${dataName}Id`],
          };
        } else {
          itemValue = {
            key: data[`${dataName}Id`],
            title: data[`${dataName}Name`],
          };
        }
        isDict = true;
      }
    }

    return { itemValue, isDict };
  };

  // 创建表单项 {getFieldDecorator(name, { ...formProps })(React.createElement(component, { ...props }))}
  const createFormItem = (item: FormItemProp) => {
    const {
      name="",
      component,
      label,
      viewUseComponent = false,
      fieldProps,
      dataName,
   
      hidden,
      readonly,
    } = item;
    let _dataName = "";
    if (typeof dataName === 'function') {
      _dataName = dataName(initialValues, item);
    }else if (dataName){
      _dataName=dataName;
    }

    const value = convertData(name, _dataName, item.props, initialValues);
    const _name = name;
    const { itemValue, isDict } = value;
    if (!item.props) {
      item.props = {};
    }
    if (isDict && !item.props.data) {
      item.props.data = [itemValue];
    }
    /* 输入框 统一添加allowClear 属性  */
    if (component && component.name === 'Input') {
      item.props.allowClear = true;
    }
    if (action === 'view') {
      item.props.disabled = true;
    }
    const itemProps = { label, ...fieldProps };
    if (hidden) {
      itemProps.style = {
        display: 'none',
      };
    }
    item.props.key = `form-item-component-${name}`;
    item.props.form = waForm;
    // eslint-disable-next-line no-nested-ternary
    if (name && !item.props.name) {
      item.props.name = name;
    }
    const viewName: any = _dataName
      ? initialValues && initialValues[`${_dataName}Name`]
        ? `${_dataName}Name`
        : _dataName
      : name;
    let itValue = '';
    if (viewName) {
      itValue = deepGet(initialValues, viewName);
    }
    const  {width}=item
    const newWidth=width&& !WIDTH_SIZE_ENUM[width] ? width : undefined;

    const className=  classnames(item.props?.className, {
      [`sc-field-${width}`]: width && WIDTH_SIZE_ENUM[width],
    })
 
    const isElemnet=React.isValidElement(component);
    return (
      <>
        {action === 'view' || readonly ? (
          <ViewItem
            key={`form-item-${name}`}
            name={viewName}
            value={itValue}
            {...itemProps}
            initialValue={initialValues}
          >
            {viewUseComponent || component.customView
              ? !isElemnet
                ? React.createElement(component, {
                    ...item.props,
                    readonly: true,
                    initialValues,
                    value: itValue,
                    fieldProps,
                    className,style:{...item.props.style,width:newWidth}
                  })
                : React.cloneElement(component, {
                    ...item.props,
                    readonly: true,
                    initialValues,
                    value: itValue,
                    fieldProps,
                    className,
                    style:{...item.props.style,width:newWidth}
                  })
              : null}
          </ViewItem>
        ) : (
          <FormItem key={`form-item-${name}`} name={_name} {...itemProps} >
            {!isElemnet
              ? React.createElement(component, { ...item.props,className,style:{...item.props.style,width:newWidth}})
              : React.cloneElement(component, { ...item.props,className,style:{...item.props.style,width:newWidth}})}
          </FormItem>
        )}
      </>
    );
  };


  const createCol=(formItem: FormItemProp,item: any,rowIndex: any,colIndex: any,defColProp: any)=>{
    let colCount=0;let col=null;
    const{fieldset}=item
    if (!formItem){
      col= <Col key={`form-group-row${fieldset}-${rowIndex} -${colIndex}`} {...defColProp} />
    }else{
      const { colProps, ...itemProps } = formItem;

      const _props = { ...defColProp, ...colProps };
      if (formItem.hidden) {
        _props.style = {
          display: 'none',
        };
      } else {
        colCount =colCount +
          (_props.span || 0) +
          (_props.push || 0) +
          (_props.pull || 0) +
          (_props.offset || 0);
          // _props.colCount=colCount
        // itemCount++;
      }
      // 设置默认的 栅格比例
      if (!itemProps.fieldProps || _.isEmpty(itemProps.fieldProps)) {
        itemProps.fieldProps = {
          labelCol: item.labelCol || labelCol,
          wrapperCol: item.wrapperCol || wrapperCol,
        };
      } else {
        // eslint-disable-next-line no-shadow
        if (!itemProps.fieldProps.labelCol) {
          itemProps.fieldProps.labelCol = item.labelCol || labelCol;
        }
        if (!itemProps.fieldProps.wrapperCol) {
          itemProps.fieldProps.wrapperCol = item.wrapperCol || wrapperCol;
        }
      }
      if (itemProps.component) {
        let addonAfter = null;
          let addonBefore = null;
        if (formItem.addonAfter) {
          addonAfter = formItem.addonAfter;
        }
        if (formItem.addonBefore) {
          addonBefore = formItem.addonBefore;
        }
        let temFormItem = createFormItem(itemProps);
        if (addonAfter || addonBefore) {
          temFormItem = (
            <Space>
              {addonBefore}
              {temFormItem}
              {addonAfter}
            </Space>
          );
        }
        col=<Col key={`form-group-row${fieldset}-${rowIndex} -${colIndex}`} {..._props} >
          {temFormItem}
        </Col>
    }
  }

    return {colCount,col}

  }
  const groups: any[] = [];
  // 创建表单
  const createForm = (_formConfig: FormConfig[]) => {

 
    return _formConfig.map((item: any) => {
      const { fieldset,fieldsetTitle, items, gutter = { xs: 8, sm: 16, md: 24, lg: 32  }, col = 4 } = item;
      const colSpan = 24 / col;
      const defColProp = { span: colSpan, push: 0, pull: 0, offset: 0 };
      let cols: any[] = [];
      const rows = [];
      let rowIndex = 0;
      let colCount = 0;
      let itemCount = 0;
      const createRow=(isGroup?: boolean)=>{
          if (colCount >= 24) {
          rowIndex += 1;
       
          const colsItem= isGroup?<Space className="sc-form-group-container" direction="horizontal" align="center">{cols}</Space>:cols
          rows.push(
            <Row gutter={gutter || 0} key={`form-group-row${item.group}-${rowIndex}`}>
             {colsItem}
            </Row>,
          );
          cols = [];
          colCount = 0;
        }
    
      }
      items.forEach((formItem: any, index: number) => {
        let colItem;
        if (formItem.items&&formItem.items.length>0){
          // 关闭之前的行
         if (colCount>0){
          colCount=24;
          createRow();
         }
     
          formItem.items.forEach((groupItem: any,groupIndex: any)=>{
            const {span,...newColProp}=defColProp
            colItem=createCol(groupItem,item,rowIndex,`'${index}${groupIndex}'`,newColProp)
            cols.push(colItem.col)
          })
          colCount=24;
          // eslint-disable-next-line no-plusplus
          itemCount++;
          createRow(true);
        }else{
          colItem=createCol(formItem,item,rowIndex,index,defColProp)
          colCount+=colItem.colCount
          cols.push(colItem.col)
              // eslint-disable-next-line no-plusplus
          itemCount++;
          createRow();
        }
        
      //   if (!formItem) {
      //     cols.push(
      //       <Col key={`form-group-row${item.group}-${rowIndex} -${index}`} {...defColProp} />,
      //     );
      //   } else {
      //     const { colProps, ...itemProps } = formItem;

      //     const _props = { ...defColProp, ...colProps };
      //     if (formItem.hidden) {
      //       _props.style = {
      //         display: 'none',
      //       };
      //     } else {
      //       colCount =
      //         colCount +
      //         (_props.span | 0) +
      //         (_props.push | 0) +
      //         (_props.pull | 0) +
      //         (_props.offset | 0);

      //       itemCount++;
      //     }
      //     // 设置默认的 栅格比例
      //     if (!itemProps.formItemProps || _.isEmpty(itemProps.formItemProps)) {
      //       itemProps.formItemProps = {
      //         labelCol: item.labelCol || labelCol,
      //         wrapperCol: item.wrapperCol || wrapperCol,
      //       };
      //     } else {
      //       // eslint-disable-next-line no-shadow
      //       if (!itemProps.formItemProps.labelCol) {
      //         itemProps.formItemProps.labelCol = item.labelCol || labelCol;
      //       }
      //       if (!itemProps.formItemProps.wrapperCol) {
      //         itemProps.formItemProps.wrapperCol = item.wrapperCol || wrapperCol;
      //       }
      //     }
      //     if (itemProps.component) {
      //       let addonAfter = null;
      //         let addonBefore = null;
      //       if (formItem.addonAfter) {
      //         addonAfter = formItem.addonAfter;
      //       }
      //       if (formItem.addonBefore) {
      //         addonBefore = formItem.addonBefore;
      //       }
      //       let temFormItem = createFormItem(itemProps);
      //       if (addonAfter || addonBefore) {
      //         temFormItem = (
      //           <Space>
      //             {addonBefore}
      //             {temFormItem}
      //             {addonAfter}
      //           </Space>
      //         );
      //       }
      //       cols.push(
      //         <Col key={`form-group-row${item.group}-${rowIndex} -${index}`} {..._props}>
      //           {temFormItem}
      //         </Col>
      //       );
      //     }
      //   }
      // if (formItem&&formItem.wrap){
      //   colCount=24;
      // }
     
      });
      if (cols.length > 0) {
        rowIndex += 1;
        rows.push(
          <Row gutter={gutter || 0} key={`form-group-row-${item.group}-${rowIndex}`}>
            {cols}
          </Row>,
        );
      }
      if (itemCount > 0) {
        groups.push({ fieldset, fieldsetTitle });
      }
      return itemCount > 0 ? (
        <div key={`form-group-${fieldset}`} className={fieldsetTitle?"sc-form-fieldset":'sc-form-fieldset sc-form-fieldset-hide-title'} id={`${fieldset}`}>
          {fieldsetTitle ? <div className="sc-form-fieldset-title">{fieldsetTitle}</div> : null}
          {rows}
        </div>
      ) : null;
    });
  };
  const formChildren = useMemo(() => {
    return createForm(formConfig);
  }, [formConfig, action]);

  const anchorRender = useMemo(() => {
    const anchorItems = groups.map(({ groupTitle, group }, index) => {
      return <Link key={`link_${index}`} href={`#${group}`} title={groupTitle}></Link>;
    });
    let anchorProps = {};
    if (_.isObject(anchor)) {
      anchorProps = { ...anchor };
    }
    return (
      <div className="sc-form-nav">
        <Anchor {...anchorProps}>{anchorItems} </Anchor>
      </div>
    );
  }, [formConfig, action]);

  // const getAnchor()
  return (
    <div className="sc-form">
      <Form form={waForm} {...formProps}>
        {anchor ? anchorRender : null}
        {formChildren}
      </Form>
    </div>
  );
};

export default CForm;
