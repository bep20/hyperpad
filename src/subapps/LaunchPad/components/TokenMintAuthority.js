import React, { useEffect, useState, useContext } from 'react';
import Card from 'antd/es/card';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import { PublicKey } from '@solana/web3.js';
import { AuthorityType } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import Select from 'antd/es/select';
import { CopyString } from './CopyString';
import launchpadStyle from '../style/launchpad.module.less';
import { changeTypeOption, changeTypeEnum } from '../constants/data';

import { HyperButton } from '../../../components/buttons/HyperButton';
import { Token2022Client } from '../utils/token22';
import { SolUtils } from '../../../solana/SolUtils';
import { NotifyContext } from '../../../context/Notify';
import { AppContext, getCluster } from '../../../context/AppStore';

export const TokenMintAuthority = ({ tokenData, className }) => {
  const [notifyApi] = useContext(NotifyContext);
  const [appStore, dispatchAppStore] = useContext(AppContext);

  const [isInChange, setIsInChange] = useState(false);
  const [changeType, setChangeType] = useState(changeTypeEnum.REVOKE);
  const [targetMintAuthority, setTargetMintAuthority] = useState(null);
  const [mintAuthStatus, setMintAuthStatus] = useState({
    canChange: false,
    message: null,
  });
  const { connection } = useConnection();
  const wallet = useWallet();
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    if (!initialRender) {
      let canChange = true;
      let changeMessage = null;
      let changeDescription = null;

      if (!tokenData?.mintAuthority) {
        canChange = false;
        changeMessage = 'Token is non mintable!!';
      } else if (!wallet.connected) {
        canChange = false;
        changeMessage = 'Connect your wallet to verify mint authority';
      } else if (wallet.publicKey.toBase58() !== tokenData?.mintAuthority) {
        canChange = false;
        changeMessage = 'You dont have Mint Authority';
        changeDescription = `The current mint authority is <b> ${tokenData?.mintAuthority}</b>.<br> Only current authority can change or revoke.`;
      }

      setMintAuthStatus({
        canChange,
        message: changeMessage,
        description: changeDescription,
      });
    }
    setInitialRender(false);
  }, [initialRender, wallet?.connected, connection, tokenData?.mintAuthority]);

  const handleTransferMintAuthority = async () => {
    if (!targetMintAuthority && changeType === changeTypeEnum.TRANSFER) {
      message.error(
        'Please enter a valid mint authority that you want to transfer',
        3,
      );
      return;
    }

    const cluster = getCluster(appStore?.currentNetwork);
    const token22Client = new Token2022Client(connection);

    try {
      setIsInChange(true);

      const tMAuthority =
        changeType === changeTypeEnum.TRANSFER
          ? new PublicKey(targetMintAuthority)
          : null;

      const txn = await token22Client.getChangeAuthorityTransaction(
        wallet.publicKey,
        new PublicKey(tokenData?.mint),
        AuthorityType.MintTokens,
        tMAuthority,
        new PublicKey(tokenData.programId),
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
        throw new Error('Unable to change authority');
      }

      setTargetMintAuthority(null);
      message.success('Authority changed successfully', 5);
    } catch (err) {
      console.error('Error:', err);
      message.error('Unable to process transaction');
    } finally {
      setIsInChange(false);
    }
  };

  if (!tokenData.programId) {
    return null;
  }
  return (
    <div className={`${launchpadStyle.tokenMintAuthorityContent} ${className}`}>
      <Card className={launchpadStyle.burnCard}>
        {wallet?.connected ? (
          mintAuthStatus?.canChange ? (
            <>
              <div className={launchpadStyle.burnCardInput}>
                <div className={launchpadStyle.inputBurnTokenContainer}>
                  <div className={launchpadStyle.youBurn}>
                    Current Mint Authority
                  </div>
                  <div className={launchpadStyle.tokenInputAmoutContainer}>
                    <p
                      className={`${launchpadStyle.inputBurn} ${launchpadStyle.disabledMock}`}>
                      <CopyString
                        data={tokenData?.mintAuthority}
                        dataToCopy={tokenData?.mintAuthority}
                      />
                    </p>
                  </div>
                  <div className={launchpadStyle.walletBalance} />
                </div>
                <div className={launchpadStyle.transferTo}>
                  <Select
                    onChange={val => setChangeType(val)}
                    value={changeType}
                    size='large'
                    style={{ width: '100%' }}>
                    {changeTypeOption.map(currentOption => (
                      <Select.Option
                        key={currentOption.value}
                        value={currentOption.value}>
                        <div>
                          <p
                            style={{
                              margin: '0px',
                              fontSize: '1.2rem',
                            }}>
                            {currentOption.label}
                          </p>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                {changeType === changeTypeEnum.TRANSFER ? (
                  <div className={launchpadStyle.inputBurnTokenContainer}>
                    <div className={launchpadStyle.youBurn}>
                      New Mint Authority
                    </div>
                    <div className={launchpadStyle.tokenInputAmoutContainer}>
                      <Input
                        className={launchpadStyle.inputBurn}
                        placeholder='0'
                        value={targetMintAuthority}
                        onChange={event =>
                          setTargetMintAuthority(event.target.value)
                        }
                      />
                    </div>
                    <div className={launchpadStyle.walletBalance} />
                  </div>
                ) : null}
              </div>
              <div>
                <HyperButton
                  onClick={handleTransferMintAuthority}
                  disabled={isInChange}
                  text={
                    isInChange
                      ? 'Processing transaction'
                      : changeType === changeTypeEnum.TRANSFER
                        ? 'Transfer Mint Authority'
                        : 'Revoke Mint Authority'
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </>
          ) : (
            <div className={launchpadStyle.updateCardMessage}>
              <h2 className={launchpadStyle.updateCardh2}>
                {mintAuthStatus?.message}
              </h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: mintAuthStatus?.description,
                }}
              />
            </div>
          )
        ) : (
          <h2 className={launchpadStyle.updateCardh2}>
            Please connect wallet to mint
          </h2>
        )}
      </Card>
    </div>
  );
};
