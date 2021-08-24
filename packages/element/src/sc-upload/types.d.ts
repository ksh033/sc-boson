import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd/es/upload';
import type { UploadChangeParam } from 'antd/es/upload/interface';
import type { ReactNode } from 'react';

export type Props = {
  onChange: (params: { fileList: UploadFile[] }) => void;
  children?: ReactNode;
} & UploadProps;

type SortableParams = {
  props: Omit<Props, 'onChange'>;
  onPreview: (file: UploadFile) => void;
  onRemove: (file: UploadFile) => void | boolean;
};

export type SortableItemParams = {
  item: UploadFile;
} & SortableParams;

export type SortableListParams = {
  onChange: (info: UploadChangeParam) => void;
  items: UploadFile[];
} & SortableParams;
