import React, { useEffect, useMemo } from 'react';
import { Row, Form, Divider, Col, Anchor } from 'antd';
import _, { isObject } from 'lodash';
import ViewItem from './ViewItem';

const FormItem = Form.Item;
const Link = Anchor.Link;
// const Panel = Page.PagePanel;

export function deepGet(obj: Object, keys: any, defaultVal?: any): any {
  return (
    (!Array.isArray(keys)
      ? keys
          .replace(/\[/g, '.')
          .replace(/\]/g, '')
          .split('.')
      : keys
    ).reduce((o: any, k: any) => (o || {})[k], obj) || defaultVal
  );
}

const CForm: React.FC<any> = props => {
  const {
    formConfig = [],
    layout = 'horizontal',
    labelCol = { span: 8 },
    wrapperCol = { span: 16 },
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

  const convertData = (
    name: string,
    dataName: string,
    _props: any,
    data: any,
  ) => {
    let itemValue = data ? data[name] : null;
    let isDict = false;
    if (dataName && data) {
      if (data[`${dataName}Id`] || data[`${dataName}Name`]) {
        if (_props['textField'] && _props['valueField']) {
          itemValue = {
            [_props['textField']]: data[`${dataName}Name`],
            [_props['valueField']]: data[`${dataName}Id`],
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
  const createFormItem = (item: any) => {
    const {
      name,
      component,
      label,
      viewUseComponent = false,
      formItemProps,
      dataName,
      hidden,
      readonly,
    } = item;
    let _dataName = dataName;
    if (typeof dataName === 'function') {
      _dataName = dataName(initialValues, item);
    }

    const value = convertData(name, _dataName, item.props, initialValues);
    const _name = name;
    const { itemValue, isDict } = value;
    if (!item.props) {
      item.props = {};
    }
    if (isDict && !item.props['data']) {
      item.props['data'] = [itemValue];
    }
    /* 输入框 统一添加allowClear 属性  */
    if (component && component.name === 'Input') {
      item.props.allowClear = true;
    }
    if (action === 'view') {
      item.props.disabled = true;
    }
    const itemProps = { label, ...formItemProps };
    if (hidden) {
      itemProps.style = {
        display: 'none',
      };
    }
    item.props.key = `form-item-component-${name}`;
    item.props.form = waForm;
    // eslint-disable-next-line no-nested-ternary
    if (name && !item.props['name']) {
      item.props['name'] = name;
    }
    const viewName: string = _dataName
      ? initialValues && initialValues[`${_dataName}Name`]
        ? `${_dataName}Name`
        : _dataName
      : name;
    let itValue = '';
    if (viewName) {
      itValue = deepGet(initialValues, viewName);
    }
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
              ? typeof component === 'function'
                ? React.createElement(component, {
                    ...item.props,
                    readonly: true,
                    initialValues,
                    value: itValue,
                  })
                : React.cloneElement(component, {
                    ...item.props,
                    readonly: true,
                    initialValues,
                    value: itValue,
                  })
              : null}
          </ViewItem>
        ) : (
          <FormItem key={`form-item-${name}`} name={_name} {...itemProps}>
            {typeof component === 'function'
              ? React.createElement(component, { ...item.props })
              : React.cloneElement(component, { ...item.props })}
          </FormItem>
        )}
      </>
    );
  };

  const groups: any[] = [];
  // 创建表单
  const createForm = (_formConfig: any) => {
    return _formConfig.map((item: any) => {
      const { groupTitle, group, items, gutter = { xs: 8, sm: 16, md: 24, lg: 32 }, col = 4 } = item;
      const colSpan = 24 / col;
      const defColProp = { span: colSpan, push: 0, pull: 0, offset:0 };
      let cols: any[] = [];
      const rows = [];
      let rowIndex = 0;
      let colCount = 0;
      let itemCount = 0;
      items.forEach((formItem: any, index: number) => {
        if (!formItem) {
          cols.push(
            <Col
              key={`form-group-row${item.group}-${rowIndex} -${index}`}
              {...defColProp}
            />,
          );
        } else {
          const { colProps, ...itemProps } = formItem;

          const _props = { ...defColProp, ...colProps };
          if (formItem.hidden) {
            _props.style = {
              display: 'none',
            };
          } else {
            colCount = colCount + (_props.span|0) + (_props.push|0)+ (_props.pull|0)+ (_props.offset|0);

            itemCount++;
          }
          // 设置默认的 栅格比例
          if (!itemProps.formItemProps || _.isEmpty(itemProps.formItemProps)) {
            itemProps.formItemProps = {
              labelCol: labelCol,
              wrapperCol: wrapperCol,
            };
          } else {
            // eslint-disable-next-line no-shadow
            if (!itemProps.formItemProps.labelCol) {
              itemProps.formItemProps['labelCol'] = labelCol;
            }
            if (!itemProps.formItemProps.wrapperCol) {
              itemProps.formItemProps['wrapperCol'] = wrapperCol;
            }
          }
          if (itemProps.component) {
            cols.push(
              <Col
                key={`form-group-row${item.group}-${rowIndex} -${index}`}
                {..._props}
              >
                {createFormItem(itemProps)}
              </Col>,
            );
          }
        }
        if (colCount >= 24) {
          rowIndex += 1;
          rows.push(
            <Row
              gutter={gutter || 0}
              key={`form-group-row${item.group}-${rowIndex}`}
            >
              {cols}
            </Row>,
          );
          cols = [];
          colCount = 0;
        }
      });
      if (cols.length > 0) {
        rowIndex += 1;
        rows.push(
          <Row
            gutter={gutter || 0}
            key={`form-group-row-${item.group}-${rowIndex}`}
          >
            {cols}
          </Row>,
        );
      }
      if (itemCount > 0) {
        groups.push({ group, groupTitle });
      }
      return itemCount > 0 ? (
        <div
          key={`form-group-${group}`}
          className="sc-form-group"
          id={`${group}`}
        >
          {groupTitle ? (
            <div className="sc-form-group-title">{groupTitle}</div>
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
    const anchorItems = groups.map(({ groupTitle, group }, index) => {
      return (
        <Link
          key={`link_${index}`}
          href={`#${group}`}
          title={groupTitle}
        ></Link>
      );
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

  //const getAnchor()
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
