import React, { useState } from 'react';
import Radio from 'antd/es/radio';
import message from 'antd/es/message';
import Input from 'antd/es/input';
import walletaddress from '.././style/walletaddress.module.less';
import { InfoCircleOutlined } from '@ant-design/icons';
import { CopyString } from '../subapps/LaunchPad/components/CopyString';
import { Keypair } from '@solana/web3.js';
import Tooltip from 'antd/es/tooltip';
import NumberInput from './NumberInput';
import { HyperSButton } from './buttons/HyperSButton';
import { generateCsAddress, terminateAllWorkers } from '../utils/grind';

import { HyperButton } from './buttons/HyperButton';
function isBase58(str) {
  const pattern =
    /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  return pattern.test(str);
}
export const Walletaddress = ({
  className,
  context,
  contractKeyPair,
  setContractKeyPair,
  doesFieldDisabled,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [addressPrefix, setAddressPrefix] = useState(null);
  const [addressSuffix, setAddressSufix] = useState(null);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [threadCount, setThreadCount] = useState(1);

  const pauseGeneration = async () => {
    // pause address generation
    try {
      terminateAllWorkers();
    } catch (err) {
      console.log('unable to pause generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAddress = async () => {
    // handle address generation
    try {
      // validate the prefix here to only have base 58 characters

      if (addressPrefix?.length > 4) {
        return message.error('Up to 4 Characters in prefix is supported !!');
      }
      if (addressSuffix?.length > 4) {
        return message.error('Up to 4 Characters in suffix is supported !!');
      }
      if (addressPrefix && !isBase58(addressPrefix || '')) {
        return message.error('Please enter valid base 58 characters.');
      }
      if (addressSuffix && !isBase58(addressSuffix || '')) {
        return message.error('Please enter valid base 58 characters.');
      }

      setIsGenerating(true);
      setContractKeyPair(null);
      const resultt = await generateCsAddress(
        addressPrefix,
        addressSuffix,
        caseSensitive,
        threadCount,
      );
      const kp = new Keypair(resultt?.[0]?._keypair);
      setContractKeyPair(kp);
    } catch (err) {
      console.log('not able to generate custom address');
    } finally {
      setIsGenerating(false);
    }
  };

  const example1 = '5uECuQVfSon2t7KYJpwmEanrYrykVLe7i2M5rpUpJm6c'.slice(
    addressPrefix?.length || 0,
  );
  const example = example1.slice(
    0,
    example1?.length - (addressSuffix?.length || 0),
  );

  return (
    <>
      <div
        className={`${walletaddress.customAddressContainer} ${className} w-full mt-[0rem] m-auto`}>
        <div className={walletaddress.prefixSuffix}>
          <div className={walletaddress.addressItem}>
            <p className={walletaddress.fieldLabel}>
              Address Prefix &nbsp;
              <Tooltip title='Enter prefix that you want your address to starts with. Supported Characters 1-9, a-z, A-Z except 0,I,O,l'>
                <InfoCircleOutlined />
              </Tooltip>
            </p>
            <Input
              size='middle'
              allowClear
              disabled={isGenerating || doesFieldDisabled}
              value={addressPrefix}
              placeholder='Add Contract address prefix'
              className={walletaddress.fieldInput}
              onChange={event => setAddressPrefix(event.target.value)}
            />
          </div>
          <div className={walletaddress.addressItem}>
            <p className={walletaddress.fieldLabel}>
              Address Suffix &nbsp;
              <Tooltip title='Enter suffix that you want your address to ends with. Supported Characters 1-9, a-z, A-Z except 0,I,O,l'>
                <InfoCircleOutlined />
              </Tooltip>
            </p>
            <Input
              size='middle'
              allowClear
              disabled={isGenerating || doesFieldDisabled}
              value={addressSuffix}
              placeholder='Add Contract address suffix'
              className={walletaddress.fieldInput}
              onChange={event => setAddressSufix(event.target.value)}
            />
          </div>
        </div>
        <div className={walletaddress.example}>
          <p>Example:&nbsp;&nbsp;</p>
          <p>
            <span className={walletaddress.boldText}>{addressPrefix}</span>
            <span>{example}</span>
            <span className={walletaddress.boldText}>{addressSuffix}</span>
          </p>
        </div>
        {context !== 'vanity' && (
          <div>
            <p
              className={walletaddress.fieldLabel}
              style={{ display: 'inline-flex', alignItems: 'baseline' }}>
              {contractKeyPair ? (
                <>
                  <span>Token Address:&nbsp;</span>
                  <CopyString
                    style={{ background: '#d2ffca' }}
                    data={contractKeyPair.publicKey?.toBase58()}
                    dataToCopy={contractKeyPair.publicKey?.toBase58()}
                  />
                </>
              ) : (
                ''
              )}
            </p>
          </div>
        )}
        <div className={walletaddress.caseSensitive}>
          <span>Case Sensitive&nbsp;&nbsp;</span>
          <Radio.Group
            disabled={isGenerating || doesFieldDisabled}
            onChange={event => setCaseSensitive(event.target.value)}
            value={caseSensitive}>
            <Radio value={false}>No</Radio>
            <Radio value={true}>Yes</Radio>
          </Radio.Group>
        </div>
        <div className={walletaddress.threads}>
          <p>Threads (adjust based on your device's performance)</p>
          <NumberInput
            disabled={isGenerating || doesFieldDisabled}
            value={threadCount}
            onChange={val => setThreadCount(val)}
            max={10}
            className={context === 'vanity' ? 'w-1/2' : 'w-full'}
          />
        </div>
        <div className={walletaddress.generate}>
          <HyperSButton
            disabled={!isGenerating || doesFieldDisabled}
            text='Pause'
            onClick={pauseGeneration}
            btnSize='medium-btn'
          />
          <HyperButton
            disabled={isGenerating || doesFieldDisabled}
            text={isGenerating ? 'Generating...' : 'Generate Address'}
            onClick={generateAddress}
            btnSize='medium-btn'
          />
        </div>
      </div>
    </>
  );
};
