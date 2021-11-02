import type { ProColumns } from './typing';
import Schema from 'async-validator';
import type { ErrorLineState } from './index';
import type { Dispatch } from 'react';

export function validateRules(
  columns: ProColumns<any>[],
  value: any[],
  setErrorLine: Dispatch<ErrorLineState>,
) {
  const descriptor: any = {};
  columns.forEach((item) => {
    const rules = item.formItemProps?.rules;
    if (item.dataIndex && item.editable && rules) {
      const name = JSON.stringify(item.dataIndex) || '';
      if (Array.isArray(rules)) {
        descriptor[`${name.replace(/"/g, '')}`] = rules.map((it: any) => {
          if (it.required) {
            return {
              ...it,
              type: it.type ? it.type : 'string',
              transform(val: any) {
                if (val !== undefined && val !== null && val !== '') {
                  return String(val).trim();
                }
                return val;
              },
            };
          }
          return {
            ...it,
            type: it.type ? it.type : 'string',
          };
        });
      }
    }
  });
  const validator = new Schema(descriptor);
  const fileError: string[] = [];

  if (Array.isArray(value)) {
    value.forEach((item, index: number) => {
      if (fileError.length === 0) {
        validator.validate(item, { first: true }, (errors: any) => {
          if (errors) {
            if (fileError.length > 0) {
              return Promise.resolve(true);
            }
            setErrorLine({
              field: errors[0].field,
              index: item.rowIndex,
            });
            fileError.push(`第${index + 1}行:${errors[0].message}`);
          }
          return Promise.resolve(true);
        });
      }
    });
  }

  if (fileError.length > 0) {
    return Promise.reject(new Error(fileError[0]));
  }
  setErrorLine(null);
  return Promise.resolve(true);
}
