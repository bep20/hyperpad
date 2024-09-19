import React, { useEffect, useState, useContext } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import message from 'antd/es/message';
import Card from 'antd/es/card';
import { Link } from 'react-router-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import multisenderStyle from '../style/multisender.module.less';
import { AppContext, NETWORKS } from '../../../context/AppStore';
import { FaqSection } from '../../../components/faq/Faq';
import { faqItems } from '../utils/faqdata';
import { httpClient } from '../../../utils/api';
import { getTransactionLink } from '../../../utils/helpers';

const ASSET_TYPE_MAP = {
  1: 'SOL',
  2: 'SPL',
  3: 'SPL 2022',
};

const getTransferAsset = (item, clip = true) => {
  if (!(item.asset_type && item.mint_address)) {
    return '';
  }
  if (item.asset_type === 1) {
    return 'SOL';
  }
  const clippedMintAddress = `${item.mint_address.slice(0, 4)}....${item.mint_address.slice(-4)}`;
  return clip ? clippedMintAddress : item.mint_address;
};
const getTransferAssetName = item =>
  item.asset_type == 1 ? 'SOL' : item.token_name || '-';
const getTransferDate = item =>
  item.created_at
    ? `${new Date(item.created_at).toLocaleDateString()} ${new Date(
        item.created_at,
      ).toLocaleTimeString()}`
    : '-';
const getTransferAssetAmount = item => {
  if (item.asset_type === 1) {
    return parseFloat(item.sol_amount / LAMPORTS_PER_SOL).toFixed(4) || '';
  }
  return parseFloat(item.token_amount / 10 ** item.decimals).toFixed(4) || '';
};

export const ManageMultiSender = () => {
  const [myTransfer, setMyTransfer] = useState([]);
  const connection = useConnection();
  const wallet = useWallet();
  const [appStore] = useContext(AppContext);

  useEffect(() => {
    if (wallet.connected) {
      if (connection.connection.rpcEndpoint.indexOf('devnet') > -1) {
        message.error(
          'Multisender only supported on mainnet, Switch to Mainnet !!',
        );
      } else {
        // fetch user transfers
        httpClient
          .request({
            url: '/user_multisend',
            params: {
              wallet_pubkey: wallet.publicKey.toBase58(),
            },
          })
          .then(response => {
            setMyTransfer(response?.data?.details || []);
          })
          .catch(() => {
            message.error('Something went wrong, Please refresh page!!');
          });
      }
    } else {
      setMyTransfer([]);
    }
  }, [wallet.connected]);

  //   {
  //     "multisender_id": "196ccee7-b33b-44b6-a27c-6128f669e475",
  //     "transaction_hash": "2dCGXX349pSRaLimuc2hAEdWb6a8RPJ4fXrbDnitm8GK7ZxFQRW7BxNC5ieg8TyhzojA2uD2YCeWFM1nQfWhHNTC",
  //     "total_sol_amount": 100000,
  //     "mint_address": "AY2rPqQnw9ftvYpa3nqq1MYWT35vGiFcZELygKGt9PvR",
  //     "owner_pubkey": "UbMcMwpR73X4wXEFyY9LkZf2v4YJj1hVHDioTkcg2oj",
  //     "platform_fee": 100000,
  //     "token_amount": 200230000,
  //     "decimals": 6,
  //     "transfer_status": 3,
  //     "asset_type": 2,
  //     "token_name": null,
  //     "sol_amount": 0
  // }

  return (
    <div className={multisenderStyle.multiSendContainer}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div>
          <h1 className={multisenderStyle.manageTitle}>
            Manage Asset Distribution
          </h1>
        </div>
        <div className={multisenderStyle.manageList}>
          {myTransfer.map((item, idx) => {
            return (
              <Card
                key={idx}
                style={{ width: 300 }}
                className={multisenderStyle.manageCard}>
                <div className={multisenderStyle.manageCardContent}>
                  <p className={multisenderStyle.manageCardRow}>
                    <span>Asset Type :</span>
                    <span>{ASSET_TYPE_MAP[item.asset_type]}</span>
                  </p>
                  <p className={multisenderStyle.manageCardRow}>
                    <span>Asset Name :</span>
                    <span>{getTransferAssetName(item)}</span>
                  </p>
                  <p className={multisenderStyle.manageCardRow}>
                    <span>Asset Address:</span>
                    <span>{getTransferAsset(item)}</span>
                  </p>
                  <p className={multisenderStyle.manageCardRow}>
                    <span>Asset Amount:</span>
                    <span>{getTransferAssetAmount(item)}</span>
                  </p>
                  <p className={multisenderStyle.manageCardRow}>
                    <span>Tx Time:</span>
                    <span>{getTransferDate(item)}</span>
                  </p>

                  <p className={multisenderStyle.manageCardRow}>
                    <span>Tx Details:</span>
                    <span>
                      <a
                        target='_blank'
                        href={`${getTransactionLink(
                          item,
                          appStore?.currentNetwork,
                        )}`}>
                        Transaction
                      </a>
                    </span>
                  </p>
                  <p className={multisenderStyle.manageCardDetails}>
                    <Link
                      to={`/solana-multi-sender/manage/${item.multisender_id}`}>
                      View Details
                    </Link>
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <div className='w-full'>
        <div className={multisenderStyle.headerLine} />
        <FaqSection faqItems={faqItems} />
      </div>
    </div>
  );
};
