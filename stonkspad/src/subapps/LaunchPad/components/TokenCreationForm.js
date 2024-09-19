import React, { useState, useEffect, useMemo } from "react";

import Input from "antd/es/input/Input";
import Button from "antd/es/button";
import launchpadStyle from "../style/launchpad.module.less";
import TextArea from "antd/es/input/TextArea";
import { CustomFileUpload } from "./UploadFile";
import { SocialMedia } from "./SocialMedia";
import { UploadMetaData } from "./UploadMetaData";

export const TokenCreationForm = ({
  tokenInfo,
  setTokenInfo,
  socialMediaInfo,
  setSocialMediaInfo,
  isSocialMediaEnabled,
  setIsSocialMediaEnabled,
  handleTokenSubmission,
  uploadMetadata,
  uploadedURL,
  uploadAndGenerateURL,
}) => {
  const isTokenCreationDisabled = useMemo(() => {
    return (
      !tokenInfo.metadataURI ||
      !tokenInfo.name ||
      !tokenInfo.ticker ||
      !tokenInfo.decimals ||
      !tokenInfo.supply
    );
  }, [tokenInfo]);

  const doesFieldDisabled = tokenInfo?.metadataURI?.length;

  return (
    <div className={launchpadStyle.tokenCreationFormContainer}>
      <div>
        <h2 className={launchpadStyle.minFormTitle}>
          Mint SPL Token on Solana
        </h2>
      </div>
      <div className={launchpadStyle.mintForm}>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>Token Name</p>
          <Input
            size="large"
            allowClear
            placeholder="Enter Token Name"
            className={launchpadStyle.fieldInput}
            value={tokenInfo.name}
            disabled={doesFieldDisabled}
            onChange={(event) => {
              console.log("name change", event.target.value);
              setTokenInfo((prev) => {
                return {
                  ...prev,
                  name: event.target.value,
                };
              });
            }}
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>Token Ticker</p>
          <Input
            size="large"
            allowClear
            placeholder="Enter Token Ticker"
            value={tokenInfo.ticker}
            disabled={doesFieldDisabled}
            className={launchpadStyle.fieldInput}
            onChange={(event) => {
              console.log("ticker change", event.target.value);
              setTokenInfo((prev) => {
                return {
                  ...prev,
                  ticker: event.target.value,
                };
              });
            }}
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>Token Decimals</p>
          <Input
            size="large"
            allowClear
            placeholder="Decimals"
            value={tokenInfo.decimals}
            disabled={doesFieldDisabled}
            className={launchpadStyle.fieldInput}
            onChange={(event) => {
              console.log("decimals change", event.target.value);
              setTokenInfo((prev) => {
                return {
                  ...prev,
                  decimals: event.target.value,
                };
              });
            }}
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>Token Supply</p>
          <Input
            size="large"
            allowClear
            placeholder="Total Supply"
            value={tokenInfo.supply}
            disabled={doesFieldDisabled}
            className={launchpadStyle.fieldInput}
            onChange={(event) => {
              console.log("supply change", event.target.value);
              setTokenInfo((prev) => {
                return {
                  ...prev,
                  supply: event.target.value,
                };
              });
            }}
          />
        </div>
        <div
          className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}
        >
          <p className={launchpadStyle.fieldLabel}>Token Description</p>
          <TextArea
            showCount
            maxLength={100}
            value={tokenInfo.description}
            disabled={doesFieldDisabled}
            style={{
              height: 120,
              resize: "none",
            }}
            className={`${launchpadStyle.fieldInput}`}
            onChange={(event) => {
              console.log("desciption change", event.target.value);
              setTokenInfo((prev) => {
                return {
                  ...prev,
                  description: event.target.value,
                };
              });
            }}
            placeholder="Token Description"
          />
        </div>
        <div
          className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}
        >
          <CustomFileUpload
            uploadedURL={tokenInfo.imageURL}
            setTokenInfo={setTokenInfo}
            uploadAndGenerateURL={uploadAndGenerateURL}
            isMetaDataUploaded={tokenInfo?.metadataURI?.length}
          />
          {tokenInfo?.name?.length &&
          tokenInfo?.imageURL?.length &&
          tokenInfo?.ticker?.length &&
          tokenInfo?.description?.length ? (
            <>
              <SocialMedia
                socialMediaInfo={socialMediaInfo}
                setSocialMediaInfo={setSocialMediaInfo}
                isSocialMediaEnabled={isSocialMediaEnabled}
                setIsSocialMediaEnabled={setIsSocialMediaEnabled}
                isMetaDataUploaded={tokenInfo?.metadataURI?.length}
              />
              <UploadMetaData
                uploadMetadata={uploadMetadata}
                isDisabled={doesFieldDisabled}
              />
            </>
          ) : null}
        </div>
        <div className={launchpadStyle.actionButtonContainer}>
          <Button
            disabled={isTokenCreationDisabled}
            className={`${launchpadStyle.createTokenButton} ${launchpadStyle.primaryButton}`}
            onClick={handleTokenSubmission}
          >
            Create Token
          </Button>
        </div>
      </div>
    </div>
  );
};
