import type { MutableRefObject } from 'react';
//@ts-nocheck
const isNode =
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

const isBrowser = () => {
  if (process.env.NODE_ENV === 'TEST') {
    return true;
  }
  return typeof window !== 'undefined' && typeof window.document !== 'undefined' && !isNode;
};
type TargetValue<T> = T | undefined | null;
type TargetType = HTMLElement | Element | Window | Document;
export type BasicTarget<T extends TargetType = Element> =
  | (() => TargetValue<T>)
  | TargetValue<T>
  | MutableRefObject<TargetValue<T>>;

export default isBrowser;
