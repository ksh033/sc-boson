import type { FormInstance } from "antd";
import { Descriptions } from "antd";
import type { BaseFormItemProp, SchemaValueEnumMap, SchemaValueEnumObj } from "../c-form/interface";

export interface DescriptionsItemProps {
    prefixCls?: string;
    className?: string;
    style?: React.CSSProperties;
    label?: React.ReactNode;
    labelStyle?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
    children: React.ReactNode;
    span?: number;
}


export type ProDescriptionsItemProps = Omit<DescriptionsItemProps, 'children'> & {
    // 隐藏这个字段，是个语法糖，方便一下权限的控制
    hide?: boolean;
    plain?: boolean;
    copyable?: boolean;
    ellipsis?: boolean;
    children?: React.ReactNode;
    order?: number;
    index?: number;
} & Omit<BaseFormItemProp, 'valueEnum'> & {
    form?: FormInstance,
    value: any,
    initialValue: Record<string, any>,
    valueEnum?: SchemaValueEnumMap | SchemaValueEnumObj
};
const ScDescriptionsItem = (props: ProDescriptionsItemProps) => {
    const { label, valueEnum, value, render, children, initialValue, colProps } = props
    const toValue = (v: any) => {
        if (valueEnum) {
            const key = v + ""
            const item = valueEnum[key]
            if (item) {
                return item.text
            }

        }
        return value || ""
    }
    return (<Descriptions.Item label={label} span={colProps?.span as number}>
        {children ? children : render ? render(value, initialValue) : toValue(value)}
    </Descriptions.Item >)

}

export default ScDescriptionsItem