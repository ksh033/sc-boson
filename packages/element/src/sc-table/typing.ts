


export type PageInfo = {
  pageSize: number;
  total: number;
  current: number;
};
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
}  & T;


export type ActionType = ProCoreActionType & {
  fullScreen?: () => void;
};

