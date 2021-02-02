/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { Button, Col, Form, Row, Card } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import useMediaQuery from 'use-media-antd-query';
import classNames from 'classnames';
import { useState, useCallback, useMemo } from 'react';
import Advances from './Advances';
import Quicks from './Quicks';
import SearchButtons from './SearchButton';
import { MyContext } from './context-manager';
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

export interface ScSearchBarProps extends FormInstance {
  request?: (params: any) => Promise<void>;
  onLoad?: (arg: any) => any;
  className?: string;
  queryList: Array<SearchBarItem>;
  colNumber: number;
  prefixCls?: string;
  children?: React.ReactNode;
  onSubmit?: (params: any) => void;
  onReset?: (params: any) => void;
  form?: any;
  colConfig?: any;
  customOptionButtons?: () => React.ReactNode[];
}

/**
 * 默认的查询表单配置
 */
const defaultColConfig = {
  lg: 8,
  md: 12,
  xxl: 6,
  xl: 8,
  sm: 12,
  xs: 24,
};

/**
 * 获取最后一行的 offset，保证在最后一列
 * @param length
 * @param span
 */
const getOffset = (length: number, span: number = 8) => {
  const cols = 24 / span;
  return (cols - 1 - (length % cols)) * span;
};

/**
 * 合并用户和默认的配置
 * @param span
 * @param size
 */
const getSpanConfig = (
  span: number | typeof defaultColConfig,
  size: keyof typeof defaultColConfig,
): number => {
  if (typeof span === 'number') {
    return span;
  }
  const config = {
    ...defaultColConfig,
    ...span,
  };
  return config[size];
};

const SearchBar: React.FC<ScSearchBarProps> = props => {
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
    colConfig,
    customOptionButtons,
    ...resProps
  } = props;

  const windowSize = useMediaQuery();
  // const windowSize = 'xl'
  const [expandForm, setExpandForm] = useState<boolean>(false);
  let colSize = getSpanConfig(colConfig || defaultColConfig, windowSize);
  if (colNumber) {
    colSize = 24 / colNumber;
  }
  const [wrapForm] = Form.useForm();

  React.useImperativeHandle(form, () => wrapForm);

  const handleFormReset = () => {
    wrapForm.resetFields();
    onReset && onReset(wrapForm.getFieldsValue());
  };

  const onFinish = useCallback(
    async fieldsValue => {
      const values = { ...fieldsValue };
      if (request) {
        let _data = await request(values);
        if (onLoad) {
          _data = onLoad(_data);
        }
      } else if (onSubmit) {
        const params = await wrapForm.validateFields();
        onSubmit && onSubmit(params);
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

  const renderFormItem = (item: any, index: number) => {
    const { label, name, component, hasFormItem = true, formItemProps } = item;
    const fieldName: string = name;

    const _children: React.ReactNode[] = [];
    if (Array.isArray(item.children) && item.children.length > 0) {
      item.children.forEach((element: any, idx: number) => {
        _children.push(renderFormItem(element, idx));
      });
    }

    let createCmp = null;
    if (component) {
      if (component.props) {
        createCmp = component;
      } else {
        const { defaultValue, ...restProps } = item.props || {};
        // 把form设置进组件中
        restProps.form = wrapForm;
        if (_children.length > 0) {
          createCmp = React.createElement(
            component,
            {
              style: { width: '100%' },
              key: `form-item-component-${index}`,
              ...restProps,
            },
            _children,
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

    const fromConfig: any = { ...formItemProps };
    if (hasFormItem) {
      if (createCmp) {
        return (
          <FormItem
            label={label}
            name={fieldName}
            {...fromConfig}
            key={`form-item-${index}`}
          >
            {createCmp}
          </FormItem>
        );
      } else {
        return (
          <FormItem
            label={label}
            name={fieldName}
            {...fromConfig}
            key={`form-item-${index}`}
          >
            {_children}
          </FormItem>
        );
      }
    } else {
      return createCmp;
    }
  };

  const renderForm = () => {
    let items: any[] = [];
    let total: number = 0;
    if (expandForm) {
      items = items.concat(queryList);
    } else {
      items = items.concat(queryList.filter(item => !item.hiddenExpend));
    }
    const advances = queryList.filter(item => item.hiddenExpend);

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

    const cols: any[] = [];
    items.forEach((item: any, index: number) => {
      const { columnSize = 1 } = item;
      const createCmp = renderFormItem(item, index);
      // const { label, name, component, formProps } = item;
      // const fieldName: string = name;
      // let createCmp = null;
      // if (component.props) {
      //   createCmp = component;
      // } else {
      //   const { defaultValue, ...restProps } = item.props || {};
      //   createCmp = React.createElement(component, {
      //     ...restProps,
      //     // wrapForm,
      //     style: { width: '100%' },
      //   });
      // }

      // const fromConfig: any = { ...formProps };
      const size = columnSize * colSize;
      total += columnSize;
      cols.push(
        <Col key={`col${index}`} span={size}>
          {createCmp}
        </Col>,
      );
    });

    return (
      <Card bordered={false}>
        <Form
          onFinish={onFinish}
          form={wrapForm}
          layout="horizontal"
          {...resProps}
        >
          <Row gutter={16}>
            {cols}
            {customOptionButtons ? (
              customOptionButtons()
            ) : (
              <Col
                offset={getOffset(total, colSize)}
                span={colSize}
                className={classNames(`${prefixCls}-option`)}
                key="option"
              >
                {buttons}
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
        <div className={`${prefixCls}`}>{children}</div>
      </MyContext.Provider>
    );
  } else {
    return (
      <MyContext.Provider value={myContext}>
        <div className={`${prefixCls}`}>{renderForm()}</div>
      </MyContext.Provider>
    );
  }
};

type SearchBar = typeof SearchBar;
interface ScSearchBarInfo extends SearchBar {
  SearchButtons: typeof SearchButtons;
  Quicks: typeof Quicks;
  Advances: typeof Advances;
}

const ScSearchBar: ScSearchBarInfo = SearchBar as ScSearchBarInfo;

ScSearchBar.SearchButtons = SearchButtons;
ScSearchBar.Quicks = Quicks;
ScSearchBar.Advances = Advances;

export default ScSearchBar;
