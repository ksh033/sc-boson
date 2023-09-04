import type { UploadFile } from 'antd';
import { Button, Progress } from 'antd';
import { preView } from '.';
import type { SortableItemParams } from './types';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const PictureCard: React.FC<SortableItemParams> = (params) => {
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
};

export default PictureCard;
