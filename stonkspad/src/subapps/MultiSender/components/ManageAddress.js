import React, { useState, useEffect } from 'react';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Input from 'antd/es/input';
import Upload from 'antd/es/upload';
import message from 'antd/es/message';
import Space from 'antd/es/space';
import Pagination from 'antd/es/pagination';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import { UploadOutlined } from '@ant-design/icons';

import { parseUploadedData } from '../utils/parsedata';
import { TOKEN_TYPES } from '../constants/token';
import { TokenDetails } from './TokenDetails';
import { HyperButton } from '../../../components/buttons/HyperButton';
import { HyperSButton } from '../../../components/buttons/HyperSButton';

const downloadSampleCSV = () => {
  let data = [];
  data += `${'6LYitmSfv2k8ppJPqMffTMPi1SfR9yLhJkpDB5zPGYsD'},${232.22}\n`;
  data += `${'5MUZto6SxrFudodj4EbNFufkwACewfuFCJQbE3u9TwgK'},${532}\n`;

  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURI(data)}`;
  link.target = '_blank';
  link.download = 'multisender_sample.csv';
  link.click();
};

export const ManageAddress = ({
  data = [],
  setData,
  tokenType,
  tokenDetails,
  loadTokenDetails,
  tokenAddress,
  setTokenAddress,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  //   if token is spl or spl2022 and user has entered the address, fetch the token details

  useEffect(() => {
    if ([TOKEN_TYPES.SPL, TOKEN_TYPES.SPL2022].includes(tokenType)) {
      // check tokenAddress is valid public key or not, if yes then only proceeds
      // handle fetching of token details
    }
  }, [tokenAddress, tokenType]);

  const handleUpload = file => {
    const isCsv =
      file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');

    if (!isCsv) {
      message.error('You can only upload CSV files!');
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        // Parse the content of the file using PapaParse
        Papa.parse(e.target.result, {
          complete: result => {
            // Check the parsed data and decide whether to allow the upload
            if (result.errors.length === 0 && result.data.length > 0) {
              // Valid CSV content
              const validatedData = parseUploadedData(result.data);
              if (validatedData) {
                setData(validatedData);
                resolve();
              } else {
                message.error('Invalid CSV fileeeee!');
                reject();
              }
            } else {
              message.error('Invalid CSV file!');
              reject();
            }
          },
          skipEmptyLines: true,
          header: false, // Set to true if your CSV has a header row
        });
      };

      reader.readAsText(file);
    });
  };
  const handleAddRow = () => {
    setData([{ key: uuidv4(), target: '', amount: '' }, ...data]);
  };

  const handleInputChange = (key, field, value) => {
    setData(data => {
      const updatedData = data.map(item => {
        if (item.key === key) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return updatedData;
    });
  };

  const handleRemoveRow = index => {
    setData(data => {
      const updatedData = data.filter(item => item.key !== index);
      return updatedData;
    });
  };

  const editableColumns = [
    {
      title: 'Target Address',
      dataIndex: 'target',
      key: 'target',
      render: (text, record) => (
        <Input
          value={text}
          onChange={e =>
            handleInputChange(record.key, 'target', e.target.value)
          }
        />
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <Input
          value={text}
          onChange={e =>
            handleInputChange(record.key, 'amount', e.target.value)
          }
        />
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Space size='middle'>
          <Button onClick={() => handleRemoveRow(record.key)}>Remove</Button>
        </Space>
      ),
    },
  ];

  //   const processDataFromCSV = csvData =>
  // Implement logic to process CSV data and return an array of objects
  // This example assumes CSV data is an array of objects with 'target' and 'amount' keys
  //     csvData.map((item, index) => ({
  //       key: data.length + index,
  //       target: item.target || '',
  //       amount: item.amount || '',
  //     }));

  return (
    <div>
      <Space
        direction='vertical'
        style={{
          marginBottom: '16px',
          marginTop: '32px',
          textAlign: 'right',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '2rem',
        }}>
        {[TOKEN_TYPES.SPL, TOKEN_TYPES.SPL2022].includes(tokenType) && (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                columnGap: '1.5rem',
              }}>
              <Input
                value={tokenAddress}
                placeholder='Enter Token Mint Address'
                onChange={event => setTokenAddress(event.target.value)}
              />
              <div>
                <HyperButton
                  btnSize='medium-btn'
                  text='Load'
                  onClick={loadTokenDetails}
                />
              </div>
            </div>
            {tokenDetails.supply && (
              <div>
                <TokenDetails tokenDetails={tokenDetails} />
              </div>
            )}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', columnGap: '2rem' }}>
            <Upload showUploadList={false} beforeUpload={handleUpload}>
              <HyperButton
                btnSize='small-btn'
                icon={<UploadOutlined />}
                text='Upload CSV'
              />
            </Upload>
            <HyperButton
              onClick={() => {
                downloadSampleCSV();
              }}
              btnSize='small-btn'
              text='Sample CSV'
            />
          </div>
          <div style={{ display: 'flex', columnGap: '2rem' }}>
            <HyperSButton
              btnSize='small-btn'
              onClick={() => setData([])}
              text='Clear Table'
            />
            <HyperButton
              text=' Add Row'
              onClick={handleAddRow}
              btnSize='small-btn'
            />
          </div>
        </div>
      </Space>

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
    </div>
  );
};
