import { Modal, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import UploadList from 'antd/es/upload/UploadList';
import type { CSSProperties } from 'react';
import React, { memo, useState } from 'react';
import type { SortEnd } from 'react-sortable-hoc';
import { arrayMove, SortableContainer, SortableElement } from 'react-sortable-hoc';
import { imagePreview } from './pictureUtil';
import type { Props, SortableItemParams, SortableListParams } from './types';

export { UploadFile } from 'antd/es/upload/interface';

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
  return <img src={file} alt="avatar" style={{ width: '100%' }} />;
};

const SortableItem = SortableElement<SortableItemParams>((params: SortableItemParams) => {
  // todo 自定义显示
  const iconRender = (file: UploadFile<any>) => {
    return preView(file.url || '', false);
  };

  return (
    <UploadList
      locale={{ previewFile: '预览图片', removeFile: '删除图片' }}
      showDownloadIcon={false}
      listType={params.props.listType}
      onPreview={params.onPreview}
      iconRender={iconRender}
      onRemove={params.onRemove}
      items={[params.item]}
    />
  );
});

const listStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  maxWidth: '100%',
};
const SortableList = SortableContainer<SortableListParams>((params: SortableListParams) => {
  return (
    <div style={listStyle} className="sc-sort-list">
      {params.items.map((item, index) => (
        <SortableItem
          key={`${item.uid}`}
          index={index}
          item={item}
          props={params.props}
          onPreview={params.onPreview}
          onRemove={params.onRemove}
        />
      ))}
      <Upload {...params.props} showUploadList={false} onChange={params.onChange}>
        {params.props.children}
      </Upload>
    </div>
  );
});

const PicturesGrid: React.FC<Props> = memo(({ onChange: onFileChange, ...props }) => {
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

  const onPreview = async (file: UploadFile) => {
    await imagePreview(file, ({ image }) => {
      setPreviewImage(image);
    });
  };

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
        onPreview={onPreview}
      />
      <Modal
        visible={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage('')}
        bodyStyle={{ padding: 0 }}
        width={400}
      >
        {preView(previewImage, true)}
      </Modal>
    </>
  );
});

export default PicturesGrid;
