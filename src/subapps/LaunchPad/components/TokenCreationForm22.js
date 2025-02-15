import React, { useState, useEffect, useMemo } from 'react';

import Input from 'antd/es/input/Input';
import TextArea from 'antd/es/input/TextArea';
import Tooltip from 'antd/es/tooltip';
import { InfoCircleOutlined } from '@ant-design/icons';
import launchpadStyle from '../style/launchpad.module.less';
import { CustomFileUpload } from './UploadFile';
import { SocialMedia } from './SocialMedia';
import { HyperButton } from '../../../components/buttons/HyperButton';
import { SplExtensions } from './SplExtensions';
import { SUBMISSION_STATE_ENUM } from '../constants/data';
import { CustomAddress } from './CustomAddress';
import { RevokeCards } from './RevokeCards';

export const TokenCreationForm22 = ({
  tokenInfo,
  setTokenInfo,
  formSubmission,
  handleTokenSubmission,
  extensionConfig,
  setExtensionConfig,
  extensionValues,
  setExtensionValues,
  contractKeyPair,
  setContractKeyPair,
  csAddressChecked,
  setCsAddressChecked,
  addressPrefix,
  setAddressPrefix,
  addressSuffix,
  setAddressSufix,
  caseSensitive,
  setCaseSensitive,
  threadCount,
  setThreadCount,
  revokeConfig,
  setRevokeConfig,
  socialMediaInfo,
  setSocialMediaInfo,
  isSocialMediaEnabled,
  setIsSocialMediaEnabled,
  imageFile,
  setImageFile,
}) => {
  const isTokenCreationDisabled = useMemo(
    () =>
      !tokenInfo.name ||
      !tokenInfo.ticker ||
      !tokenInfo.decimals ||
      !tokenInfo.supply ||
      !(imageFile || tokenInfo?.imageURL) ||
      (csAddressChecked && !contractKeyPair) ||
      formSubmission != SUBMISSION_STATE_ENUM.FORM_FILLING,
    [
      tokenInfo.name,
      tokenInfo.ticker,
      tokenInfo.decimals,
      tokenInfo.supply,
      tokenInfo?.imageURL,
      imageFile,
      formSubmission,
      csAddressChecked,
      contractKeyPair,
    ],
  );

  const doesFieldDisabled =
    formSubmission != SUBMISSION_STATE_ENUM.FORM_FILLING;

  return (
    <div className={launchpadStyle.tokenCreationFormContainer}>
      <div>
        <h2 className={launchpadStyle.minFormTitle}>
          <span className={launchpadStyle.highlighText}>SPL22:&nbsp;</span>
          Create SPL22 Token
        </h2>
        <div className={launchpadStyle.headerLine} />
      </div>
      <div className={launchpadStyle.mintForm}>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>
            Token Name &nbsp;
            <Tooltip title='Name of token'>
              <InfoCircleOutlined />
            </Tooltip>
          </p>
          <Input
            size='large'
            allowClear
            placeholder='Enter Token Name'
            className={launchpadStyle.fieldInput}
            value={tokenInfo.name}
            disabled={doesFieldDisabled}
            onChange={event => {
              setTokenInfo(prev => ({
                ...prev,
                name: event.target.value,
              }));
            }}
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>
            Token Ticker &nbsp;
            <Tooltip title='Symbol of Token'>
              <InfoCircleOutlined />
            </Tooltip>
          </p>
          <Input
            size='large'
            allowClear
            placeholder='Enter Token Ticker'
            value={tokenInfo.ticker}
            disabled={doesFieldDisabled}
            className={launchpadStyle.fieldInput}
            onChange={event => {
              setTokenInfo(prev => ({
                ...prev,
                ticker: event.target.value,
              }));
            }}
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>
            Token Decimals &nbsp;
            <Tooltip title='Number of decimals, Should be between 1 and 9'>
              <InfoCircleOutlined />
            </Tooltip>
          </p>
          <Input
            size='large'
            type='number'
            min={1}
            max={9}
            placeholder='Decimals'
            value={tokenInfo.decimals}
            disabled={doesFieldDisabled}
            className={launchpadStyle.fieldInput}
            onChange={event => {
              const num = event.target.value;
              let fnum = null;
              if (num) {
                const val = Math.max(parseInt(num));
                fnum = val < 1 ? 1 : val > 9 ? 9 : val;
              }
              setTokenInfo(prev => ({
                ...prev,
                decimals: fnum,
              }));
            }}
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>
            Token Supply &nbsp;
            <Tooltip title='Amount of tokens to mint.'>
              <InfoCircleOutlined />
            </Tooltip>
          </p>
          <Input
            size='large'
            type='number'
            min={1}
            placeholder='Total Supply'
            value={tokenInfo.supply}
            disabled={doesFieldDisabled}
            className={launchpadStyle.fieldInput}
            onChange={event => {
              const num = event.target.value;
              let fnum = null;
              if (num) {
                const val = Math.max(parseInt(num));
                fnum = val < 1 ? 1 : val;
              }
              setTokenInfo(prev => ({
                ...prev,
                supply: num,
              }));
            }}
          />
        </div>
        <div
          className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}>
          <p className={launchpadStyle.fieldLabel}>
            Token Description &nbsp;
            <Tooltip title='Add a description for your token, that will be shown in token metadata. You can also add social media links here'>
              <InfoCircleOutlined />
            </Tooltip>
          </p>
          <TextArea
            showCount
            maxLength={100}
            value={tokenInfo.description}
            disabled={doesFieldDisabled}
            style={{
              height: 120,
              resize: 'none',
            }}
            className={`${launchpadStyle.fieldInput}`}
            onChange={event => {
              setTokenInfo(prev => ({
                ...prev,
                description: event.target.value,
              }));
            }}
            placeholder='Token Description'
          />
        </div>
        <div
          className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}>
          <CustomFileUpload
            uploadedURL={tokenInfo.imageURL}
            setTokenInfo={setTokenInfo}
            isFormSubmission={doesFieldDisabled}
            setImageFile={setImageFile}
            imageFile={imageFile}
            doesFieldDisabled={doesFieldDisabled}
          />
          <div style={{ width: '100%', marginTop: '2rem' }}>
            <SocialMedia
              socialMediaInfo={socialMediaInfo}
              setSocialMediaInfo={setSocialMediaInfo}
              isSocialMediaEnabled={isSocialMediaEnabled}
              setIsSocialMediaEnabled={setIsSocialMediaEnabled}
              doesFieldDisabled={doesFieldDisabled}
            />
          </div>
        </div>

        <SplExtensions
          extensionConfig={extensionConfig}
          setExtensionConfig={setExtensionConfig}
          extensionValues={extensionValues}
          setExtensionValues={setExtensionValues}
        />
        <div
          className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}  mb-[1rem]`}>
          <CustomAddress
            contractKeyPair={contractKeyPair}
            setContractKeyPair={setContractKeyPair}
            csAddressChecked={csAddressChecked}
            setCsAddressChecked={setCsAddressChecked}
            addressPrefix={addressPrefix}
            setAddressPrefix={setAddressPrefix}
            addressSuffix={addressSuffix}
            setAddressSufix={setAddressSufix}
            caseSensitive={caseSensitive}
            setCaseSensitive={setCaseSensitive}
            threadCount={threadCount}
            setThreadCount={setThreadCount}
            doesFieldDisabled={doesFieldDisabled}
          />
        </div>
        <RevokeCards
          revokeConfig={revokeConfig}
          setRevokeConfig={setRevokeConfig}
          doesFieldDisabled={doesFieldDisabled}
        />
        <div className={launchpadStyle.actionButtonContainer}>
          <HyperButton
            style={{ width: '100%' }}
            disabled={isTokenCreationDisabled}
            onClick={handleTokenSubmission}
            text={
              formSubmission == SUBMISSION_STATE_ENUM.FILE_UPLOADING
                ? 'Uploading logo...'
                : formSubmission == SUBMISSION_STATE_ENUM.METADATA_UPLOADING
                  ? 'Uploading metadata ...'
                  : formSubmission === SUBMISSION_STATE_ENUM.TOKEN_CREATING
                    ? 'Creating token'
                    : 'Create Token'
            }
          />
        </div>
      </div>
    </div>
  );
};
