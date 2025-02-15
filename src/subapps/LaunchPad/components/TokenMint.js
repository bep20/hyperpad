import React, { useEffect, useContext, useState } from 'react';
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

export const TokenMint = ({ tokenData, uriData, className }) => {
  const [notifyApi] = useContext(NotifyContext);
  const [appStore, dispatchAppStore] = useContext(AppContext);

  const [isMinting, setIsMinting] = useState(false);
  const [userCurrentBalance, setUserCurrentBalance] = useState(null);
  const [mintStatus, setMintStatus] = useState({
    canMint: false,
    message: '',
  });
  const [amoutToMint, setAmoutToMint] = useState('');
  const { connection } = useConnection();
  const wallet = useWallet();
  const [initialRender, setInitialRender] = React.useState(true);

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

  const handleMintToken = async () => {
    if (!amoutToMint) {
      message.error('Please enter a non-zero amount to mint', 5);
      return;
    }

    const cluster = getCluster(appStore?.currentNetwork);

    const amountTokenToMint =
      parseFloat(amoutToMint) * 10 ** parseInt(tokenData?.decimals);

    const token22Client = new Token2022Client(connection);

    try {
      setIsMinting(true);
      const txn = await token22Client.getMintToTransaction(
        wallet.publicKey,
        new PublicKey(tokenData?.mint),
        amountTokenToMint,
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
        throw new Error('Failed to mint');
      }

      message.success(
        `Successfully minted ${amoutToMint} ${tokenData?.metadata?.data?.symbol}`,
        5,
      );
      setAmoutToMint('');
      setTimeout(() => {
        updateCurrentWalletAmount();
      }, 1000);
    } catch (err) {
      console.error('Error:', err);
      message.error('Failed to mint token');
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    const { symbol } = tokenData?.metadata?.data || {};

    if (!initialRender) {
      if (wallet?.connected && connection?._rpcEndpoint && tokenData?.mint) {
        updateCurrentWalletAmount();
      }

      let canMint = true;
      let mintMessage = '';
      let changeDescription = null;

      if (!tokenData?.mintAuthority) {
        canMint = false;
        mintMessage = 'Token is not mintable';
      } else if (!wallet?.connected) {
        canMint = false;
        mintMessage = 'Please connect wallet to mint';
      } else if (tokenData?.mintAuthority !== wallet?.publicKey?.toBase58()) {
        canMint = false;
        mintMessage = `You don't have authority to mint ${symbol} tokens`;
        changeDescription = `The current mint authority is <b> ${tokenData?.mintAuthority}</b>.<br> Only current authority can mint tokens.`;
      }

      setMintStatus({
        canMint,
        message: mintMessage,
        description: changeDescription,
      });
    }
    setInitialRender(false);
  }, [
    wallet?.connected,
    tokenData?.mintAuthority,
    connection,
    tokenData?.mint,
    initialRender,
  ]);

  if (!tokenData?.programId) {
    return null;
  }

  return (
    <div className={`${launchpadStyle.tokenMintContent} ${className}`}>
      <Card className={launchpadStyle.burnCard}>
        {mintStatus.canMint ? (
          <>
            <div className={launchpadStyle.inputBurnTokenContainer}>
              <div className={launchpadStyle.youBurn}>You Mint</div>
              <div className={launchpadStyle.tokenInputAmoutContainer}>
                <Input
                  className={launchpadStyle.inputBurn}
                  placeholder='0'
                  onChange={event => setAmoutToMint(event.target.value)}
                  value={amoutToMint}
                />
                <p className={launchpadStyle.tokenTickerInfo}>
                  <img src={uriData?.image || ''} alt='Token Icon' />
                  <span>{tokenData?.metadata?.data?.symbol || ''}</span>
                </p>
              </div>
              <div className={launchpadStyle.walletBalance}>
                Wallet Balance: &nbsp;
                {userCurrentBalance
                  ? `${userCurrentBalance} ${tokenData?.metadata?.data?.symbol}`
                  : ''}
              </div>
            </div>
            <div>
              <HyperButton
                onClick={handleMintToken}
                disabled={isMinting}
                text={
                  isMinting
                    ? 'Minting...'
                    : `Mint ${tokenData?.metadata?.data?.symbol}`
                }
                style={{ width: '100%' }}
              />
            </div>
          </>
        ) : (
          <div className={launchpadStyle.updateCardMessage}>
            <h2 className={launchpadStyle.updateCardh2}>
              {mintStatus?.message}
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: mintStatus?.description,
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
