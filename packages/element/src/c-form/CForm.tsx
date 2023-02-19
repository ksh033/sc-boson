/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo } from 'react';
import { Row, Form, Col, Anchor, Space } from 'antd';
//import _ from 'lodash';
import { isEmpty, isObject } from 'lodash';
import classnames from 'classnames';
import ViewItem from './ViewItem';
import './style/index';
import type { CFormProps, FormConfig, FormItemProp } from './interface';
import { createFormItem } from '../_util/formUtil';



const { Link } = Anchor;
// const Panel = Page.PagePanel;

// export function deepGet(obj: any, keys: any, defaultVal?: any): any {
//   return (
//     (!Array.isArray(keys) ? keys.replace(/\[/g, '.').replace(/\]/g, '').split('.') : keys).reduce(
//       (o: any, k: any) => (o || {})[k],
//       obj,
//     ) || defaultVal
//   );
// }




const CForm: React.FC<CFormProps> = (props) => {
  const {
    formConfig = [],
    layout = 'horizontal',
    labelCol = {},
    wrapperCol = {},
    labelAlign = 'right',
    anchor = false,
    readonlyFormItem = false,
    initialValues,
    action,
    form,
    children,
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




  const createCol = (
    formItem: FormItemProp,
    item: any,
    rowIndex: any,
    colIndex: any,
    defColProp: any,
  ) => {
    let colCount = 0;
    let col = null;
    const { fieldset } = item;
    if (!formItem) {
      col = <Col key={`form-group-row${fieldset}-${rowIndex} -${colIndex}`} {...defColProp} />;
    } else {
      const { colProps, ...itemProps } = formItem;

      const _props = { ...defColProp, ...colProps };
      if (formItem.hidden) {
        _props.style = {
          display: 'none',
        };
      } else {
        colCount =
          colCount +
          (_props.span || 0) +
          (_props.push || 0) +
          (_props.pull || 0) +
          (_props.offset || 0);
        // _props.colCount=colCount
        // itemCount++;
      }
      if (_props.newline) {
        colCount = 24;
      }
      delete _props.newline;
      // 设置默认的 栅格比例
      if (!itemProps.fieldProps || isEmpty(itemProps.fieldProps)) {
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

        if (action === "view") {
          if (itemProps.readonly !== false) {
            itemProps.readonly = true
          }
          if (!itemProps.props) {
            itemProps.props = { disabled: true }
          } else if (itemProps.props.disabled !== false) {
            itemProps.props.disabled = true
          }
        }
        let temFormItem = createFormItem(itemProps, {

          readonlyFormItem,
          ViewComponent: ViewItem,
          layout: layout,
          initialValues,
          form: waForm,

        });
        if (addonAfter || addonBefore) {
          temFormItem = (
            <Space>
              {addonBefore}
              {temFormItem}
              {addonAfter}
            </Space>
          );
        }
        col = (
          <Col key={`form-group-row${fieldset}-${rowIndex} -${colIndex}`} {..._props}>
            {temFormItem}
          </Col>
        );
      }
    }

    return { colCount, col };
  };
  const groups: any[] = [];
  // 创建表单
  const createForm = (_formConfig: FormConfig[]) => {
    return _formConfig.map((item: any) => {
      const {
        fieldset,
        fieldsetTitle,
        subTitle,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        layout = '',
        className,
        items,
        gutter = { xs: 8, sm: 16, md: 24, lg: 32 },
        col = 4,
      } = item;
      let fieldsetClassName = '';
      if (layout) {
        fieldsetClassName = `ant-form-${layout}`;
      }
      const colSpan = 24 / col;
      const defColProp = { span: colSpan, push: 0, pull: 0, offset: 0 };
      let cols: any[] = [];
      const rows = [];
      let rowIndex = 0;
      let colCount = 0;
      let itemCount = 0;
      let colIndex = 0;
      const createRow = (isGroup?: boolean, groupItem?: any) => {
        if (colCount >= 24) {
          rowIndex += 1;
          let colsItem = null;
          if (isGroup) {
            colsItem = (
              <Col className="sc-form-group-container" {...groupItem.colProps}>
                <Space direction="horizontal" align="center">
                  {cols}
                </Space>
              </Col>
            );
          } else {
            colsItem = cols;
          }
          rows.push(
            <Row gutter={gutter || 0} key={`form-group-row${item.group}-${rowIndex}`}>
              {colsItem}
            </Row>,
          );
          cols = [];
          colCount = 0;
          colIndex = 0;
        }
      };

      items.forEach((formItem: any, index: number) => {
        let colItem;
        if (formItem.items && formItem.items.length > 0) {
          // 关闭之前的行
          // const {items,...groupProps}=formItem;
          if (colCount > 0) {
            colCount = 24;

            createRow();
          }
          cols = [];
          formItem.items.forEach((groupItem: any, groupIndex: any) => {
            const { span, ...newColProp } = defColProp;
            colItem = createCol(groupItem, item, rowIndex, `'${index}${groupIndex}'`, newColProp);
            cols.push(colItem.col);
          });
          colCount = 24;
          // eslint-disable-next-line no-plusplus
          itemCount++;
          createRow(true, formItem);
        } else {
          colItem = createCol(formItem, item, rowIndex, index, defColProp);
          colCount += colItem.colCount;
          cols.push(colItem.col);
          // eslint-disable-next-line no-plusplus
          itemCount++;
          if (!formItem.hidden) {
            colIndex += 1;
          }
          if (colIndex !== 0 && colIndex % col === 0) {
            colCount = 24;
          }
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
        //     if (!itemProps.formItemProps || isEmpty(itemProps.formItemProps)) {
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

      fieldsetClassName = classnames(
        fieldsetClassName,
        fieldsetTitle ? 'sc-form-fieldset' : 'sc-form-fieldset sc-form-fieldset-hide-title',
        className,
      );
      return itemCount > 0 ? (
        <div key={`form-group-${fieldset}`} className={fieldsetClassName} id={`${fieldset}`}>
          {fieldsetTitle ? (
            <div className="sc-form-fieldset-title">
              {fieldsetTitle}{' '}
              {subTitle ? <div className="sc-form-fieldset-subtitle">{subTitle}</div> : null}
            </div>
          ) : null}
          {rows}
        </div>
      ) : null;
    });
  };
  const formChildren = useMemo(() => {
    return createForm(formConfig);
  }, [formConfig, action]);

  const anchorRender = useMemo(() => {
    const anchorItems = groups.map(({ groupTitle, fieldsetTitle, group, fieldset }, index) => {
      return (
        <Link
          key={`link_${index}`}
          href={`#${group || fieldset}`}
          title={groupTitle || fieldsetTitle}
        />
      );
    });
    let anchorProps = {};
    if (isObject(anchor)) {
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
        <>
          {anchor ? anchorRender : null}
          {formConfig.length > 0 ? formChildren : children}
        </>
      </Form>
    </div>
  );
};

export default CForm;
