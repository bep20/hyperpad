import React, { useContext } from 'react';
import Table from 'antd/es/table';
import Skeleton from 'antd/es/skeleton';

import { AppContext, NETWORKS } from '../../../context/AppStore';
import { HyperSButton } from '../../../components/buttons/HyperSButton';

import { httpClient } from '../../../utils/api';
import { getTransactionLink } from '../../../utils/helpers';

const getTransferDate = curr_time =>
  curr_time
    ? `${new Date(curr_time).toLocaleDateString()} ${new Date(
        curr_time,
      ).toLocaleTimeString()}`
    : '-';

const SNAP_STATUS_MAP = {
  1: 'PROCESSING',
  2: 'COMPLETED',
  3: 'FAILED',
};
const SNAP_STATUS_ENUM = {
  PROCESSING: 1,
  COMPLETED: 2,
  FAILED: 3,
};

export const SnapShotHistory = ({ snapHistory, isHistoryLoading }) => {
  const [appStore, dispatchAppStore] = useContext(AppContext);

  const getAccessUrl = snapshot_id =>
    new Promise((resolve, reject) => {
      httpClient
        .request({
          url: '/get_download_url',
          params: {
            snapshot_id,
          },
        })
        .then(response => {
          resolve(response?.data);
        });
    });

  const handleSnapDownload = async snapshot_id => {
    // handle file download
    const { presignedUrl } = await getAccessUrl(snapshot_id);
    // window.location.href = presignedUrl;
    const link = document.createElement('a');
    link.href = presignedUrl;
    link.setAttribute('download', 'snapshot.csv');
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up: remove the <a> element
    link.parentNode.removeChild(link);
  };

  const TB_DETAILS_COLUMN = [
    {
      title: 'Token Address',
      dataIndex: 'mint_address',
      key: 'mint_address',
      render: (text, record, index) => <span>{text}</span>,
    },
    {
      title: 'Snapshot Time',
      dataIndex: 'snap_time',
      key: 'snap_time',
      render: (text, record, index) => <span>{getTransferDate(text)}</span>,
    },
    {
      title: 'Transaction',
      dataIndex: 'transaction_hash',
      key: 'transaction_hash',
      render: (text, record) => (
        <span>
          {text ? (
            <a
              target='_blank'
              href={getTransactionLink(record, appStore?.currentNetwork)}
              rel='noreferrer'>
              Transaction
            </a>
          ) : (
            ''
          )}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'snap_status',
      key: 'snap_status',
      render: (text, record) => <span>{SNAP_STATUS_MAP[text] || '-'}</span>,
    },
    {
      title: 'Holders',
      dataIndex: 'file_key',
      key: 'file_key',
      render: (text, record) => (
        <HyperSButton
          btnSize='small-btn'
          disabled={record.snap_status !== SNAP_STATUS_ENUM.COMPLETED}
          onClick={() => handleSnapDownload(record?.snapshot_id)}
          text='Download'
        />
      ),
    },
  ];

  return (
    <div>
      {isHistoryLoading ? (
        <Skeleton active={isHistoryLoading} />
      ) : (
        <Table
          columns={TB_DETAILS_COLUMN}
          dataSource={snapHistory || []}
          pagination={false}
          size='small'
          scroll={{ x: '100%' }}
        />
      )}
    </div>
  );
};
