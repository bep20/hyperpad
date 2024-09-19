import React, { useMemo } from 'react';
import Upload from 'antd/es/upload';
import Table from 'antd/es/table';
import Pagination from 'antd/es/pagination';
import { UploadOutlined } from '@ant-design/icons';
import { HyperButton } from '../../../components/buttons/HyperButton';
import { HyperSButton } from '../../../components/buttons/HyperSButton';
import { WalletStatus } from '../constants/data';

const FreezeWalletTable = ({
  data,
  editableColumns,
  handleUpload,
  downloadSampleCSV,
  handleAddRow,
  setData,
  currentPage,
  setCurrentPage,
  pageSize,
  loadStatus,
  frozeToken,
  enabled,
}) => {
  const freezeCount = useMemo(
    () =>
      data.reduce(
        (ac, item) =>
          item.status === WalletStatus.ACTIVE && item?.selected ? ac + 1 : ac,
        0,
      ),
    [data],
  );
  return (
    <>
      <div className='flex justify-between mb-4'>
        <div className=' flex flex-wrap gap-x-3 '>
          <Upload showUploadList={false} beforeUpload={handleUpload}>
            <HyperButton
              btnSize='small-btn'
              icon={<UploadOutlined />}
              text='Upload CSV'
            />
          </Upload>
          <HyperButton
            onClick={downloadSampleCSV}
            btnSize='small-btn'
            text='Sample CSV'
          />
          <HyperSButton
            btnSize='small-btn'
            onClick={() => setData([])}
            text='Clear Table'
          />
          <HyperButton
            text='Add Row'
            onClick={handleAddRow}
            btnSize='small-btn'
          />
        </div>
        <div className='flex gap-x-3'>
          <HyperButton
            disabled={!enabled}
            text={`Freeze (${freezeCount})`}
            btnSize='small-btn'
            onClick={frozeToken}
          />

          <HyperButton
            text='Load status'
            btnSize='small-btn'
            onClick={loadStatus}
          />
        </div>
      </div>
      <Table
        dataSource={data.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        )}
        columns={editableColumns}
        pagination={false}
        size='small'
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={data.length}
        onChange={page => setCurrentPage(page)}
        style={{ marginTop: '16px', textAlign: 'center' }}
      />
    </>
  );
};

export default FreezeWalletTable;
