import { FileOutlined, LoadingOutlined } from '@ant-design/icons';
import { Modal, Spin, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import type { CSSProperties } from 'react';
import React, { memo, useMemo, useState } from 'react';
import type { SortEnd } from 'react-sortable-hoc';
import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';
import type { Props, SortableItemParams, SortableListParams } from './types';
import PictureCard from './PictureCard';
import Picture from './Picture';
import classNames from 'classnames';
export type { UploadFile } from 'antd/es/upload/interface';

interface DragableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  file: UploadFile;
  fileList: UploadFile[];
  params: SortableListParams;
}

export const preView = (file: string, isModal: boolean) => {
  if (file !== '') {
    if (/\.(gif|jpg|jpeg|png|GIF|JPEG|JPG|PNG)$/.test(file)) {
      return (
        <img
          src={file}
          alt="avatar"
          style={{ width: '100%', height: isModal ? '560px' : '100%' }}
        />
      );
    }
    if (/\.(mp4|rmvb|avi|ts)$/.test(file)) {
      return (
        <video controls autoPlay style={{ width: '100%', height: isModal ? '560px' : '100%' }}>
          <source src={file} type="video/mp4" />
        </video>
      );
    }
  }
  return <FileOutlined style={{ width: '100%', color: '#40a9ff' }} />;
};

const SortableItem = SortableElement<SortableItemParams>((params: SortableItemParams) => {
  const map = {
    'picture-card': () => {
      return <PictureCard {...params}> </PictureCard>;
    },
    picture: () => {
      return <Picture {...params}> </Picture>;
    },
    text: () => {
      return params.originNode;
    },
  };

  return map[params.props.listType || 'picture-card']();
});

const DragableUploadListItem = ({
  originNode,
  file,
  fileList,
  params,
}: DragableUploadListItemProps) => {
  const index = fileList.indexOf(file);
  return (
    <SortableItem
      originNode={originNode}
      file={file}
      props={params.props}
      index={index}
      onPreview={params.onPreview}
      onRemove={params.onRemove}
    />
  );
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  maxWidth: '100%',
  alignItems: 'center',
};
const SortableList = SortableContainer<SortableListParams>((params: SortableListParams) => {
  // todo 自定义显示
  const iconRender = (file: UploadFile<any>) => {
    if (file.status === 'uploading') {
      return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;
    }
    return preView(file.url || '', false);
  };
  const listType = useMemo(() => {
    return params.props.listType || 'picture-card';
  }, [params.props.listType]);

  return (
    <div className="sc-sort-list" style={listStyle}>
      {listType === 'picture-card' || listType === 'picture' ? (
        <div
          style={listStyle}
          className={classNames({
            'upload-list-picture-container': listType === 'picture',
          })}
        >
          {params.items.map((item, index) => (
            <SortableItem
              // eslint-disable-next-line react/no-array-index-key
              key={`key-${index}`}
              originNode={<img src={item.url} />}
              file={item}
              props={params.props}
              index={index}
              onPreview={params.onPreview}
              onRemove={params.onRemove}
            />
          ))}
        </div>
      ) : (
        <Upload
          locale={{ previewFile: '预览图片', removeFile: '删除图片' }}
          listType={listType}
          onPreview={params.onPreview}
          iconRender={iconRender}
          onRemove={params.onRemove}
          fileList={params.items}
          itemRender={(originNode, file, currFileList) => (
            <DragableUploadListItem
              originNode={originNode}
              file={file}
              fileList={currFileList}
              params={params}
            />
          )}
        />
      )}

      <Upload {...params.props} showUploadList={false} onChange={params.onChange}>
        {params.props.children}
      </Upload>
    </div>
  );
});

const PicturesGrid: React.FC<Props> = memo(
  ({ onChange: onFileChange, preWidth = 650, ...props }) => {
    const [previewImage, setPreviewImage] = useState('');
    const fileList = props.fileList || [];
    const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
      onFileChange({ fileList: arrayMove(fileList, oldIndex, newIndex) });
    };

    const onChange = ({ fileList: newFileList }: UploadChangeParam) => {
      onFileChange({ fileList: newFileList });
    };

    const onRemove = (file: UploadFile) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      onFileChange({ fileList: newFileList });
    };

    // const onPreview = async (file: UploadFile) => {
    //   await imagePreview(file, ({ image }) => {
    //     setPreviewImage(image);
    //   });
    // };

    return (
      <>
        <SortableList
          // 当移动 1 之后再触发排序事件，默认是0，会导致无法触发图片的预览和删除事件
          distance={1}
          items={fileList}
          onSortEnd={onSortEnd}
          axis="xy"
          helperClass="SortableHelper"
          props={props}
          onChange={onChange}
          onRemove={onRemove}
          disableAutoscroll={true}
          // onPreview={onPreview}
        />
        <Modal
          visible={!!previewImage}
          footer={null}
          onCancel={() => setPreviewImage('')}
          bodyStyle={{ padding: 0 }}
          width={preWidth}
        >
          {preView(previewImage, true)}
        </Modal>
      </>
    );
  },
);

export default PicturesGrid;
