import React, { useEffect, useMemo } from "react";
import Button from "antd/es/button";
import Modal from "antd/es/modal";
import launchpadStyle from "../style/launchpad.module.less";
import { useWallet } from "@solana/wallet-adapter-react";

export const UploadMetaData = ({ uploadMetadata, isDisabled }) => {
  const wallet = useWallet();
  return (
    <div>
      <Button
        disabled={isDisabled}
        className={`${launchpadStyle.defaultButton} ${launchpadStyle.uploadMetadata}`}
        onClick={wallet?.connected ? uploadMetadata : wallet.connect}
      >
        {wallet?.connected ? " Upload MetaData" : "Connect to Wallet"}
      </Button>
      <Modal />
    </div>
  );
};
