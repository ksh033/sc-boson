
import type { DescriptionsProps } from 'antd';

import ErrorBoundary from 'antd/lib/alert/ErrorBoundary';
import type { DescriptionsItemProps } from 'antd/lib/descriptions/Item';
import React, { useEffect, useMemo } from 'react';
import { Row, Descriptions, Col, Anchor, Space } from 'antd';
//import _ from 'lodash';
import { isEmpty, isObject } from 'lodash';
import classnames from 'classnames';

import { createFormItem } from '../_util/formUtil';
import type { CFormProps, FormConfig, FormItemProp } from '../c-form/interface';
import Item from './item'


const { Link } = Anchor;
// export type ScDescriptionsItemProps<T = Record<string, any>, ValueType = 'text'> = ProSchema<
//     T,
//     Omit<DescriptionsItemProps, 'children'> & {
//         // 隐藏这个字段，是个语法糖，方便一下权限的控制
//         hide?: boolean;
//         plain?: boolean;
//         copyable?: boolean;
//         ellipsis?: boolean;
//         // mode?: ProFieldFCMode;
//         children?: React.ReactNode;
//         order?: number;
//         index?: number;
//     }
// >;
export type ScDescriptionsProps<
    RecordType = Record<string, any>
> = DescriptionsProps & Omit<CFormProps, 'action'> & {
    /** Params 参数 params 改变的时候会触发 reload */
    params?: Record<string, any>;
    /** 网络请求报错 */
    //onRequestError?: (e: Error) => void;
    /** 获取数据的方法 */
    request?: (params: Record<string, any>) => Promise<any>;

    // columns?: ScDescriptionsItemProps<RecordType, ValueType>[];

    /** 一些简单的操作 */
    //actionRef?: React.MutableRefObject<ProCoreActionType<any> | undefined>;

    loading?: boolean;

    onLoadingChange?: (loading?: boolean) => void;

    //tooltip?: LabelTooltipType | string;
    /** @deprecated 你可以使用 tooltip，这个更改是为了与 antd 统一 */
    // tip?: string;
    /** Form props 的相关配置 */
    //formProps?: CFormProps;
    /** @name 编辑相关的配置 */
    //editable?: RowEditableConfig<RecordType>;
    /** 默认的数据源 */
    dataSource?: RecordType;
    /** 受控数据源改变 */
    onDataSourceChange?: (value: RecordType) => void;
};


const DefaultProDescriptionsDom = (dom: { children: any }) => dom.children;

const ScDescriptions = (
    props: ScDescriptionsProps,
) => {

    const {
        formConfig = [],
        layout = 'horizontal',
        labelCol = {},
        wrapperCol = {},
        labelAlign = 'right',
        anchor = false,
        colon,
        initialValues,
        form,
        children,
        ...respPorps
    } = props;
    const formProps = { layout, labelCol, wrapperCol, labelAlign, ...respPorps };

    const FormComponent = DefaultProDescriptionsDom;// editable ? ProForm : DefaultProDescriptionsDom;

    const groups: any[] = []

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

                // if (action === "view") {
                if (itemProps.readonly !== false) {
                    itemProps.readonly = true
                }
                if (!itemProps.props) {
                    itemProps.props = { disabled: true }
                } else if (itemProps.props.disabled !== false) {
                    itemProps.props.disabled = true
                }
                // }
                let temFormItem = createFormItem(itemProps, {

                    readonlyFormItem: false,
                    ViewComponent: Item,
                    // layout: layout,
                    initialValues,
                    //  form: waForm,

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
                col = temFormItem;
            }
        }

        return { colCount, col };
    };

    const createForm = (_formConfig: FormConfig[]) => {
        return _formConfig.map((item: any) => {
            const {
                fieldset,
                fieldsetTitle,
                subTitle,
                // readonly = true,
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
            // const createRow = (isGroup?: boolean, groupItem?: any) => {
            //     if (colCount >= 24) {
            //         rowIndex += 1;
            //         let colsItem = null;
            //         if (isGroup) {
            //             colsItem = (
            //                 <Col className="sc-form-group-container" {...groupItem.colProps}>
            //                     <Space direction="horizontal" align="center">
            //                         {cols}
            //                     </Space>
            //                 </Col>
            //             );
            //         } else {
            //             colsItem = cols;
            //         }
            //         rows.push(
            //             <Row gutter={gutter || 0} key={`form-group-row${item.group}-${rowIndex}`}>
            //                 {colsItem}
            //             </Row>,
            //         );
            //         cols = [];
            //         colCount = 0;
            //         colIndex = 0;
            //     }
            // };

            items.forEach((formItem: any, index: number) => {
                let colItem;
                if (formItem.items && formItem.items.length > 0) {
                    // 关闭之前的行
                    // const {items,...groupProps}=formItem;
                    if (colCount > 0) {
                        colCount = 24;

                        // createRow();
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
                    // createRow(true, formItem);
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
                    //  createRow();
                }


            });
            // if (cols.length > 0) {
            //     rowIndex += 1;
            //     rows.push(
            //         <Row gutter={gutter || 0} key={`form-group-row-${item.group}-${rowIndex}`}>
            //             {cols}
            //         </Row>,
            //     );
            // }
            if (itemCount > 0) {
                groups.push({ fieldset, fieldsetTitle });
            }

            // fieldsetClassName = classnames(
            //     fieldsetClassName,
            //     fieldsetTitle ? 'sc-form-fieldset' : 'sc-form-fieldset sc-form-fieldset-hide-title',
            //     className,
            // );


            return itemCount > 0 ?
                <Descriptions title={fieldsetTitle} colon={colon} layout={layout} column={col}>

                    {cols}
                </Descriptions>

                : null;
        });
    };
    const formChildren = useMemo(() => {
        return createForm(formConfig);
    }, [formConfig]);

    // const anchorRender = useMemo(() => {
    //     const anchorItems = groups.map(({ groupTitle, fieldsetTitle, group, fieldset }, index) => {
    //         return (
    //             <Link
    //                 key={`link_${index}`}
    //                 href={`#${group || fieldset}`}
    //                 title={groupTitle || fieldsetTitle}
    //             />
    //         );
    //     });
    //     let anchorProps = {};
    //     if (isObject(anchor)) {
    //         anchorProps = { ...anchor };
    //     }
    //     return (
    //         <div className="sc-form-nav">
    //             <Anchor {...anchorProps}>{anchorItems} </Anchor>
    //         </div>
    //     );
    // }, [formConfig,]);
    return (
        <ErrorBoundary>
            <FormComponent
                key="form"
            // form={props.editable?.form}
            //component={false}
            // submitter={false}
            //  {...formProps}
            //  onFinish={undefined}
            >
                {formChildren}
            </FormComponent>
        </ErrorBoundary>
    );
};
export default ScDescriptions