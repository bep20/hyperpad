import React, { useEffect, useState, useContext } from 'react';
import Card from 'antd/es/card';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Token2022Client } from '../utils/token22';
import { SolUtils } from '../../../solana/SolUtils';
import { HyperButton } from '../../../components/buttons/HyperButton';
import launchpadStyle from '../style/launchpad.module.less';
import { NotifyContext } from '../../../context/Notify';
import { AppContext, getCluster } from '../../../context/AppStore';

export const UpdateTax = ({ tokenData, uriData }) => {
  const [notifyApi] = useContext(NotifyContext);
  const [appStore, dispatchAppStore] = useContext(AppContext);

  const [isMinting, setIsMinting] = React.useState(false);
  const [taxInfo, setTaxInfo] = React.useState({
    tax: 0,
    taxLimit: 0,
  });
  const [mintStatus, setMintStatus] = React.useState(false);

  const [ipTaxData, setIpTaxData] = React.useState({
    tax: null,
    taxLimit: null,
  });
  const { connection } = useConnection();
  const wallet = useWallet();

  const updateTaxData = (key, val) => {
    setIpTaxData(prev => ({
      ...prev,
      [key]: val,
    }));
  };

  useEffect(() => {
    let canChange = true;
    let changeMessage = null;

    const taxExtension = tokenData?.extensions?.find(
      item => item.extension === 'transferFeeConfig',
    );

    const canMint = true;
    const mintMessage = null;

    if (!taxExtension) {
      canChange = false;
      changeMessage = 'There is no fee configuration hook present';
    } else if (!taxExtension?.state?.transferFeeConfigAuthority) {
      canChange = false;
      changeMessage = 'Fee config authority is Revoked';
    } else if (!wallet.connected) {
      canChange = false;
      changeMessage = 'Connect your wallet to check fee authority';
    } else if (
      taxExtension?.state?.transferFeeConfigAuthority !=
      wallet.publicKey.toBase58()
    ) {
      canChange = false;
      changeMessage = 'You dont have authority to change fee configuration';
    }

    if (taxExtension) {
      setTaxInfo(prev => ({
        ...prev,
        tax:
          taxExtension?.state?.newerTransferFee?.transferFeeBasisPoints / 100,
        taxLimit:
          taxExtension?.state?.newerTransferFee?.maximumFee /
          10 ** tokenData?.decimals,
      }));
    }

    setMintStatus({
      canMint,
      mintMessage,
    });
  }, [wallet?.connected, connection, tokenData?.extensions]);

  const handleTaxUpdate = async () => {
    // handle tax percent limit
    const token22Client = new Token2022Client(connection);

    const cluster = getCluster(appStore?.currentNetwork);

    try {
      setIsInChange(true);
      const txn = token22Client.getTaxUpdateTransaction();

      const signature = await SolUtils.sendAndConfirmRawTransactionV1(
        connection,
        txn,
        wallet,
        [],
        notifyApi,
        cluster,
      );

      if (!signature) {
        throw new Error('transaction failed');
      }
    } catch (err) {
      console.log('err', err);
      message.error('Transaction failed!!');
    } finally {
      setIsInChange(false);
    }
  };
  const handleTaxLimitUpdate = async () => {
    // handle tax limit update
  };
  return (
    <div className={launchpadStyle.tokenMintContent}>
      {mintStatus?.canMint ? (
        <>
          <Card className={launchpadStyle.burnCard}>
            <div className={launchpadStyle.inputBurnTokenContainer}>
              <div className={launchpadStyle.youBurn}>Enter Tax Amount</div>
              <div className={launchpadStyle.tokenInputAmoutContainer}>
                <Input
                  className={launchpadStyle.inputBurn}
                  placeholder='0'
                  onChange={event => updateTaxData('tax', event.target.value)}
                  value={ipTaxData?.tax}
                />
              </div>
              <div className={launchpadStyle.walletBalance}>
                Current Tax: &nbsp;
                {taxInfo?.tax || ''}
              </div>
            </div>
            <div>
              <HyperButton
                onClick={
                  wallet?.connected ? handleTaxUpdate : () => wallet.connect()
                }
                disabled={isMinting}
                text={
                  wallet?.connected
                    ? isMinting
                      ? 'Processing...'
                      : 'Update Tax'
                    : 'Connect Wallet'
                }
                style={{ width: '100%' }}
              />
            </div>
          </Card>
          <Card className={launchpadStyle.burnCard}>
            <div className={launchpadStyle.inputBurnTokenContainer}>
              <div className={launchpadStyle.youBurn}>Enter Tax Limit</div>
              <div className={launchpadStyle.tokenInputAmoutContainer}>
                <Input
                  className={launchpadStyle.inputBurn}
                  placeholder='0'
                  onChange={event =>
                    updateTaxData('taxLimit', event.target.value)
                  }
                  value={ipTaxData?.taxLimit}
                />
              </div>
              <div className={launchpadStyle.walletBalance}>
                Tax Limit: &nbsp;
                {taxInfo?.taxLimit || ''}
              </div>
            </div>
            <div>
              <HyperButton
                onClick={
                  wallet?.connected
                    ? handleTaxLimitUpdate
                    : () => wallet.connect()
                }
                disabled={isMinting}
                text={
                  wallet?.connected
                    ? isMinting
                      ? 'Processing...'
                      : 'Update Limit'
                    : 'Connect Wallet'
                }
                style={{ width: '100%' }}
              />
            </div>
          </Card>
        </>
      ) : (
        <h2>{mintStatus?.mintMessage}</h2>
      )}
    </div>
  );
};
