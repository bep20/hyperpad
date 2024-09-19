import React, { useState, useEffect, useContext } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import message from 'antd/es/message';
import { useParams } from 'react-router-dom';
import Card from 'antd/es/card';
import Table from 'antd/es/table';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { AppContext } from '../../../context/AppStore';
import {
  ASSET_TYPE_MAP,
  getTransferAsset,
  getTransferAssetAmount,
} from '../utils/multisendDetails';
import { getTransactionLink } from '../../../utils/helpers';
import multisenderStyle from '../style/multisender.module.less';
import { FaqSection } from '../../../components/faq/Faq';
import { faqItems } from '../utils/faqdata';
import { httpClient } from '../../../utils/api';

export const MultiSendDetail = () => {
  const [transferDetails, setTransferDetails] = useState({});
  const [holders, setHolders] = useState([]);
  const { id: multisender_id } = useParams();
  const [appStore] = useContext(AppContext);

  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    if (wallet.connected) {
      if (connection.rpcEndpoint.indexOf('devnet') > -1) {
        message.error(
          'Multisender only supported on mainnet, Switch to Mainnet !!',
        );
      } else {
        httpClient
          .request({
            url: '/multisend_info',
            params: {
              multisender_id,
            },
          })
          .then(response => {
            setTransferDetails({
              ...response?.data?.details,
            });
          })
          .catch(err => {
            console.log('error', err);
            message.error('Unable to find transfer details');
          });

        httpClient
          .request({
            url: '/multisend_holders',
            params: {
              multisender_id,
            },
          })
          .then(response => {
            setHolders(response?.data?.details || []);
          })
          .catch(err => {
            console.log('error is', err);
            message.error('failed to fetch holders list');
          });
      }
    } else {
      setTransferDetails({});
      setHolders([]);
    }
  }, [wallet.connected]);

  //   {
  //     "multisender_id": "196ccee7-b33b-44b6-a27c-6128f669e475",
  //     "lamports": 0,
  //     "token_amount": 200230000,
  //     "transfer_status": 2,
  //     "holder_pubkey": "FgPBJtzn9bYK2ZoTLsMtBdSJkKY8c41v8nNsbUyi59Xx",
  //     "transaction_hash": ""
  // }
  const TB_DETAILS_COLUMN = [
    {
      title: 'Target Address',
      dataIndex: 'holder_pubkey',
      key: 'holder_pubkey',
      render: text => <span>{text}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, record) => (
        <span>
          {transferDetails.asset_type === 1
            ? parseFloat(record?.lamports / LAMPORTS_PER_SOL).toFixed(4) || ''
            : new BigNumber(record.token_amount)
                .dividedBy(
                  new BigNumber(10).exponentiatedBy(transferDetails?.decimals),
                )
                .toFixed(4)}
        </span>
      ),
    },
    {
      title: 'Transaction',
      dataIndex: 'transaction_hash',
      key: 'transaction_hash',
      render: (text, record) => {
        return (
          <span>
            {text ? (
              <a
                target='_blank'
                href={getTransactionLink(record, appStore?.currentNetwork)}
                rel='noreferrer'>
                transaction
              </a>
            ) : (
              ''
            )}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'transfer_status',
      key: 'transfer_status',
      render: text => (
        <span>{text == 1 ? 'Success' : text == 2 ? 'Failed' : 'Pending'}</span>
      ),
    },
  ];

  return (
    <div className={multisenderStyle.multiSendContainer}>
      <h1 className={multisenderStyle.detailsTitle}>Distribution Details</h1>
      <div className={multisenderStyle.detailsContent}>
        <Card>
          <div className={multisenderStyle.detailsCardItemContent}>
            <div className={multisenderStyle.detailsCardItemGroup}>
              <p>
                <span>Asset Type :</span>
                <span>{ASSET_TYPE_MAP[transferDetails.asset_type]}</span>
              </p>
              <p>
                <span>Asset :</span>
                <span>{getTransferAsset(transferDetails)}</span>
              </p>
            </div>
            <div className={multisenderStyle.detailsCardItemGroup}>
              <p>
                <span>Asset Amount:</span>
                <span>{getTransferAssetAmount(transferDetails)}</span>
              </p>
              <p>
                <span>Tx Details:</span>
                <span>
                  <a
                    target='_blank'
                    href={`${getTransactionLink(
                      transferDetails,
                      appStore?.currentNetwork,
                    )}`}
                    rel='noreferrer'>
                    Transaction
                  </a>
                </span>
              </p>
            </div>
          </div>
        </Card>
        <div>
          <h2 className={multisenderStyle.holdersTitle}>Holders Details</h2>
          <Card>
            <div className={multisenderStyle.detailsTableContent}>
              <Table
                dataSource={holders}
                columns={TB_DETAILS_COLUMN}
                pagination={false}
                size='small'
              />
            </div>
          </Card>
        </div>
      </div>
      <div>
        <div className={multisenderStyle.headerLine} />
        <FaqSection faqItems={faqItems} />
      </div>
    </div>
  );
};
