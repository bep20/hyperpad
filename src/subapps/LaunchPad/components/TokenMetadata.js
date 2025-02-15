import React, { useEffect, useState, useMemo } from 'react';
import Card from 'antd/es/card';
import Input from 'antd/es/input';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import TextArea from 'antd/es/input/TextArea';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import message from 'antd/es/message';
import { PublicKey } from '@solana/web3.js';
import { CustomFileUpload } from './UploadFile';
import { AppContext, getCluster } from '../../../context/AppStore';
import { DEFAULT_SOCIAL_MEDIA, SUBMISSION_STATE_ENUM } from '../constants/data';
import { Token2022Client } from '../utils/token22';
import launchpadStyle from '../style/launchpad.module.less';
import { TokenDetailsClient } from '../utils/tokendetails';
import { SolUtils } from '../../../solana/SolUtils';
import { HyperButton } from '../../../components/buttons/HyperButton';
import { NotifyContext } from '../../../context/Notify';
import { uploadAndGenerateURL, uploadMetadata } from '../utils/helpers';

const DEFAULT_UPDATE_METADATA = {
  name: null,
  ticker: null,
  description: null,
  imageURL: null,
  metadataURI: null,
  uriUploaded: false,
};

export const TokenMetadata = ({ tokenData, uriData }) => {
  const [appStore, dispatchAppStore] = React.useContext(AppContext);
  const [notifyApi] = React.useContext(NotifyContext);

  const [formSubmission, setIsFormSubmission] = useState(
    SUBMISSION_STATE_ENUM.FORM_FILLING,
  );
  const [imageFile, setImageFile] = useState(null);

  const [updateStatus, setUpdateStatus] = React.useState({
    canChange: false,
    message: null,
  });
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();
  const [tokenInfo, setTokenInfo] = React.useState(DEFAULT_UPDATE_METADATA);
  const [initialRender, setInitialRender] = React.useState(true);

  const updateMetaData = async tokenInfo => {
    try {
      const token22Client = new Token2022Client(connection);
      const tokenDetailsClient = new TokenDetailsClient(connection);

      const cluster = getCluster(appStore?.currentNetwork);

      let exTxn = null;
      let plexTxn = null;

      const metadataPnt = tokenData?.extensions?.find(
        item => item.extension === 'metadataPointer',
      );
      const metadataExt = tokenData?.extensions?.find(
        item => item.extension === 'tokenMetadata',
      );

      if (metadataPnt) {
        const metadataAuthority = metadataPnt?.state?.authority;
        const metadataAddress = metadataPnt?.state?.metadataAddress;

        if (metadataAddress) {
          exTxn = await token22Client.getUpdateMetadataExtensionTransaction(
            new PublicKey(metadataAddress),
            new PublicKey(metadataAuthority),
            tokenInfo?.name,
            tokenInfo?.ticker,
            tokenInfo?.metadataURI,
          );
        }
      } else if (metadataExt) {
        const metadataAuthority = metadataExt?.updateAuthority;
        const metadataAddress = tokenData?.mint;
        if (metadataAddress) {
          exTxn = await token22Client.getUpdateMetadataExtensionTransaction(
            new PublicKey(metadataAddress),
            new PublicKey(metadataAuthority),
            tokenInfo?.name,
            tokenInfo?.ticker,
            tokenInfo?.metadataURI,
          );
        }
      }

      const metadataProgramId = tokenDetailsClient.metadataProgram(
        new PublicKey(tokenData?.programId),
      );

      const metadataPDA = token22Client.getMetadataPDA(
        new PublicKey(tokenData?.mint),
        metadataProgramId,
      );

      const updatedMetadata = {
        data: {
          name: tokenInfo?.name,
          symbol: tokenInfo?.ticker,
          uri: tokenInfo?.metadataURI,
          sellerFeeBasisPoints: 0,
          uses: null,
          creators: null,
          collection: null,
        },
        updateAuthority: new PublicKey(tokenData?.metadata?.updateAuthority),
        isMutable: true,
        primarySaleHappened: false,
      };

      plexTxn = await token22Client.getUpdateMetadataTransaction(
        wallet.publicKey,
        metadataPDA,
        new PublicKey(tokenData?.metadata?.updateAuthority),
        updatedMetadata,
        metadataProgramId,
      );

      if (exTxn) {
        plexTxn.add(exTxn);
      }

      const signature = await SolUtils.sendAndConfirmRawTransactionV1(
        connection,
        plexTxn,
        wallet,
        [],
        notifyApi,
        cluster,
      );

      if (!signature) {
        throw new Error('transaction failed');
      }
    } catch (err) {
      console.log('error is', err);
    }
  };

  const handleUpdateMetadata = async () => {
    // here it goes for updating metadata in multiplax

    try {
      let tkInfo = tokenInfo;
      if (imageFile) {
        setIsFormSubmission(SUBMISSION_STATE_ENUM.FILE_UPLOADING);
        const fileUrl = await uploadAndGenerateURL(imageFile);
        tkInfo = {
          ...tkInfo,
          imageURL: fileUrl,
        };
      }

      setIsFormSubmission(SUBMISSION_STATE_ENUM.METADATA_UPLOADING);

      const metadatUrl = await uploadMetadata(tkInfo, DEFAULT_SOCIAL_MEDIA);

      tkInfo = {
        ...tkInfo,
        metadataURI: metadatUrl,
      };
      setIsFormSubmission(SUBMISSION_STATE_ENUM.TOKEN_CREATING);

      const result = await updateMetaData(tkInfo);
    } catch (err) {
      console.log('error', err);
      message.error('Unable to Update metadata, Please contact team !!');
    } finally {
      setIsFormSubmission(SUBMISSION_STATE_ENUM.FORM_FILLING);
    }
  };

  useEffect(() => {
    if (!initialRender) {
      let canChange = true;
      let changeMessage = null;

      if (!tokenData?.metadata?.updateAuthority) {
        canChange = false;
        changeMessage = 'Metadata Authority is revoked';
      } else if (!wallet.connected) {
        canChange = false;
        changeMessage = 'Connect Wallet to update Metadata!';
      } else if (
        wallet.publicKey.toBase58() !== tokenData?.metadata?.updateAuthority
      ) {
        canChange = false;
        changeMessage = 'You dont have Authority to update metadata';
      }

      setUpdateStatus({
        canChange,
        message: changeMessage,
      });
    }
    setInitialRender(false);
  }, [
    initialRender,
    wallet?.connected,
    connection?._rpcEndpoint,
    tokenData?.updateAuthority,
  ]);

  useEffect(() => {
    setTokenInfo(() => ({
      name: tokenData?.metadata?.data?.name?.replace(/\u0000/g, ''),
      ticker: tokenData?.metadata?.data?.symbol?.replace(/\u0000/g, ''),
      description: uriData?.description?.replace(/\u0000/g, ''),
      imageURL: uriData?.image?.replace(/\u0000/g, ''),
      metadataURI: tokenData?.metadata?.data?.uri?.replace(/\u0000/g, ''),
      uriUploaded: false,
    }));
  }, [
    tokenData?.metadata?.data?.name,
    tokenData?.metadata?.data?.symbol,
    uriData?.description,
    uriData?.image,
    tokenData?.metadata?.data?.uri,
  ]);

  const doesFieldDisabled =
    formSubmission != SUBMISSION_STATE_ENUM.FORM_FILLING;

  const isTokenUpdateDisabled = useMemo(
    () =>
      !tokenInfo.name ||
      !tokenInfo.ticker ||
      !(imageFile || tokenInfo?.imageURL) ||
      formSubmission != SUBMISSION_STATE_ENUM.FORM_FILLING,
    [
      tokenInfo.name,
      tokenInfo.ticker,
      tokenInfo?.imageURL,
      imageFile,
      formSubmission,
    ],
  );

  if (!updateStatus.canChange || !wallet?.connected) {
    return null;
  }

  return (
    <div className={launchpadStyle.tokenMetadataContent}>
      <Card className={launchpadStyle.burnCard}>
        {updateStatus.canChange ? (
          <>
            <div className={launchpadStyle.metadataInput}>
              <Row gutter={24} className={launchpadStyle.metadataInputRow}>
                <Col span={8} className={launchpadStyle.metadataInputRowCol}>
                  <p className={launchpadStyle.fieldLabel}>New Token name</p>
                </Col>
                <Col span={16} className={launchpadStyle.metadataInputRowCol}>
                  <Input
                    size='large'
                    disabled={doesFieldDisabled}
                    value={tokenInfo?.name}
                    onChange={event =>
                      setTokenInfo(prev => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className={launchpadStyle.fieldInput}
                    placeholder='Token Name'
                  />
                </Col>
              </Row>
              <Row gutter={24} className={launchpadStyle.metadataInputRow}>
                <Col span={8} className={launchpadStyle.metadataInputRowCol}>
                  <p className={launchpadStyle.fieldLabel}>New Token ticker</p>
                </Col>
                <Col span={16} className={launchpadStyle.metadataInputRowCol}>
                  <Input
                    size='large'
                    disabled={doesFieldDisabled}
                    value={tokenInfo?.ticker}
                    onChange={event => {
                      setTokenInfo(prev => ({
                        ...prev,
                        ticker: event.target.value,
                      }));
                    }}
                    className={launchpadStyle.fieldInput}
                    placeholder='Token Ticker'
                  />
                </Col>
              </Row>
              <Row gutter={24} className={launchpadStyle.metadataInputRow}>
                <Col span={8} className={launchpadStyle.metadataInputRowCol}>
                  <p className={launchpadStyle.fieldLabel}>
                    New Token description
                  </p>
                </Col>
                <Col span={16} className={launchpadStyle.metadataInputRowCol}>
                  <TextArea
                    size='large'
                    disabled={doesFieldDisabled}
                    value={tokenInfo?.description}
                    onChange={event => {
                      setTokenInfo(prev => ({
                        ...prev,
                        description: event.target.value,
                      }));
                    }}
                    className={launchpadStyle.fieldInput}
                    placeholder='Token description'
                    style={{
                      height: 90,
                      resize: 'none',
                    }}
                  />
                </Col>
              </Row>
              <Row gutter={24} className={launchpadStyle.metadataInputRow}>
                <Col span={24} className={launchpadStyle.metadataInputRowCol}>
                  <CustomFileUpload
                    uploadedURL={tokenInfo?.imageURL}
                    setTokenInfo={setTokenInfo}
                    isFormSubmission={doesFieldDisabled}
                    doesFieldDisabled={doesFieldDisabled}
                    imageFile={imageFile}
                    setImageFile={setImageFile}
                  />
                </Col>
              </Row>
            </div>
            <div className={launchpadStyle.updateBtnContainer}>
              <HyperButton
                style={{ width: '100%' }}
                disabled={isTokenUpdateDisabled}
                onClick={handleUpdateMetadata}
                text={
                  formSubmission === SUBMISSION_STATE_ENUM.FILE_UPLOADING
                    ? 'Uploading logo...'
                    : formSubmission == SUBMISSION_STATE_ENUM.METADATA_UPLOADING
                      ? 'Uploading metadata...'
                      : formSubmission == SUBMISSION_STATE_ENUM.TOKEN_CREATING
                        ? 'Updating token'
                        : 'Update token'
                }
              />
            </div>
          </>
        ) : (
          <h2>{updateStatus?.message}</h2>
        )}
      </Card>
    </div>
  );
};
