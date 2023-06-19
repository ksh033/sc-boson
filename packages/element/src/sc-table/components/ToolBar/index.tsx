/* eslint-disable no-empty-pattern */
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';

import { Tooltip } from 'antd';
import React, { useEffect, useMemo } from 'react';
import Container from '../../container';
import type { OptionConfig, ScProColumnType, ToolBarProps } from '../../typing';
import { OpColKey } from '../../typing';
import ColumnSetting from '../ColumnSetting';
import ListToolBar from '../ListToolBar';
import DensityIcon from './DensityIcon';
import FullScreenIcon from './FullscreenIcon';


function getButtonText({ }: OptionConfig & {

}) {
  return {
    reload: {
      text: '刷新',
      icon: <ReloadOutlined />,
    },
    density: {
      text: '表格密度',
      icon: <DensityIcon />,
    },
    setting: {
      text: '列设置',
      icon: <SettingOutlined />,
    },
    fullScreen: {
      text: '全屏',
      icon: <FullScreenIcon />,
    },
  };
}

/**
 * 渲染默认的 工具栏
 *
 * @param options
 * @param className
 */
function renderDefaultOption<T>(
  options: OptionConfig,
  defaultOptions: OptionConfig & {

  },
  columns: ScProColumnType<T>[],
) {
  return Object.keys(options)
    .filter((item) => item)
    .map((key) => {
      const value = options[key];
      if (value == null) {
        return null;
      }
      if (key === 'setting') {
        return <ColumnSetting<any> {...(value || {})} columns={columns} key={key} />;
      }
      // if (key === 'fullScreen') {
      //   return (
      //     <span key={key} onClick={value === true ? defaultOptions[key] : value}>
      //       <FullScreenIcon />
      //     </span>
      //   );
      // }
      const optionItem = getButtonText(defaultOptions)[key];
      if (optionItem) {
        return (
          <span
            key={key}
            onClick={() => {
              if (value && defaultOptions[key] !== true) {
                if (value !== true) {
                  value();
                  return;
                }
                defaultOptions[key]();
              }
            }}
          >
            <Tooltip title={optionItem.text}>{optionItem.icon}</Tooltip>
          </span>
        );
      }
      return null;
    })
    .filter((item) => item);
}

function ToolBar<T>({
  headerTitle,
  tooltip,
  toolBarRender,
  action,
  options: propsOptions,
  selectedRowKeys,
  selectedRows,
  toolbar,
  onSearch,
  columns,
  ...rest
}: ToolBarProps<T>) {
  const counter = Container.useContainer();

  //const intl = useIntl();
  const optionDom = useMemo(() => {
    const defaultOptions = {
      reload: () => action?.current?.reload(),
      density: true,
      setting: true,
      search: false,
      // fullScreen: () => action?.current?.fullScreen?.(),
    };
    if (propsOptions === false) {
      return [];
    }

    const options = {
      ...defaultOptions,
      ...propsOptions,
    };

    return renderDefaultOption<T>(
      options,
      {
        ...defaultOptions,
        //intl,
      },
      columns.filter((it) => it.dataIndex !== OpColKey),
    );
  }, [action, columns, propsOptions]);
  // 操作列表
  const actions = toolBarRender
    ? toolBarRender(action?.current, { selectedRowKeys, selectedRows })
    : [];

  const searchConfig = useMemo(() => {
    if (!propsOptions) {
      return false;
    }
    if (!propsOptions.search) return false;

    /** 受控的value 和 onChange */
    const defaultSearchConfig = {
      value: counter.keyWords,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => counter.setKeyWords(e.target.value),
    };

    if (propsOptions.search === true) return defaultSearchConfig;

    return {
      ...defaultSearchConfig,
      ...propsOptions.search,
    };
  }, [counter, propsOptions]);

  useEffect(() => {
    if (counter.keyWords === undefined) {
      onSearch?.('');
    }
  }, [counter.keyWords, onSearch]);
  return (
    <ListToolBar
      title={headerTitle}
      tooltip={tooltip || rest.tip}
      search={searchConfig}
      onSearch={onSearch}
      actions={actions}
      settings={optionDom}
      {...toolbar}
    />
  );
}

export default ToolBar;
