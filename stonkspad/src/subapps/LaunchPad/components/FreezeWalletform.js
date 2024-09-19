import React, { useContext, useEffect, useState } from 'react';

import Button from 'antd/es/button';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Space from 'antd/es/space';
import Badge from 'antd/es/badge';
import Checkbox from 'antd/es/checkbox';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';

import { PublicKey } from '@solana/web3.js';
import {
  createFreezeAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import freezewallet from '../style/freezewallet.module.less';

import { HyperButton } from '../../../components/buttons/HyperButton';
import { TokenDetailsClient } from '../utils/tokendetails';
import { TokenBasicDetails } from './TokenBasicDetails';
import FreezeWalletTable from './FreezeWalletTable';
import { parseUploadedData } from '../utils/parseUploadedData';
import { TokenV1Client } from '../utils/token';
import { SolUtils } from '../../../solana/SolUtils';
import { NotifyContext } from '../../../context/Notify';
import { AppContext, getCluster } from '../../../context/AppStore';
import { WalletStatus } from '../constants/data';

const TOKEN_DETAILS = {
  decimals: null,
  freezeAuthority: null,
  mintAuthority: null,
  supply: null,
  isInitialized: null,
  mintAccountOwner: null,
  updateAuthority: null,
  mint: null,
  creators: null,
  name: null,
  sellerFeeBasisPoints: null,
  symbol: null,
  uri: null,
  isMutable: null,
  uriData: null,
};

const downloadSampleCSV = () => {
  let data = '';
  data += `${'6LYitmSfv2k8ppJPqMffTMPi1SfR9yLhJkpDB5zPGYsD'},\n`;
  data += `${'5MUZto6SxrFudodj4EbNFufkwACewfuFCJQbE3u9TwgK'},\n`;

  const link = document.createElement('a');
  link.href = `data:text/csv;charset=utf-8,${encodeURI(data)}`;
  link.target = '_blank';
  link.download = 'Freezetoken_sample.csv';
  link.click();
};

export const FreezeWalletform = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [appStore] = useContext(AppContext);
  const [notifyApi] = useContext(NotifyContext);

  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenData, setTokenData] = useState(TOKEN_DETAILS);

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [tokenDetailsLoaded, setTokenDetailsLoaded] = useState(false);
  const pageSize = 10;

  const cluster = getCluster(appStore?.currentNetwork);

  const handleSelectAllChange = e => {
    const { checked } = e.target;
    setData(prev => {
      return prev.map(item => {
        if (item.status === WalletStatus.ACTIVE) {
          return {
            ...item,
            selected: checked,
          };
        }
        return { ...item, selected: false };
      });
    });
  };

  const handleCheckboxChange = key => {
    setData(prev => {
      return prev.map(item => {
        if (item.key === key) {
          return {
            ...item,
            selected:
              item.status === WalletStatus.ACTIVE ? !item.selected : false,
          };
        }
        return { ...item };
      });
    });
  };

  useEffect(() => {
    if (tokenData?.metadata?.data?.uri?.length) {
      axios({
        url: tokenData?.metadata?.data?.uri,
      })
        .then(res => {
          setTokenData(prev => ({ ...prev, uriData: res.data }));
        })
        .catch(err => {
          console.log('catched error', err);
        });
    }
  }, [tokenData?.metadata?.data?.uri]);

  const loadTokenDetails = () => {
    if (tokenAddress) {
      setTokenAddress(tokenAddress);
    }
    if (connection?._rpcEndpoint && tokenAddress) {
      const tokenDetailsClient = new TokenDetailsClient(connection);
      setIsTokenLoading(true);
      tokenDetailsClient
        .getTokensFullDetails([tokenAddress])
        .then(([res]) => {
          if (!res?.decimals) throw new Error('Invalid token');
          setTokenData(res);
          setTokenDetailsLoaded(true);
        })
        .catch(err => {
          message.error(err?.message || 'Invalid token');
        })
        .finally(() => {
          setIsTokenLoading(false);
        });
    }
  };

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
    setData([
      { key: uuidv4(), target: '', status: null, selected: false },
      ...data,
    ]);
  };
  const handleRemoveRow = key => {
    setData(data => {
      const updatedData = data.filter(item => item.key !== key);
      return updatedData;
    });
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

  const isAllSelected = data.reduce((acc, prev) => {
    return acc && (prev.status === WalletStatus.ACTIVE ? prev.selected : true);
  }, data?.length > 0);

  const isIndeterminate =
    data.reduce((acc, prev) => {
      return acc || (prev.status === WalletStatus.ACTIVE && prev.selected);
    }, false) && data?.length > 0;

  const editableColumns = [
    {
      title: (
        <Checkbox
          indeterminate={isIndeterminate && !isAllSelected}
          checked={isAllSelected && isIndeterminate}
          onChange={handleSelectAllChange}
          disabled={!data?.some(el => el?.status === WalletStatus.ACTIVE)}
        />
      ),
      dataIndex: 'checkbox',
      key: 'checkbox',
      render: (text, record) => (
        <Space size='middle'>
          <Checkbox
            checked={record.selected}
            onChange={e => handleCheckboxChange(record.key, e.target.checked)}
            disabled={record.status !== WalletStatus.ACTIVE}
          />
        </Space>
      ),
    },
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: text => {
        let badgeColor;
        switch (text) {
          case WalletStatus.INVALID:
            badgeColor = '#ff4d4f';
            break;
          case WalletStatus.FROZEN:
            badgeColor = '#52c41a';
            break;
          case WalletStatus.ACTIVE:
            badgeColor = '#faad14';
            break;
          default:
            badgeColor = '#d9d9d9';
            break;
        }
        return text == null ? null : <Badge count={text} color={badgeColor} />;
      },
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

  //   change it to derive from tokenDetails;
  const programId = TOKEN_PROGRAM_ID;

  const loadStatus = async () => {
    if (!tokenAddress || !connection) {
      message.error('Token address or connection not available');
      return;
    }

    const accounts = data.map(item => {
      return getAssociatedTokenAddressSync(
        new PublicKey(tokenAddress),
        new PublicKey(item.target),
        false,
        programId,
      );
    });

    try {
      const accountInfos = await connection.getMultipleParsedAccounts(accounts);

      setData(data => {
        return data.map((item, index) => {
          const accountInfo = accountInfos.value[index];
          let status;

          if (accountInfo === null) {
            status = WalletStatus.INVALID;
          } else {
            const { state } = accountInfo.data.parsed.info;
            if (state === 'initialized') {
              status = WalletStatus.ACTIVE;
            } else if (state === 'frozen') {
              status = WalletStatus.FROZEN;
            } else if (state === 'uninitialized') {
              status = WalletStatus.INVALID;
            } else {
              status = WalletStatus.INVALID;
            }
          }
          return {
            ...item,
            status,
          };
        });
      });
    } catch (error) {
      message.error('Failed to fetch wallet details');
    }
  };

  const frozeToken = async () => {
    if (!connection || !tokenAddress) {
      message.error('Token address or Connection not available');
      return;
    }

    const freezeAuthority = new PublicKey(tokenData?.freezeAuthority);
    const mintAddress = new PublicKey(tokenAddress);

    // Filter tokens based on selection
    const tokensToFreeze = data.filter(
      item => item.selected && item.status === WalletStatus.ACTIVE,
    );

    try {
      const transactions = tokensToFreeze.map(item => {
        const account = getAssociatedTokenAddressSync(
          mintAddress,
          new PublicKey(item.target),
          false,
          programId,
        );
        return createFreezeAccountInstruction(
          account,
          mintAddress,
          freezeAuthority,
          [],
          programId,
        );
      });

      const chunkArray = (array, chunkSize) => {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
          result.push(array.slice(i, i + chunkSize));
        }
        return result;
      };

      const chunkedData = chunkArray(transactions, 10);

      const tokenClient = new TokenV1Client(connection);
      const transactionList = [];
      for (let i = 0; i < chunkedData.length; i++) {
        const chunk = chunkedData[i];
        const transaction = await tokenClient.getFreezeTransition(
          chunk,
          wallet.publicKey,
        );
        transactionList.push(transaction);
      }

      await SolUtils.sendAndConfirmAllRawTransaction(
        connection,
        transactionList,
        wallet,
        [],
        notifyApi,
        cluster,
      );
      loadStatus();
      //   instruction;n
    } catch (error) {
      message.error('Failed to freeze tokens');
    }
  };

  const isFreezeAuthorityMatched =
    tokenData?.freezeAuthority === wallet.publicKey?.toBase58();

  return (
    <div className={freezewallet.formContainer}>
      <h1 className={freezewallet.formTitle}>
        <span>&nbsp;Batch Wallet Freezer</span>
      </h1>
      <div className={freezewallet.headerLine} />
      <div>
        <Space
          direction='vertical'
          style={{
            marginBottom: '16px',
            marginTop: '32px',
            textAlign: 'left',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            rowGap: '2rem',
          }}>
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
            {tokenData.supply && (
              <div>
                <TokenBasicDetails
                  tokenData={tokenData}
                  uriData={tokenData?.uriData}
                  isTokenLoading={isTokenLoading}
                />
              </div>
            )}
          </>
        </Space>

        {!tokenDetailsLoaded || isFreezeAuthorityMatched ? (
          <FreezeWalletTable
            data={data}
            editableColumns={editableColumns}
            handleUpload={handleUpload}
            downloadSampleCSV={downloadSampleCSV}
            handleAddRow={handleAddRow}
            setData={setData}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            loadStatus={loadStatus}
            frozeToken={frozeToken}
            enabled={isIndeterminate || isAllSelected}
          />
        ) : (
          <div className='flex justify-center'>
            You do not have access to freeze this token.
          </div>
        )}
      </div>
    </div>
  );
};
