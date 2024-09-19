import React from "react";
import launchpadStyle from "../style/launchpad.module.less";

export const ConnectWalletCard = () => {
  return (
    <div className={launchpadStyle.connectWalletConatiner}>
      <h1> Connect to wallet for streamlined token management.</h1>
      <p>
        Connect your wallet to uncover a list of tokens associated with your
        account. Enhance your experience by managing and interacting with your
        tokens seamlessly.
      </p>
    </div>
  );
};
