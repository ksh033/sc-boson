/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';
import { forwardRef, memo } from "react"
import UseEditPage from '../hooks/useEditPage';
import type { UseEditPageProp } from '../hooks/useEditPage';
import  { useSchemaContext,EditPageContext } from '../context'
import type { PageConfig } from '../interface';
// import Provider from '@@/plugin-model/Provider'

export interface IModalPageOptions {
  readonly forwardRef?: boolean;
}

export function EditPage<P extends object, TRef = {}>(
  baseComponent: React.ForwardRefRenderFunction<TRef, P>,
  pageConfig: PageConfig,
  options: IModalPageOptions & { forwardRef: true }
): React.MemoExoticComponent<
  React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<TRef>>
>

export function EditPage<P extends object>(
  baseComponent: React.FunctionComponent<P>,
  pageConfig: PageConfig,

  options?: IModalPageOptions
): React.FunctionComponent<P>

// n.b. base case is not used for actual typings or exported in the typing files
export function EditPage<P extends object & { scope: UseEditPageProp }, TRef = {}>(
  baseComponent: React.FunctionComponent<any>,
  pageConfig: PageConfig,
  options?: IModalPageOptions,
) {
  const realOptions = {
    forwardRef: false,
    ...options,
  };
  

  let scope = {};
 const baseComponentName = baseComponent.displayName || baseComponent.name;
  const wrappedComponent = (props: P, ref: React.Ref<TRef>) => {
    scope = UseEditPage(pageConfig, props);

    if (ref && Object.keys(ref).length>0){
      props={...props,ref}
    }
     const newCmp= React.createElement(baseComponent,props);
     const {umi}=useSchemaContext();
     const Provider=umi.ModelProvider || React.Fragment
    return <Provider><EditPageContext.Provider value={scope}>{newCmp}</EditPageContext.Provider></Provider>;
  };
  let memoComponent
  if (realOptions.forwardRef) {
      // we have to use forwardRef here because:
      // 1. it cannot go before memo, only after it
      // 2. forwardRef converts the function into an actual component, so we can't let the baseComponent do it
      //    since it wouldn't be a callable function anymore
      memoComponent = memo(forwardRef(wrappedComponent))
  } else {
      memoComponent = memo(wrappedComponent)
  }

  copyStaticProperties(baseComponent, memoComponent)
  memoComponent.displayName = baseComponentName

 

  return memoComponent
}
const hoistBlackList: any = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true
}

function copyStaticProperties(base: any, target: any) {
  Object.keys(base).forEach(key => {
      if (!hoistBlackList[key]) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!)
      }
  })
}
