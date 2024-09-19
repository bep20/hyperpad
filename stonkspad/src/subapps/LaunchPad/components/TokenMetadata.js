import React, { useEffect } from "react";
import Card from "antd/es/card";
import launchpadStyle from "../style/launchpad.module.less";
import Button from "antd/es/button";
import Input from "antd/es/input";
import Row from "antd/es/row";
import Col from "antd/es/col";
import TextArea from "antd/es/input/TextArea";
import { CustomFileUpload } from "./UploadFile";
import { SocialMedia } from "./SocialMedia";
import { DEFAULT_SOCIAL_MEDIA } from "../constants/data";
import { UploadMetaData } from "./UploadMetaData";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getIrysNetwork, uploadJSON } from "../utils/irys";
import { getUploadedFileURL, uploadFile } from "../utils/irys";
import { AppContext } from "../../../context/AppStore";
import message from "antd/es/message";
import { PublicKey, Transaction } from "@solana/web3.js";
import { createUpdateMetadataAccountV2Instruction } from "@metaplex-foundation/mpl-token-metadata";
const DEFAULT_UPDATE_METADATA = {
  name: null,
  ticker: null,
  description: null,
  imageURL: null,
  metadataURI: null,
  uriUploaded: false,
};

export const TokenMetadata = ({ tokenData }) => {
  const [appStore, dispatchAppStore] = React.useContext(AppContext);
  const [updateStatus, setUpdateStatus] = React.useState({
    canChange: false,
    message: null,
  });
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();
  const [tokenInfo, setTokenInfo] = React.useState(DEFAULT_UPDATE_METADATA);
  const [socialMediaInfo, setSocialMediaInfo] =
    React.useState(DEFAULT_SOCIAL_MEDIA);

  const [isSocialMediaEnabled, setIsSocialMediaEnabled] = React.useState(false);

  const uploadMetadata = async () => {
    if (!wallet.connected) {
      message.error("Please connect to wallet to proceed further.");
      return;
    }
    console.log("file want to upload");
    const IRYS_NETWORK = getIrysNetwork(appStore?.currentNetwork);
    const uploadedFile = await uploadJSON(
      connection._rpcEndpoint,
      IRYS_NETWORK,
      wallet,
      {
        name: tokenInfo.name,
        image: tokenInfo.imageURL,
        symbol: tokenInfo.ticker,
        description: tokenInfo.description,
        socialMedia: isSocialMediaEnabled
          ? {
              twitter: socialMediaInfo.twitter,
              telegram: socialMediaInfo.telegram,
              website: socialMediaInfo.website,
              medium: socialMediaInfo.medium,
              discord: socialMediaInfo.discord,
            }
          : {
              twitter: null,
              telegram: null,
              website: null,
              medium: null,
              discord: null,
            },
      }
    );
    const fileUrl = getUploadedFileURL(uploadedFile);
    console.log("file url", fileUrl);
    setTokenInfo((prev) => {
      return {
        ...prev,
        metadataURI: fileUrl,
        uriUploaded: true,
      };
    });
  };
  const uploadAndGenerateURL = async (file) => {
    if (!wallet.connected) {
      message.error("Please connect to wallet to proceed further.");
      return;
    }
    console.log("file want to upload", file);
    const IRYS_NETWORK = getIrysNetwork(appStore?.currentNetwork);

    const uploadedFile = await uploadFile(
      connection._rpcEndpoint,
      IRYS_NETWORK,
      wallet,
      file
    );
    const fileUrl = getUploadedFileURL(uploadedFile);
    setTokenInfo((prev) => {
      console.log("fillllllefilllllle", fileUrl);
      return {
        ...prev,
        imageURL: fileUrl,
      };
    });
  };

  const updateMetadata = async () => {
    // here it goes for updating metadata in multiplax

    const transaction = new Transaction().add(
      createUpdateMetadataAccountV2Instruction(
        {
          metadata: new PublicKey(tokenData?.metadataAccount),
          updateAuthority: new PublicKey(tokenData?.updateAuthority),
        },
        {
          updateMetadataAccountArgsV2: {
            data: {
              name: tokenInfo?.name,
              symbol: tokenInfo?.ticker,
              uri: tokenInfo?.metadataURI,
              sellerFeeBasisPoints: null,
              sellerFeeBasisPoints: 0,
              collection: null,
              creators: null,
              uses: null,
            },
            updateAuthority: new PublicKey(tokenData?.updateAuthority),
            primarySaleHappened: null,
            isMutable: true,
          },
        }
      )
    );
    // get latest block hash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    console.log(`Latest Blockhash: ${blockhash}`);

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    transaction.feePayer = wallet.publicKey;

    // sign by wallet
    let signedTransaction = await wallet.signTransaction(transaction);

    // sendAndConfirmTransaction;
    console.log("serarlised_transaction", signedTransaction.serialize());
    // Send the signed transaction to the network
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );
    console.log("Transactionsubmitted:", signature);
    message.success(`successfully updated metadata`, 5);
  };

  useEffect(() => {
    if (
      wallet?.connected &&
      connection?._rpcEndpoint &&
      tokenData?.updateAuthority
    ) {
      // fetch account balance and set userCurrentBalance
      if (tokenData?.updateAuthority) {
        if (tokenData?.mintAuthority != wallet.publicKey.toBase58()) {
          setUpdateStatus({
            canChange: false,
            message: `You dont have permission to update metadata`,
          });
        } else {
          setUpdateStatus({
            canChange: true,
            message: null,
          });
        }
      } else {
        setUpdateStatus({
          canChange: false,
          message: `${tokenData?.symbol} metadata is not updatable`,
        });
      }
    } else if (connection?._rpcEndpoint) {
      if (tokenData?.updateAuthority) {
        setUpdateStatus({
          canChange: false,
          message: `Connect your wallet to verify metadata authority.`,
        });
      } else {
        setUpdateStatus({
          canChange: false,
          message: `${tokenData?.symbol} metadata is not updatable`,
        });
      }
    }
  }, [wallet?.connected, connection?._rpcEndpoint, tokenData?.updateAuthority]);

  useEffect(() => {
    setTokenInfo((prev) => {
      return {
        ...prev,
        name: tokenData?.name,
        ticker: tokenData?.symbol,
        description: tokenData?.uriData?.description,
        imageURL: tokenData?.uriData?.image,
        metadataURI: tokenData?.uri,
        uriUploaded: false,
      };
    });
    setSocialMediaInfo((prev) => {
      return {
        ...prev,
        telegram: tokenData?.uriData?.socialMedia?.telegram,
        twitter: tokenData?.uriData?.socialMedia?.twitter,
        medium: tokenData?.uriData?.socialMedia?.medium,
        website: tokenData?.uriData?.socialMedia?.website,
      };
    });
    if (
      tokenData?.uriData?.socialMedia?.telegram ||
      tokenData?.uriData?.socialMedia?.twitter ||
      tokenData?.uriData?.socialMedia?.medium ||
      tokenData?.uriData?.socialMedia?.website
    ) {
      setIsSocialMediaEnabled(true);
    }
  }, [tokenData]);

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
                    size="large"
                    disabled={tokenInfo?.uriUploaded}
                    value={tokenInfo?.name}
                    onChange={(event) =>
                      setTokenInfo((prev) => {
                        return {
                          ...prev,
                          name: event.target.value,
                        };
                      })
                    }
                    className={launchpadStyle.fieldInput}
                    placeholder="Token Name"
                  />
                </Col>
              </Row>
              <Row gutter={24} className={launchpadStyle.metadataInputRow}>
                <Col span={8} className={launchpadStyle.metadataInputRowCol}>
                  <p className={launchpadStyle.fieldLabel}>New Token ticker</p>
                </Col>
                <Col span={16} className={launchpadStyle.metadataInputRowCol}>
                  <Input
                    size="large"
                    disabled={tokenInfo?.uriUploaded}
                    value={tokenInfo?.ticker}
                    onChange={(event) => {
                      setTokenInfo((prev) => {
                        return {
                          ...prev,
                          ticker: event.target.value,
                        };
                      });
                    }}
                    className={launchpadStyle.fieldInput}
                    placeholder="Token Ticker"
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
                    size="large"
                    disabled={tokenInfo?.uriUploaded}
                    value={tokenInfo?.description}
                    onChange={(event) => {
                      setTokenInfo((prev) => {
                        return {
                          ...prev,
                          description: event.target.value,
                        };
                      });
                    }}
                    className={launchpadStyle.fieldInput}
                    placeholder="Token description"
                    style={{
                      height: 90,
                      resize: "none",
                    }}
                  />
                </Col>
              </Row>
              <Row gutter={24} className={launchpadStyle.metadataInputRow}>
                <Col span={24} className={launchpadStyle.metadataInputRowCol}>
                  <CustomFileUpload
                    uploadedURL={tokenInfo?.imageURL}
                    setTokenInfo={setTokenInfo}
                    uploadAndGenerateURL={uploadAndGenerateURL}
                    isMetaDataUploaded={tokenInfo.uriUploaded}
                  />
                </Col>
              </Row>
              <Row gutter={24} className={launchpadStyle.metadataInputRow}>
                <Col span={24} className={launchpadStyle.metadataInputRowCol}>
                  {tokenInfo?.name?.length &&
                  tokenInfo?.imageURL?.length &&
                  tokenInfo?.ticker?.length ? (
                    <>
                      <SocialMedia
                        isSocialMediaEnabled={isSocialMediaEnabled}
                        setIsSocialMediaEnabled={setIsSocialMediaEnabled}
                        socialMediaInfo={socialMediaInfo}
                        setSocialMediaInfo={setSocialMediaInfo}
                        isMetaDataUploaded={tokenInfo?.uriUploaded}
                      />
                      <UploadMetaData
                        uploadMetadata={uploadMetadata}
                        isDisabled={tokenInfo.uriUploaded}
                      />
                    </>
                  ) : null}
                </Col>
              </Row>
            </div>
            <div className={launchpadStyle.updateBtnContainer}>
              <Button
                disabled={!tokenInfo?.uriUploaded}
                className={`${launchpadStyle.primaryButton} ${launchpadStyle.updateMetadata}`}
                onClick={updateMetadata}
              >
                Update Metadata
              </Button>
            </div>{" "}
          </>
        ) : (
          <h2>{updateStatus?.message}</h2>
        )}
      </Card>
    </div>
  );
};
