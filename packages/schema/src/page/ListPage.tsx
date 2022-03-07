/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable @typescript-eslint/ban-types */
import React, { memo, forwardRef } from 'react';
import usePageList from '../hooks/useListPage';
import { ListPageContext } from '../context';
import type { UseListPageProp } from '../hooks/useListPage';

import type { PageConfig } from '../interface';

export interface IPageListOptions {
  readonly forwardRef?: boolean;
}

export interface IListPageOptions {
  readonly forwardRef?: boolean;
}

export function ListPage<P extends object, TRef = {}>(
  baseComponent: React.ForwardRefRenderFunction<TRef, P>,
  pageConfig: PageConfig,
  options: IListPageOptions & { forwardRef: true },
): React.MemoExoticComponent<
  React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<TRef>>
>;

export function ListPage<P extends object>(
  baseComponent: React.FunctionComponent<P>,
  pageConfig: PageConfig,

  options?: IListPageOptions,
): React.FunctionComponent<P>;

// n.b. base case is not used for actual typings or exported in the typing files
export function ListPage<P extends object & { scope: UseListPageProp<any> }, TRef = {}>(
  baseComponent: React.FunctionComponent<any>,
  pageConfig: PageConfig,
  options?: IPageListOptions,
) {
  const realOptions = {
    forwardRef: false,
    ...options,
  };

  let scope = {};
  const baseComponentName = baseComponent.displayName || baseComponent.name;
  const wrappedComponent = (props: P, ref: React.Ref<TRef>) => {
    scope = usePageList(pageConfig, props);
    if (ref && Object.keys(ref).length > 0) {
      props = { ...props, ref };
    }
    const newCmp = React.createElement(baseComponent, props);
    return <ListPageContext.Provider value={scope}>{newCmp}</ListPageContext.Provider>;
  };
  let memoComponent;
  if (realOptions.forwardRef) {
    // we have to use forwardRef here because:
    // 1. it cannot go before memo, only after it
    // 2. forwardRef converts the function into an actual component, so we can't let the baseComponent do it
    //    since it wouldn't be a callable function anymore
    memoComponent = memo(forwardRef(wrappedComponent));
  } else {
    memoComponent = memo(wrappedComponent);
  }

  copyStaticProperties(baseComponent, memoComponent);
  memoComponent.displayName = baseComponentName;

  return memoComponent;
}

const hoistBlackList: any = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true,
};

function copyStaticProperties(base: any, target: any) {
  Object.keys(base).forEach((key) => {
    if (!hoistBlackList[key]) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!);
    }
  });
}

export default ListPage;
