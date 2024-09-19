import React, { useEffect, useState } from 'react';
import Card from 'antd/es/card';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Token2022Client } from '../utils/token22';
import { SolUtils } from '../../../solana/SolUtils';
import { HyperButton } from '../../../components/buttons/HyperButton';
import launchpadStyle from '../style/launchpad.module.less';
import { AppContext, getCluster } from '../../../context/AppStore';
import { NotifyContext } from '../../../context/Notify';

export const TokenBurn = ({ tokenData, uriData }) => {
  const [appStore, dispatchAppStore] = React.useContext(AppContext);
  const [notifyApi] = React.useContext(NotifyContext);

  const [isBurning, setIsBurning] = useState(false);
  const [userCurrentBalance, setUserCurrentBalance] = React.useState(null);
  const [amoutToBurn, setAmountToBurn] = React.useState(null);
  const { connection } = useConnection();
  const wallet = useWallet();

  const updateCurrentWalletAmount = async () => {
    if (!(wallet?.connected && connection?._rpcEndpoint)) {
      return;
    }
    const token22Client = new Token2022Client(connection);
    const userAtaDetails = await token22Client.getTokenBalance(
      new PublicKey(tokenData?.mint),
      wallet.publicKey,
      new PublicKey(tokenData?.programId),
    );
    setUserCurrentBalance(
      userAtaDetails?.value?.data?.parsed?.info?.tokenAmount?.uiAmountString,
    );
  };

  const handleBurnToken = async () => {
    if (!(wallet.connected && connection._rpcEndpoint)) {
      message.error('Please connect to wallet to burn tokens');
      return;
    }
    if (!parseFloat(amoutToBurn)) {
      message.error('Please enter some amount of token');
      return;
    }
    const amoutOfTokenToBurn =
      parseFloat(amoutToBurn) * 10 ** parseInt(tokenData?.decimals);
    // fetch user current token balance

    const token22Client = new Token2022Client(connection);
    const cluster = getCluster(appStore?.currentNetwork);

    try {
      setIsBurning(true);

      const txn = await token22Client.getBurnTransaction(
        new PublicKey(tokenData?.mint),
        wallet.publicKey,
        amoutOfTokenToBurn,
        parseInt(tokenData?.decimals),
        new PublicKey(tokenData?.programId),
      );

      const signature = await SolUtils.sendAndConfirmRawTransactionV1(
        connection,
        txn,
        wallet,
        [],
        notifyApi,
        cluster,
      );
      if (!signature) {
        throw new Error('Failed to burn tokens!!');
      }
      setAmountToBurn(null);
      setTimeout(() => {
        updateCurrentWalletAmount();
      }, 1000);
    } catch (err) {
      console.log('error', err);
      message.error('Unable to Burn Tokens!!');
    } finally {
      setIsBurning(false);
    }
  };

  useEffect(() => {
    updateCurrentWalletAmount();
  }, [wallet?.connected, connection, tokenData?.mint]);

  return (
    <div className={launchpadStyle.tokenBurnContent}>
      <Card className={launchpadStyle.burnCard}>
        <div className={launchpadStyle.inputBurnTokenContainer}>
          <div className={launchpadStyle.youBurn}>You Burn</div>
          <div className={launchpadStyle.tokenInputAmoutContainer}>
            <Input
              className={launchpadStyle.inputBurn}
              placeholder='0'
              value={amoutToBurn}
              onChange={event => setAmountToBurn(event.target.value)}
            />
            <p className={launchpadStyle.tokenTickerInfo}>
              <img src={uriData?.image || ''} />
              <span>{tokenData?.metadata?.data?.symbol || ''}</span>
            </p>
          </div>
          <div className={launchpadStyle.walletBalance}>
            Wallet Balance: &nbsp;{' '}
            {userCurrentBalance
              ? `${userCurrentBalance} ${tokenData?.metadata?.data?.symbol}`
              : ''}
          </div>
        </div>
        <div>
          <HyperButton
            onClick={
              wallet?.connected ? handleBurnToken : () => wallet.connect()
            }
            style={{ width: '100%' }}
            disabled={isBurning}
            text={
              wallet?.connected
                ? isBurning
                  ? 'Burning..'
                  : `Burn ${tokenData?.metadata?.data?.symbol}`
                : 'Connect Wallet'
            }
          />
        </div>
      </Card>
    </div>
  );
};
