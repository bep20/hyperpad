import React, { useEffect, useState } from 'react';
import Space from 'antd/es/space';
import snapshotStyle from '../style/snapshot.module.less';
import { SnapShotHistory } from '../components/SnapShotHistory';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { httpClient } from '../../../utils/api';
const TRANSACTION_MODE = {
  MAINNET: 1,
  DEVNET: 2,
};
export const SnapShotTokenHistory = () => {
  const [snapHistory, setSnapHistory] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const wallet = useWallet();
  const { connection } = useConnection();
  const loadSnapHistory = async () =>
    // load snapshot history from server

    new Promise((resolve, reject) => {
      httpClient
        .request({
          url: '/get_user_token_snaps',
          params: {
            user_pubkey: wallet.publicKey.toBase58(),
            tx_mode:
              connection.rpcEndpoint.indexOf('mainnet') > -1
                ? TRANSACTION_MODE.MAINNET
                : TRANSACTION_MODE.DEVNET,
          },
        })
        .then(response => {
          resolve(response?.data);
        });
    });
  useEffect(() => {
    if (wallet.connected) {
      setIsHistoryLoading(true);
      loadSnapHistory()
        .then(snapsdata => {
          setSnapHistory(snapsdata || []);
        })
        .catch(err => {
          console.log('err00000', err);
        })
        .finally(() => {
          setIsHistoryLoading(false);
        });
    }
  }, [wallet.connected, connection]);
  return (
    <div className={snapshotStyle.container}>
      <Space
        direction='vertical'
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '1rem',
        }}>
        <div>
          <h1 className={snapshotStyle.title}>
            <span className={snapshotStyle.purpleText}>History: </span>Your
            Previous Snapshots
          </h1>
          <div className={snapshotStyle.headerLine} />
        </div>
        <SnapShotHistory
          snapHistory={snapHistory}
          isHistoryLoading={isHistoryLoading}
        />
      </Space>
    </div>
  );
};
