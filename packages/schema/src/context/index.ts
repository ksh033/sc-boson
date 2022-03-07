import React from 'react';
import type { UseEditPageProp } from '../hooks/useEditPage';
import type { UseListPageProp } from '../hooks/useListPage';
import type { History } from 'history-with-query';

export interface UmiProp {
  history?: History;
  ModelProvider?: any;
}
export const umi: UmiProp = {
  history: undefined,
  ModelProvider: undefined,
};
export interface SchemaContextProp {
  umi: UmiProp;
  dataTypeFormat?: (
    text: string | number | React.ReactText[],
    valueType: string,
    record: Record<any, any>,
  ) => any;
  dictFormat?: (value: any, dictKey: string) => any;
  tableOpColCmp?: any;
}

export const Schema: SchemaContextProp = {
  umi,
  dataTypeFormat: () => {},
  dictFormat: () => {},
  tableOpColCmp: null,
};

export const ListPageContext = React.createContext<any>({});

export const useListPageContext = <T>(): UseListPageProp<T> => {
  return React.useContext<UseListPageProp<T>>(ListPageContext);
};

const SchemaContext = React.createContext<SchemaContextProp>(Schema);

export const useSchemaContext = (): SchemaContextProp => {
  return React.useContext<SchemaContextProp>(SchemaContext);
};

const EditPageContext = React.createContext<any>({});

export const useEditPageContext = <T>(): UseEditPageProp<T> => {
  return React.useContext<UseEditPageProp<T>>(EditPageContext);
};

export { SchemaContext, EditPageContext };
