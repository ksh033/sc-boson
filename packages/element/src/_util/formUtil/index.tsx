import type { FormInstance } from "antd";
import FormItem from "antd/es/form/FormItem";
import classnames from "classnames";
import { isFunction } from "lodash";
import isArray from "lodash/isArray";
import React from "react";
import type { FormItemProp, FormLayout, SchemaValueEnumMap, SchemaValueEnumObj } from "../../c-form/interface";

export function deepGet(object: any, path: string | any[]): any {
    let keyPath: any[] = [];
    if (Array.isArray(path)) keyPath = [...path];
    else if (typeof path === 'string' || typeof path === 'number') keyPath = [path];
    if (keyPath.length) {
        const key = keyPath.shift();
        if (object && object[key] !== undefined) return deepGet(object[key], keyPath);
        return undefined;
    }
    return object;
}
export const WIDTH_SIZE_ENUM = {
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
/**
 * 获取类型的 type
 *
 * @param obj
 */
function getType(obj: any) {
    // @ts-ignore
    const type = Object.prototype.toString
        .call(obj)
        .match(/^\[object (.*)\]$/)[1]
        .toLowerCase();
    if (type === 'string' && typeof obj === 'object') return 'object'; // Let "new String('')" return 'object'
    if (obj === null) return 'null'; // PhantomJS has type "DOMWindow" for null
    if (obj === undefined) return 'undefined'; // PhantomJS has type "DOMWindow" for undefined
    return type;
}

export const convertData = (name: string | string[], dataName: string, _props: any, data: any) => {
    let itemValue;
    if (isArray(name)) {
        name.forEach((key) => {
            itemValue = data ? data[key] : null;
        });
    } else {
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
export const ObjToMap = (value: SchemaValueEnumMap | SchemaValueEnumObj | undefined): SchemaValueEnumMap => {
    if (getType(value) === 'map') {
        return value as SchemaValueEnumMap;
    }
    return new Map(Object.entries(value || {}));
};
export const converValueEnum = (valueEnumParams: SchemaValueEnumObj
    | SchemaValueEnumMap) => {
    const enumArray: Partial<
        {
            label?: React.ReactNode;
            value?: React.Key;
            text: string;
            /** 是否禁用 */
            disabled?: boolean;
        }
    >[] = [];
    const valueEnum = ObjToMap(valueEnumParams);

    valueEnum.forEach((_, key) => {
        const value = (valueEnum.get(key) || valueEnum.get(`${key}`)) as {
            text: string;
            disabled?: boolean;
        };

        if (!value) {
            return;
        }

        if (typeof value === 'object' && value?.text) {
            enumArray.push({
                text: value?.text as unknown as string,
                value: key,
                label: value?.text as unknown as string,
                disabled: value.disabled,
            });
            return;
        }
        enumArray.push({
            text: value as unknown as string,
            value: key,
        });
    });
    return enumArray;
}

// 创建表单项 {getFieldDecorator(name, { ...formProps })(React.createElement(component, { ...props }))}
export const createFormItem = (item: FormItemProp, config: {
    initialValues: any
    form?: FormInstance,
    ViewComponent: any
    readonlyFormItem?: boolean
    layout?: FormLayout
}) => {
    const {
        name,
        component,
        label,
        viewUseComponent = false,
        fieldProps,
        dataName,
        hidden,
        readonly,
        valueEnum
    } = item;
    const { initialValues, form, ViewComponent, layout, readonlyFormItem } = config
    let _dataName = '';
    if (typeof dataName === 'function') {
        _dataName = dataName(initialValues, item);
    } else if (dataName) {
        _dataName = dataName;
    }

    if (!item.props) {
        item.props = {};
    }

    let isViewFormItem = false;
    if (item.readonlyFormItem === true) {
        isViewFormItem = true
    }
    if (item.readonlyFormItem !== false && readonlyFormItem === true) {
        isViewFormItem = true
    }
    if (name) {
        const value = convertData(name, _dataName, item.props, initialValues);
        const { itemValue, isDict } = value;
        if (isDict && !item.props.data) {
            item.props.data = [itemValue];
        }
    }

    /* 输入框 统一添加allowClear 属性  */
    if (component && component.name === 'Input') {
        item.props.allowClear = true;
    }
    // if (action === 'view') {
    //   item.props.disabled = true;
    // }
    const itemProps = { label, ...fieldProps };
    if (hidden) {
        itemProps.style = {
            display: 'none',
        };
    }
    item.props.key = `form-item-component-${name}`;
    item.props.form = form;
    // eslint-disable-next-line no-nested-ternary
    if (name && !item.props.name) {
        item.props.name = name;
    }
    if (valueEnum) {
        if (!item.props.data) {
            let v;
            if (isFunction(valueEnum)) {
                v = valueEnum(initialValues)

            } else {
                v = valueEnum
            }
            const list = converValueEnum(v)
            item.props.data = list;
        }

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
    const { width } = item;
    const newWidth = width && !WIDTH_SIZE_ENUM[width] ? width : undefined;

    const className = classnames(item.props?.className, {
        [`sc-field-${width}`]: width && WIDTH_SIZE_ENUM[width],
    });

    const isElemnet = React.isValidElement(component);
    let widthObj = {};
    if (newWidth) {
        widthObj = { width: newWidth };
    }
    const render = item.render || itemProps.render;
    delete itemProps.render;
    return (
        <>
            {readonly ? (
                <ViewComponent
                    key={`form-item-${name}`}
                    render={render}
                    readonlyFormItem={isViewFormItem}
                    name={viewName}
                    fieldProps={itemProps}
                    value={itValue}
                    layout={layout}
                    valueEnum={valueEnum}
                    initialValue={initialValues}
                    form={form}
                    {...itemProps}
                >
                    {viewUseComponent || component.customView
                        ? !isElemnet
                            ? React.createElement(component, {
                                ...item.props,
                                readonly: true,
                                initialValues,
                                value: itValue,
                                fieldProps,
                                className,
                                style: { ...item.props.style, ...widthObj },
                            })
                            : React.cloneElement(component, {
                                ...item.props,
                                readonly: true,
                                initialValues,
                                value: itValue,
                                fieldProps,
                                className,
                                style: { ...item.props.style, ...widthObj },
                            })
                        : null}
                </ViewComponent>
            ) : (
                <FormItem key={`form-item-${name}`} name={name} {...itemProps} >
                    {!isElemnet
                        ? React.createElement(component, {
                            ...item.props,
                            className,
                            style: { ...item.props.style, ...widthObj },
                        })
                        : React.cloneElement(component, {
                            ...item.props,
                            className,
                            style: { ...item.props.style, ...widthObj },
                        })}
                </FormItem>
            )}
        </>
    );
};