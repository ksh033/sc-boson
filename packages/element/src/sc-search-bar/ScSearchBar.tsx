/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { Button, Col, Form, Row, Card } from 'antd';
import type { FormInstance, FormProps } from 'antd/es/form';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import useMediaQuery from 'use-media-antd-query';
import classNames from 'classnames';
import { useState, useCallback, useMemo } from 'react';
import Advances from './Advances';
import Quicks from './Quicks';
import SearchButtons from './SearchButton';
import isBrowser from '../_util/isBrowser';
import { MyContext } from './context-manager';
import RcResizeObserver from 'rc-resize-observer';
import type { FormItemProp } from '../c-form/interface';

import useMountMergeState from '../_util/useMountMergeState';
import './style';

const FormItem = Form.Item;

export interface SearchBarItem {
  label: string;
  name: string;
  hiddenExpend?: boolean; // 隐藏更多
  columnSize?: number;
  component?: React.ReactNode; // 组件
  hasFormItem?: boolean;
  children?: SearchBarItem[]; // 子集合
  formItemProps?: any;
}

export interface ScSearchBarProps extends FormProps {
  request?: (params: any) => Promise<void>;
  onLoad?: (arg: any) => any;
  className?: string;
  queryList: SearchBarItem[];
  colNumber: number;
  prefixCls?: string;
  span: SpanConfig;
  children?: React.ReactNode;
  onSubmit?: (params: any) => void;
  onReset?: (params: any) => void;
  form?: any;
  colConfig?: any;
  customOptionButtons?: () => React.ReactNode[];
}

/** 默认的查询表单配置 */
const defaultColConfig = {
  lg: 8,
  md: 12,
  xxl: 6,
  xl: 8,
  sm: 12,
  xs: 24,
};

export type SpanConfig =
  | number
  | {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };

const CONFIG_SPAN_BREAKPOINTS = {
  xs: 513,
  sm: 513,
  md: 785,
  lg: 992,
  xl: 1057,
  xxl: Infinity,
};
/** 配置表单列变化的容器宽度断点 */
const BREAKPOINTS = {
  vertical: [
    // [breakpoint, cols, layout]
    [513, 1, 'vertical'],
    [785, 2, 'vertical'],
    [1057, 3, 'vertical'],
    [Infinity, 4, 'vertical'],
  ],
  default: [
    [513, 1, 'vertical'],
    [701, 2, 'vertical'],
    [1062, 3, 'horizontal'],
    [1352, 3, 'horizontal'],
    [Infinity, 4, 'horizontal'],
  ],
};

/**
 * 获取最后一行的 offset，保证在最后一列
 *
 * @param length
 * @param span
 */
const getOffset = (length: number, span: number = 8) => {
  const cols = 24 / span;
  return (cols - 1 - (length % cols)) * span;
};
/**
 * 合并用户和默认的配置
 *
 * @param layout
 * @param width
 */
const getSpanConfig = (
  layout: FormProps['layout'],
  width: number,
  span?: SpanConfig,
): { span: number; layout: FormProps['layout'] } => {
  if (width === 16) {
    return {
      span: 8,
      layout: 'inline',
    };
  }
  if (span && typeof span === 'number') {
    return {
      span,
      layout,
    };
  }
  const spanConfig = span
    ? Object.keys(span).map((key) => [CONFIG_SPAN_BREAKPOINTS[key], 24 / span[key], 'horizontal'])
    : BREAKPOINTS[layout || 'default'];

  const breakPoint = (spanConfig || BREAKPOINTS.default).find(
    (item: [number, number, FormProps['layout']]) => width < item[0] + 16, // 16 = 2 * (ant-row -8px margin)
  );
  return {
    span: 24 / breakPoint[1],
    layout: breakPoint[2],
  };
};
const defaultWidth = isBrowser() ? document.body.clientWidth : 1024;

const SearchBar: React.FC<ScSearchBarProps> = (props) => {
  const {
    // quicks = [],
    // advances = [],
    queryList = [],
    prefixCls = 'sc-searchbar',
    colNumber,
    form,
    request,
    onLoad,
    onSubmit,
    onReset,
    children,
    span,
    colConfig,
    layout,
    customOptionButtons,
    style,
    ...resProps
  } = props;

  // const windowSize = useMediaQuery();
  // const windowSize = 'xl'
  const [expandForm, setExpandForm] = useState<boolean>(false);
  const [width, setWidth] = useMountMergeState(
    () => (typeof style?.width === 'number' ? style?.width : defaultWidth) as number,
  );
  // let colSize = getSpanConfig(colConfig || defaultColConfig, windowSize);
  // const colSize = useMemo(() => getSpanConfig(layout, width + 16, span), [layout, width, span]);
  const spanSize = useMemo(() => getSpanConfig(layout, width + 16, span), [layout, width, span]);

  if (colNumber) {
    spanSize.span = 24 / colNumber;
    // colSize = 24 / colNumber;
  }
  const [wrapForm] = Form.useForm();

  React.useImperativeHandle(form, () => wrapForm);

  const handleFormReset = () => {
    wrapForm.resetFields();
    onReset?.(wrapForm.getFieldsValue());
  };

  const onFinish = useCallback(
    async (fieldsValue) => {
      const values = { ...fieldsValue };
      if (request) {
        let rdata = await request(values);
        if (onLoad) {
          rdata = onLoad(rdata);
        }
      } else if (onSubmit) {
        onSubmit(values);
      }
    },
    [onSubmit, request, onLoad],
  );

  const toggleForm = () => {
    setExpandForm(!expandForm);
  };

  const myContext = useMemo(() => {
    return {
      toggleForm,
      handleFormReset,
      form: wrapForm,
      getState: () => {
        return expandForm;
      },
    };
  }, [expandForm, handleFormReset, toggleForm]);

  const renderFormItem = (item: FormItemProp, index: number) => {
    const { label, name, component, hasFormItem = true, fieldProps } = item;
    const fieldName = name;

    const rchildren: React.ReactNode[] = [];
    if (Array.isArray(item.children) && item.children.length > 0) {
      item.children.forEach((element: any, idx: number) => {
        rchildren.push(renderFormItem(element, idx));
      });
    }

    let createCmp = null;
    if (component) {
      if (component.props) {
        createCmp = component;
      } else {
        const { defaultValue, ...restProps } = item.props || {};
        if (component.customView) {
          if (fieldProps) {
            restProps.fieldProps = fieldProps;
          }
        }
        // 把form设置进组件中
        restProps.form = wrapForm;
        if (rchildren.length > 0) {
          createCmp = React.createElement(
            component,
            {
              style: { width: '100%' },
              key: `form-item-component-${index}`,
              ...restProps,
            },
            rchildren,
          );
        } else {
          createCmp = React.createElement(component, {
            style: { width: '100%' },
            key: `form-item-component-${index}`,
            ...restProps,
          });
        }
      }
    }

    const fromConfig: any = { ...fieldProps };
    if (hasFormItem) {
      if (createCmp) {
        return (
          <FormItem label={label} name={fieldName} {...fromConfig} key={`form-item-${index}`}>
            {createCmp}
          </FormItem>
        );
      }
      return (
        <FormItem label={label} name={fieldName} {...fromConfig} key={`form-item-${index}`}>
          {rchildren}
        </FormItem>
      );
    }
    return createCmp;
  };

  const RenderForm = () => {
    let items: any[] = [];
    // let total: number = 0;

    // totalSpan 统计控件占的位置，计算 offset 保证查询按钮在最后一列
    let totalSpan = 0;
    let itemLength = 0;
    if (expandForm) {
      items = items.concat(queryList);
    } else {
      items = items.concat(queryList.filter((item) => !item.hiddenExpend));
    }
    const advances = queryList.filter((item) => item.hiddenExpend);

    const buttons = (
      <span className={`${prefixCls}-buttons`}>
        <Button type="primary" htmlType="submit">
          查询
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={handleFormReset}>
          重置
        </Button>
        {advances && advances.length > 0 ? (
          <a style={{ marginLeft: 8 }} onClick={toggleForm}>
            {expandForm === true ? '收起' : '展开'}{' '}
            {expandForm === true ? <UpOutlined /> : <DownOutlined />}
          </a>
        ) : (
          ''
        )}
      </span>
    );

    // for split compute
    let currentSpan = 0;

    const cols: any[] = [];
    items.forEach((item: FormItemProp, index: number) => {
      const hidden: boolean =
        (item as React.ReactElement<{ hidden: boolean }>)?.props?.hidden ||
        item.hidden ||
        // 如果收起了
        (expandForm &&
          // 如果 超过显示长度 且 总长度超过了 24
          // index >= showLength - 1 &&
          !!index &&
          totalSpan >= 24);
      if (hidden) {
        return;
      }
      const createCmp = renderFormItem(item, index);
      // 如果 formItem 自己配置了 hidden，默认使用它自己的
      const colSize = React.isValidElement<any>(item) ? item?.props?.colSize : 1;
      const colSpan = Math.min(spanSize.span * (colSize || 1), 24);
      // 计算总的 totalSpan 长度
      totalSpan += colSpan;
      itemLength += 1;

      // 每一列的key, 一般是存在的
      const itemKey = item.name? `${item.name}` : item.id || index;

      if (24 - (currentSpan % 24) < colSpan) {
        // 如果当前行空余位置放不下，那么折行
        totalSpan += 24 - (currentSpan % 24);
        currentSpan += 24 - (currentSpan % 24);
      }

      currentSpan += colSpan;

 
      cols.push(
        <Col key={itemKey} span={colSpan}>
          {createCmp}
        </Col>,
      );
    });
    const offset = useMemo(() => {
      const offsetSpan = (currentSpan % 24) + spanSize.span;
      return 24 - offsetSpan;
    }, [currentSpan, spanSize.span]);

    return (
      <Card bordered={false}>
        <Form onFinish={onFinish} form={wrapForm} layout="horizontal" {...resProps}>
          <Row gutter={24} justify="start" key="resize-observer-row">
            {cols}
            {customOptionButtons ? (
              customOptionButtons()
            ) : (
              <Col
                offset={offset}
                span={spanSize.span}
                style={{
                  textAlign: 'right',
                }}
                key="option"
              >
                <Form.Item label=" " colon={false} className={classNames(`${prefixCls}-actions`)}>
                  {buttons}
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </Card>
    );
  };

  if (children) {
    return (
      <MyContext.Provider value={myContext}>
        <RcResizeObserver
          key="resize-observer"
          onResize={(offset) => {
            if (width !== offset.width) {
              setWidth(offset.width);
            }
          }}
        >
          <div className={`${prefixCls}`}>{children}</div>
        </RcResizeObserver>
      </MyContext.Provider>
    );
  }
  return (
    <MyContext.Provider value={myContext}>
      <RcResizeObserver
        key="resize-observer"
        onResize={(offset) => {
          if (width !== offset.width) {
            setWidth(offset.width);
          }
        }}
      >
        <div className={`${prefixCls}`}>{RenderForm()}</div>
      </RcResizeObserver>
    </MyContext.Provider>
  );
};

type SearchBar1 = typeof SearchBar;
interface ScSearchBarInfo extends SearchBar1 {
  SearchButtons: typeof SearchButtons;
  Quicks: typeof Quicks;
  Advances: typeof Advances;
}

const ScSearchBar: ScSearchBarInfo = SearchBar as ScSearchBarInfo;

ScSearchBar.SearchButtons = SearchButtons;
ScSearchBar.Quicks = Quicks;
ScSearchBar.Advances = Advances;

export default ScSearchBar;
