//@ts-nocheck
const isNode =
  typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

const isBrowser = () => {
  if (process.env.NODE_ENV === 'TEST') {
    return true;
  }
  return typeof window !== 'undefined' && typeof window.document !== 'undefined' && !isNode;
};

export default isBrowser;
