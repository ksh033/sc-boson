import { DeleteOutlined, EyeOutlined, FileOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Modal, Progress, Spin, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import type { CSSProperties } from 'react';
import React, { memo, useState } from 'react';
import type { SortEnd } from 'react-sortable-hoc';
import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';
import type { Props, SortableItemParams, SortableListParams } from './types';

export { UploadFile } from 'antd/es/upload/interface';

interface DragableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  file: UploadFile;
  fileList: UploadFile[];
  params: SortableListParams;
}

const preView = (file: string, isModal: boolean) => {
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
  // // todo 自定义显示
  const iconRender = (file: UploadFile<any>) => {
    if (file.status === 'uploading') {
      console.log('uploadfile', file);
      return (
        <Progress
          percent={file.percent}
          size="small"
          showInfo={false}
          strokeColor={{
            from: '#108ee9',
            to: '#87d068',
          }}
        />
      );
    }
    return preView(file.url || '', false);
  };

  // return (
  //   <UploadList
  //     locale={{ previewFile: '预览图片', removeFile: '删除图片' }}
  //     showDownloadIcon={false}
  //     listType={params.props.listType}
  //     onPreview={params.onPreview}
  //     iconRender={iconRender}
  //     onRemove={params.onRemove}
  //     items={[params.item]}
  //   />
  // );

  if (params.props.listType !== 'picture-card') {
    return <div>{params.originNode}</div>;
  } else {
    return (
      <div className="upload-list-item">
        <div className="upload-list-item-info">
          <span className="upload-list-item-span">
            <a
              className="upload-list-item-thumbnail"
              href={params.file.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {iconRender(params.file)}
            </a>
          </span>
          <span className="upload-list-item-actions">
            <a
              href={params.file.url}
              target="_blank"
              rel="noopener noreferrer"
              title="预览图片"
              style={{ padding: 4 }}
            >
              <EyeOutlined style={{ color: 'hsla(0,0%,100%,.85)', fontSize: 16 }} />
            </a>
            <Button
              type="link"
              style={{ padding: 4, margin: 0 }}
              onClick={() => {
                params.onRemove?.(params.file);
              }}
            >
              <DeleteOutlined size={16} style={{ color: 'hsla(0,0%,100%,.85)', fontSize: 16 }} />
            </Button>
          </span>
        </div>
      </div>
    );
  }
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
  return (
    <div style={listStyle} className="sc-sort-list">
      <Upload
        locale={{ previewFile: '预览图片', removeFile: '删除图片' }}
        listType={params.props.listType || 'picture-card'}
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
      {/* {params.items.map((item, index) => (
        <div
          className={[listType === 'picture' ? 'upload-list-inline' : ''].join(' ')}
          key={`${item.uid}`}
        >
          <SortableItem
            key={`sort-${item.uid}`}
            index={index}
            item={item}
            props={params.props}
            onPreview={params.onPreview}
            onRemove={params.onRemove}
          />
        </div>
      ))} */}
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
      console.log('newFileList', newFileList);
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
          distance={0.5}
          items={fileList}
          onSortEnd={onSortEnd}
          axis="xy"
          helperClass="SortableHelper"
          props={props}
          onChange={onChange}
          onRemove={onRemove}
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
