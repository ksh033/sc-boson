import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Button, Progress, Spin } from 'antd';
import type { SortableItemParams } from './types';

const PictureItem: React.FC<SortableItemParams> = (props) => {
  const { file, onRemove } = props;

  // // todo 自定义显示
  const loadingRender = (fileIte: UploadFile<any>) => {
    return (
      <span className="upload-span">
        <a
          className="upload-list-item-thumbnail"
          href={fileIte.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="upload-list-item-name"
          title={file.name}
          href={file.url}
        >
          <Progress
            percent={file.percent}
            size="small"
            showInfo={false}
            strokeColor={{
              from: '#108ee9',
              to: '#87d068',
            }}
          />
        </a>
      </span>
    );
  };

  return (
    <div className="upload-list-item-picture">
      <div className="upload-list-item-picture-info">
        {file.status === 'uploading' ? (
          loadingRender(file)
        ) : (
          <span className="upload-span">
            <a
              className="upload-list-item-thumbnail"
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={file.url} alt={file.name} className="upload-list-item-image" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="upload-list-item-name"
              title={file.name}
              href={file.url}
            >
              {file.name}
            </a>
            <span className="upload-list-item-card-actions picture">
              <Button
                type="link"
                style={{ padding: 4, margin: 0 }}
                onClick={() => {
                  onRemove?.(file);
                }}
              >
                <DeleteOutlined size={16} style={{ color: '#333', fontSize: 16 }} />
              </Button>
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export default PictureItem;
