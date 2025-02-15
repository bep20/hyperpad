import React, { useState } from 'react';
import Card from 'antd/es/card';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import Select from 'antd/es/select';
import { PublicKey } from '@solana/web3.js';
import { AuthorityType } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { CopyString } from './CopyString';
import { changeTypeOption, changeTypeEnum } from '../constants/data';

import { HyperButton } from '../../../components/buttons/HyperButton';
import { Token2022Client } from '../utils/token22';
import { SolUtils } from '../../../solana/SolUtils';
import launchpadStyle from '../style/launchpad.module.less';
import { AppContext, getCluster } from '../../../context/AppStore';
import { NotifyContext } from '../../../context/Notify';

export const TaxAuthority = ({ tokenData, className }) => {
  const [appStore] = React.useContext(AppContext);
  const [notifyApi] = React.useContext(NotifyContext);

  const [isInChange, setIsInChange] = useState(false);

  const [changeType, setChangeType] = React.useState(changeTypeEnum.REVOKE);
  const [targetTaxAuthority, setTargetTaxAuthority] = React.useState(null);
  const [taxAuthStatus, setTaxAuthStatus] = React.useState({
    canChange: false,
    message: null,
  });
  const { connection } = useConnection();
  const wallet = useWallet();

  React.useEffect(() => {
    let canChange = true;
    let changeMessage = null;
    let changeDescription = null;

    const taxExtension = tokenData?.extensions?.find(
      item => item.extension === 'transferFeeConfig',
    );

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
      changeDescription = `The current tax authority is <b> ${taxExtension?.state?.transferFeeConfigAuthority}</b>.<br> Only current authority can change or revoke`;
    }

    setTaxAuthStatus({
      canChange,
      message: changeMessage,
      description: changeDescription,
    });
  }, [wallet?.connected, connection, tokenData?.extensions]);

  const handleTaxAuthority = async () => {
    if (!targetTaxAuthority && changeType === changeTypeEnum.TRANSFER) {
      message.error('Enter a valid transfer address');
      return;
    }
    const newTargetTaxAuthority =
      changeType === changeTypeEnum.TRANSFER
        ? new PublicKey(targetTaxAuthority)
        : null;

    const token22Client = new Token2022Client(connection);
    const cluster = getCluster(appStore?.currentNetwork);

    try {
      setIsInChange(true);

      const txn = await token22Client.getChangeAuthorityTransaction(
        wallet.publicKey,
        new PublicKey(tokenData?.mint),
        AuthorityType.TransferFeeConfig,
        newTargetTaxAuthority,
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
      setTargetTaxAuthority(null);
    } catch (err) {
      console.log('error', err);
    } finally {
      setIsInChange(false);
    }
  };

  const ttAuthority = tokenData?.extensions?.find(
    item => item.extension === 'transferFeeConfig',
  )?.state?.transferFeeConfigAuthority;

  if (!tokenData.programId) {
    return null;
  }
  return (
    <div
      className={` ${launchpadStyle.tokenFreezeAuthorityContent} ${className}`}>
      <Card className={launchpadStyle.burnCard}>
        {taxAuthStatus.canChange ? (
          <>
            <div className={launchpadStyle.burnCardInput}>
              <div className={launchpadStyle.inputBurnTokenContainer}>
                <div className={launchpadStyle.youBurn}>
                  Current Tax Authority
                </div>
                <div className={launchpadStyle.tokenInputAmoutContainer}>
                  <p
                    className={`${launchpadStyle.inputBurn} ${launchpadStyle.disabledMock}`}
                    placeholder='0'
                    readOnly
                    onClick={event => {
                      console.log('event in disabled', event);
                    }}
                    value={ttAuthority}>
                    <CopyString data={ttAuthority} dataToCopy={ttAuthority} />
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
                        <p style={{ margin: '0px', fontSize: '1.2rem' }}>
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
                    New Tax Authority
                  </div>
                  <div className={launchpadStyle.tokenInputAmoutContainer}>
                    <Input
                      className={launchpadStyle.inputBurn}
                      placeholder='0'
                      value={targetTaxAuthority}
                      onChange={event =>
                        setTargetTaxAuthority(event.target.value)
                      }
                    />
                  </div>
                  <div className={launchpadStyle.walletBalance} />
                </div>
              ) : null}
            </div>
            <div>
              <HyperButton
                onClick={handleTaxAuthority}
                disabled={isInChange}
                text={
                  isInChange
                    ? 'Processing transaction'
                    : changeType === changeTypeEnum.TRANSFER
                      ? 'Transfer Tax Authority'
                      : 'Revoke Tax Authority'
                }
                style={{ width: '100%' }}
              />
            </div>
          </>
        ) : (
          <div className={launchpadStyle.updateCardMessage}>
            <h2 className={launchpadStyle.updateCardh2}>
              {taxAuthStatus?.message}
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: taxAuthStatus?.description,
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
