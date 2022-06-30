/* eslint-disable no-empty-pattern */
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import type { IntlType } from '@ant-design/pro-provider';
import { useIntl } from '@ant-design/pro-provider';
import { Tooltip } from 'antd';
import type { SearchProps } from 'antd/es/input';
import React, { useEffect, useMemo } from 'react';
import Container from '../../container';
import { OpColKey, ScProColumnType } from '../../ScTable';
import type { ActionType } from '../../typing';
import ColumnSetting from '../ColumnSetting';
import type { ListToolBarProps } from '../ListToolBar';
import ListToolBar from '../ListToolBar';
import DensityIcon from './DensityIcon';
import FullScreenIcon from './FullscreenIcon';

export type OptionConfig = {
  density?: boolean;
  fullScreen?: OptionsType;
  reload?: OptionsType;
  setting?:
    | boolean
    | {
        draggable?: boolean;
        checkable?: boolean;
      };
  search?: (SearchProps & { name?: string }) | boolean;
};

export type OptionsType =
  | ((e: React.MouseEvent<HTMLSpanElement>, action?: ActionType) => void)
  | boolean;

export type ToolBarProps<T = unknown> = {
  headerTitle?: React.ReactNode;
  tooltip?: string;
  /** @deprecated 你可以使用 tooltip，这个更改是为了与 antd 统一 */
  tip?: string;
  toolbar?: ListToolBarProps;
  toolBarRender?: (
    action: ActionType | undefined,
    rows: {
      selectedRowKeys?: (string | number)[];
      selectedRows?: T[];
    },
  ) => React.ReactNode[];
  action?: React.MutableRefObject<ActionType | undefined>;
  options?: OptionConfig | false;
  selectedRowKeys?: (string | number)[];
  selectedRows?: T[];
  className?: string;
  onSearch?: (keyWords: string) => void;
  columns: ScProColumnType<T>[];
};

function getButtonText({}: OptionConfig & {
  intl: IntlType;
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
    intl: IntlType;
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

  const intl = useIntl();
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
        intl,
      },
      columns.filter((it) => it.dataIndex !== OpColKey),
    );
  }, [action, columns, intl, propsOptions]);
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
