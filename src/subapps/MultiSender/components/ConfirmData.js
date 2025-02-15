import React, { useState, useMemo, useContext, useEffect } from 'react';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Input from 'antd/es/input';
import Upload from 'antd/es/upload';
import message from 'antd/es/message';
import Space from 'antd/es/space';
import Steps from 'antd/es/steps';
import Pagination from 'antd/es/pagination';
import Card from 'antd/es/card/Card';
import { TOKEN_TYPES } from '../constants/token';

export const ConfirmData = ({
  aggregatedData,
  tokenAddress,
  tokenType,
  tokenDetails,
  totalTokenToTransfer,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const nonEditableColumns = [
    {
      title: 'Target Address',
      dataIndex: 'target',
      key: 'target',
      render: text => text,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: text => text,
    },
  ];
  return (
    <div>
      <Space
        direction='vertical'
        style={{ marginBottom: '16px', textAlign: 'center', width: '100%' }}>
        <Card style={{ width: '100%' }}>
          {tokenType !== TOKEN_TYPES.SOL ? (
            <div style={{ display: 'flex', columnGap: '3rem' }}>
              <div>
                <img
                  style={{ borderRadius: '0.3rem' }}
                  width={100}
                  height={100}
                  src={tokenDetails.image}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'baseline',
                }}>
                <p>
                  <span>Asset Address: &nbsp;&nbsp;</span>
                  <span style={{ fontWeight: '700' }}>{tokenAddress}</span>
                </p>

                <p>
                  <span>Asset Name: &nbsp;&nbsp;</span>
                  <span style={{ fontWeight: '700' }}>
                    {tokenDetails?.name}
                  </span>
                </p>

                <p>
                  <span>Asset Decimals:&nbsp;&nbsp;</span>
                  <span style={{ fontWeight: '700' }}>
                    {tokenDetails?.decimals}
                  </span>
                </p>
                <p>
                  <span>Amount Transfer: &nbsp;&nbsp;</span>
                  <span style={{ fontWeight: '700' }}>
                    {totalTokenToTransfer}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'baseline',
              }}>
              <p>
                <span>Asset Type: &nbsp; &nbsp;</span>
                <span style={{ fontWeight: '700' }}>SOL</span>
              </p>
              <p>
                <span>Amount Transfer: &nbsp;&nbsp;</span>
                <span style={{ fontWeight: '700' }}>
                  {totalTokenToTransfer}
                </span>
              </p>
            </div>
          )}
        </Card>
      </Space>
      <Table
        dataSource={aggregatedData.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        )}
        columns={nonEditableColumns}
        pagination={false}
        size='small'
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={aggregatedData.length}
        onChange={page => setCurrentPage(page)}
        style={{ marginTop: '16px', textAlign: 'center' }}
      />
    </div>
  );
};
