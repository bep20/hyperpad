import React, { useState, useEffect, useContext } from 'react';
import Card from 'antd/es/card';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Select from 'antd/es/select';
import { PublicKey } from '@solana/web3.js';
import { AuthorityType } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { CopyString } from './CopyString';
import launchpadStyle from '../style/launchpad.module.less';
import { changeTypeOption, changeTypeEnum } from '../constants/data';

import { HyperButton } from '../../../components/buttons/HyperButton';
import { Token2022Client } from '../utils/token22';
import { SolUtils } from '../../../solana/SolUtils';
import { AppContext, getCluster } from '../../../context/AppStore';
import { NotifyContext } from '../../../context/Notify';

export const TokenFreezeAuthority = ({ tokenData, className }) => {
  const [appStore, dispatchAppStore] = useContext(AppContext);
  const [notifyApi] = useContext(NotifyContext);

  const [isInChange, setIsInChange] = useState(false);
  const [changeType, setChangeType] = useState(changeTypeEnum.REVOKE);
  const [targetFreezeAuthority, setTargetFreezeAuthority] = useState(null);
  const [freezeAuthStatus, setFreezeAuthStatus] = useState({
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

      if (!tokenData?.freezeAuthority) {
        canChange = false;
        changeMessage = 'Freeze Authority Revoked !!';
      } else if (!wallet?.connected) {
        canChange = false;
        changeMessage = 'Connect your wallet to check freeze authority !!';
      } else if (wallet.publicKey.toBase58() !== tokenData?.freezeAuthority) {
        canChange = false;
        changeMessage = 'You do not have Freeze Authority for this token.';
        changeDescription = `The current freeze authority is <b> ${tokenData?.freezeAuthority}</b>.<br> Only current authority can change or revoke`;
      }

      setFreezeAuthStatus({
        canChange,
        message: changeMessage,
        description: changeDescription,
      });
    }
    setInitialRender(false);
  }, [
    initialRender,
    wallet?.connected,
    connection,
    tokenData?.freezeAuthority,
  ]);

  const handleTransferFreezeAuthority = async () => {
    if (!targetFreezeAuthority && changeType === changeTypeEnum.TRANSFER) {
      message.error('Enter a valid transfer address');
      return;
    }
    const newTargetFreezeAuthority =
      changeType === changeTypeEnum.TRANSFER
        ? new PublicKey(targetFreezeAuthority)
        : null;

    const token22Client = new Token2022Client(connection);
    const cluster = getCluster(appStore?.currentNetwork);

    try {
      setIsInChange(true);

      const txn = await token22Client.getChangeAuthorityTransaction(
        wallet.publicKey,
        new PublicKey(tokenData?.mint),
        AuthorityType.FreezeAccount,
        newTargetFreezeAuthority,
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
        throw new Error('Unable to process transaction');
      }

      if (newTargetFreezeAuthority) {
        message.success(
          `successfully transferred to ${newTargetFreezeAuthority.toBase58()}`,
          3,
        );
      } else {
        message.success('successfully Revoked', 3);
      }

      setTargetFreezeAuthority(null);
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
    <div
      className={`${launchpadStyle.tokenFreezeAuthorityContent} ${className}`}>
      <Card className={launchpadStyle.burnCard}>
        {wallet?.connected ? (
          freezeAuthStatus?.canChange ? (
            <>
              <div className={launchpadStyle.burnCardInput}>
                <div className={launchpadStyle.inputBurnTokenContainer}>
                  <div className={launchpadStyle.youBurn}>
                    Current Freeze Authority
                  </div>
                  <div className={launchpadStyle.tokenInputAmoutContainer}>
                    <p
                      className={`${launchpadStyle.inputBurn} ${launchpadStyle.disabledMock}`}
                      placeholder='0'
                      readOnly
                      onClick={event => {
                        console.log('event in disabled', event);
                      }}
                      value={tokenData?.freezeAuthority}>
                      <CopyString
                        data={tokenData?.freezeAuthority}
                        dataToCopy={tokenData?.freezeAuthority}
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
                      New Freeze Authority
                    </div>
                    <div className={launchpadStyle.tokenInputAmoutContainer}>
                      <Input
                        className={launchpadStyle.inputBurn}
                        placeholder='0'
                        value={targetFreezeAuthority}
                        onChange={event =>
                          setTargetFreezeAuthority(event.target.value)
                        }
                      />
                    </div>
                    <div className={launchpadStyle.walletBalance} />
                  </div>
                ) : null}
              </div>
              <div>
                <HyperButton
                  onClick={handleTransferFreezeAuthority}
                  disabled={isInChange}
                  text={
                    isInChange
                      ? 'Processing transaction'
                      : changeType === changeTypeEnum.TRANSFER
                        ? 'Transfer Freeze Authority'
                        : 'Revoke Freeze Authority'
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </>
          ) : (
            <div className={launchpadStyle.updateCardMessage}>
              <h2 className={launchpadStyle.updateCardh2}>
                {freezeAuthStatus?.message}
              </h2>
              <p
                dangerouslySetInnerHTML={{
                  __html: freezeAuthStatus?.description,
                }}
              />
            </div>
          )
        ) : (
          <h2 className={launchpadStyle.updateCardh2}>
            Please connect wallet to update freeze authority
          </h2>
        )}
      </Card>
    </div>
  );
};
