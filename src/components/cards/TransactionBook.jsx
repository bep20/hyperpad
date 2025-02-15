import message from 'antd/es/message';
import Table from 'antd/es/table';
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AppContext } from '../../context/AppStore';
import { getTransactionLink } from '../../utils/helpers';
dayjs.extend(relativeTime);

export const TransactionBook = ({
  loading,
  data,
  width = 700,
  height = 900,
}) => {
  const [appStore] = useContext(AppContext);

  const columns = [
    {
      title: 'Txn hash',
      dataIndex: 'tHash',
      render: text => (
        <p
          style={{
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '4px',
            margin: '0px',
          }}
          className='text-[12px]'>
          {text}
        </p>
      ),
    },
    // completedAt
    {
      title: 'Completed At',
      dataIndex: 'completedAt',
      render: text => (
        <p
          style={{
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '4px',
            margin: '0px',
          }}
          className='text-[12px]'>
          {dayjs(+text).fromNow()}
        </p>
      ),
    },

    {
      title: 'Details',
      dataIndex: 'tHash',
      render: text => (
        <p
          style={{
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '4px',
            margin: '0px',
          }}
          className='text-[12px]'>
          <a
            href={getTransactionLink(
              { transaction_hash: text },
              appStore?.currentNetwork,
            )}
            target='_blank'>
            View Details
          </a>
        </p>
      ),
    },
  ];

  return (
    <div style={{ width: width }}>
      <h3>Transaction Logs:-</h3>
      <Table
        columns={columns}
        loading={loading}
        dataSource={data || []}
        virtual
        pagination={false}
        scroll={{
          y: height,
        }}
      />
    </div>
  );
};
