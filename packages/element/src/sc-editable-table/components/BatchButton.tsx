import { DeleteOutlined, RestOutlined, SelectOutlined } from '@ant-design/icons';
import { Button, message, Space } from 'antd';
import React, { memo, useMemo } from 'react';
import type { BatchOptionsType } from '..';
import { useRefFunction } from '../../_util/useRefFunction';
import Container from '../container';

type BatchButtonProps = {
  checkbox: boolean;
  setCheckbox: (checkbox: boolean) => void;
  onDeleteByKeys: (deleteList?: any[] | true) => void;
  batchOptions?: BatchOptionsType;
};
const defaultBatchOptions = { allClear: true, batchSelect: true };

const BatchButton: React.FC<BatchButtonProps> = (props) => {
  const { onDeleteByKeys, checkbox = false, setCheckbox, batchOptions = false } = props;

  const btns = useMemo(() => {
    if (typeof batchOptions === 'boolean' && batchOptions === false) {
      return {
        allClear: false,
        batchSelect: false,
      };
    } else {
      return {
        ...defaultBatchOptions,
        ...(batchOptions || {}),
      };
    }
  }, [batchOptions]);

  const container = Container.useContainer();

  const AllClearBtn = useMemo(() => {
    return btns.allClear ? (
      <Button
        icon={<DeleteOutlined />}
        onClick={() => {
          onDeleteByKeys(true);
        }}
      >
        清空列表
      </Button>
    ) : null;
  }, [btns.allClear, onDeleteByKeys]);

  const onCancel = useRefFunction(() => {
    container.selectedRef.current = {
      selectedRowKeys: [],
      selectedRows: [],
    };
    setCheckbox(false);
  });

  const onBatchDelete = useRefFunction(() => {
    const selectedRowKeys =
      container.selectedRef.current && Array.isArray(container.selectedRef.current.selectedRowKeys)
        ? container.selectedRef.current.selectedRowKeys
        : [];
    if (selectedRowKeys.length > 0) {
      onDeleteByKeys(selectedRowKeys);
    } else {
      message.warn('请先选择');
    }
  });

  const BatchSelectBtn = useMemo(() => {
    return checkbox ? (
      <>
        <Button type="primary" ghost icon={<DeleteOutlined />} onClick={onBatchDelete}>
          批量删除
        </Button>
        <Button icon={<RestOutlined />} onClick={onCancel}>
          取消选择
        </Button>
      </>
    ) : (
      <Button
        icon={<SelectOutlined />}
        onClick={() => {
          setCheckbox(true);
        }}
      >
        批量选择
      </Button>
    );
  }, [checkbox, onBatchDelete, onCancel, setCheckbox]);

  return (
    <div className="sc-left-bottom-batch-btn">
      <Space>
        {AllClearBtn}
        {btns.batchSelect ? BatchSelectBtn : null}
      </Space>
    </div>
  );
};

export default memo(BatchButton);
