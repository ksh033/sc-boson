/*
 * @Description:
 * @Version: 1.0
 * @Autor: yangyuhang
 * @Date: 2022-07-26 11:26:08
 * @LastEditors: yangyuhang
 * @LastEditTime: 2023-03-15 17:28:19
 */
import type { CompareFn, SortOrder } from 'antd/es/table/interface';
import type { TooltipProps, TabPaneProps } from 'antd';
import type { CardProps } from 'antd';
import type { } from 'antd/es/table/interface';
import type { TablePaginationConfig, TableProps } from 'antd/es/table/Table';
import type { SearchProps } from 'antd/es/input';
export type { ColumnsType } from 'antd/es/table/Table';
import type { ColumnType } from 'antd/es/table';
export type PageInfo = {
  pageSize: number;
  total: number;
  current: number;
};
// eslint-disable-next-line @typescript-eslint/ban-types
export declare type ProCoreActionType<T = {}> = {
  /** @name 刷新 */
  reload: (resetPageIndex?: boolean) => void;
  /** @name 刷新并清空 */
  reloadAndRest?: () => void;
  /** @name 重置 */
  reset?: () => void;
  /** @name 清空选择 */
  clearSelected?: () => void;
  pageInfo?: PageInfo;
} & T;

export type SortValue = {
  value: SortOrder;
  multiple: number;
  showNum: number;
};

export type SorterItem = Record<string, SortValue>;
export type ActionType = ProCoreActionType & {
  fullScreen?: () => void;
  pagination?: TablePaginationConfig;
  data: any;
  selectedRowKeys: string[];
  selectedRows: any[];
  setFiltersArg: any;
  setSortOrderMap: any;
  defaultSorterMap: SorterItem;
  columnsMap: Record<string, ColumnsState>;
  getColumnsMap: () => Record<string, ColumnsState>;
  clearRowKeys: () => void;
  getSortOrders: () => ({
    column: any;
    asc: boolean;
  } | null)[];
};

export interface CustomSearchComponentProps {
  value?: any;
  onChange?: (e: any) => void;
}
export const OpColKey = '_OperateKey';
export declare type CustomSearchComponent =
  | React.ReactNode
  | ((props: CustomSearchComponentProps) => React.ReactNode);
export type ScProColumnType<RecordType> = Omit<
  ColumnType<RecordType>,
  'defaultSortOrder' | 'sorter'
> & {
  // defaultSortOrder?: SortOrder | SortValue;
  sorter?:
  | boolean
  | CompareFn<RecordType>
  | {
    compare?: CompareFn<RecordType>;
    /** Config multiple sorter order priority */
    multiple?: number;
    value?: SortOrder;
  };
  canSearch?: boolean;
  customSearchComponent?: CustomSearchComponent;
  /** @deprecated 你可以使用 tooltip，这个更改是为了与 antd 统一 */
  tip?: string;
  /** @deprecated 是否隐藏 */
  hidden?: boolean;
  disable?:
  | boolean
  | {
    checkbox: boolean;
  };
};

export interface ScProColumnGroupType<RecordType>
  extends Omit<ScProColumnType<RecordType>, 'dataIndex'> {
  children: ScProColumn<RecordType>;
}

export declare type ScProColumn<RecordType = unknown> = (
  | ScProColumnGroupType<RecordType>
  | ScProColumnType<RecordType>
)[];

export type ColumnsState = {
  show?: boolean;
  fixed?: 'right' | 'left' | undefined;
  order?: number;
  disable?:
  | boolean
  | {
    checkbox: boolean;
  };
};

export type ColumnsStateType = {
  defaultValue?: Record<string, ColumnsState>;
  value?: Record<string, ColumnsState>;
  onChange?: (map: Record<string, ColumnsState>) => void;
};

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
export interface ScTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  /** 当选中时触发 */
  key?: string;
  onSelectRow?: (selectedRowKeys: string[], selectedRows: any[]) => void;
  /** 列表数据 */
  data?: { rows: any[]; total: number; current: number; size: number };
  /** 请求数据的远程方法 */
  request?: (params: any) => Promise<any>;
  /** 数据加载完成后触发,会多次触发 */
  onLoad?: (data: any) => any;
  /** 请求参数限制 */
  preLoadHandle?: (params: any) => boolean;
  /** 点击刷新数据 */
  refresh?: () => void;
  /** 请求的参数 */
  params?: any;
  /** 表格容器的 class 名 */
  prefixCls?: string;
  /** 样式 */
  className?: string;
  /** 每页显示多少数据 */
  pageSize?: number;
  /** 是否自动加载 配合request使用 */
  autoload?: boolean;
  /** 是否显示多选框 */
  checkbox?: boolean;
  /** 数据中哪个值作为选中的key */
  rowKey?: string;
  /** 复选时选中的key */
  selectedRowKeys?: string[];
  /** 复选时选中的对象 */
  selectedRows?: any[];
  /** 分页数据 */
  pagination?: false | TablePaginationConfig;
  /** React.MutableRefObject<any> | ((saveRef: any) => void) 获取组件对外暴露的参数 */
  saveRef?: any;
  /** 列选中 */
  rowSelected?: boolean;
  /** @name 渲染操作栏 */
  toolBarRender?: ToolBarProps<T>['toolBarRender'] | false;
  /** @name 左上角的 title */
  headerTitle?: React.ReactNode;
  /** @name 操作栏配置 */
  options?: OptionConfig | false;
  /** @name 标题旁边的 tooltip */
  tooltip?: string;
  /** @name ListToolBar 的属性 */
  toolbar?: ListToolBarProps;
  /** @name 查询表单和 Table 的卡片 border 配置 */
  cardBordered?: boolean;
  /** @name table 外面卡片的设置 */
  cardProps?: CardProps;
  /** @name table 列属性 */
  columns?: ScProColumn<T>;
  /** 受控的列状态，可以操作显示隐藏 */
  columnsState?: ColumnsStateType;
  /** 树的张开字段 */
  treeDataIndex?: string;
  /** 拖拽事件 */
  onDrop?: (dargNode: any, newData: any[], oldData: any[]) => Promise<any> | boolean | void;
  /** 是否开起拖拽 */
  dragSort?: boolean | string;
  /** 是否时复合排序 */
  multipleSort?: boolean;
  /** 排序字段 */
  defaultSort?: SorterItem;
}

export type ListToolBarSetting = {
  icon: React.ReactNode;
  tooltip?: string;
  key?: string;
  onClick?: (key?: string) => void;
};

/** Antd 默认直接导出了 rc 组件中的 Tab.Pane 组件。 */
type TabPane = TabPaneProps & {
  key?: string;
};

export type ListToolBarTabs = {
  activeKey?: string;
  onChange?: (activeKey: string) => void;
  items?: TabPane[];
};

export type ListToolBarMenu = ListToolBarHeaderMenuProps;

export type SearchPropType = SearchProps | React.ReactNode | boolean;
export type SettingPropType = React.ReactNode | ListToolBarSetting;

export type ListToolBarProps = {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  /** 标题 */
  title?: React.ReactNode;
  /** 副标题 */
  subTitle?: React.ReactNode;
  /** 标题提示 */
  tooltip?: string | TooltipProps;
  /** 搜索输入栏相关配置 */
  search?: SearchPropType;
  /** 搜索回调 */
  onSearch?: (keyWords: string) => void;
  /** 工具栏右侧操作区 */
  actions?: React.ReactNode[];
  /** 工作栏右侧设置区 */
  settings?: SettingPropType[];
  /** 是否多行展示 */
  multipleLine?: boolean;
  /** 过滤区，通常配合 LightFilter 使用 */
  filter?: React.ReactNode;
  /** 标签页配置，仅当 `multipleLine` 为 true 时有效 */
  tabs?: ListToolBarTabs;
  /** 菜单配置 */
  menu?: ListToolBarMenu;
};
export type ListToolBarMenuItem = {
  key: React.Key;
  label: React.ReactNode;
  disabled?: boolean;
};

export type ListToolBarHeaderMenuProps = {
  type?: 'inline' | 'dropdown' | 'tab';
  activeKey?: React.Key;
  items?: ListToolBarMenuItem[];
  onChange?: (activeKey?: React.Key) => void;
  prefixCls?: string;
};
