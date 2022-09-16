import type * as React from 'react';

export interface DataComponentProps {
  textField?: any;
  valueField?: string;
  data?: any[];
  params?: any;
  request?: (...args: any) => Promise<any>;
  onLoad?: (dataSource: any) => any;
  modelKey?: string;
  loading?: boolean;
  autoload?: boolean;
  model?: string;
}

export type DataComponent = React.ComponentClass<DataComponentProps>;
