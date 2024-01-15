import CDrawer from './CDrawer';
import type { CDrawerDialogProps } from './CDrawer';
export { CDrawerDialogProps };
export default {
  show: (props: CDrawerDialogProps) => {
    const config = {
      okCancel: true,
      ...props,
    };
    return CDrawer(config);
  },
};
