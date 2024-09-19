import React from 'react';
import layoutStyle from '../style/layout.module.less';

// Connect to wallet for streamlined token management.
// Connect your wallet to uncover a list of tokens associated with your
// account. Enhance your experience by managing and interacting with your
// tokens seamlessly.
export const ConnectWalletCard = ({ title, description }) => {
  return (
    <div className={layoutStyle.connectWalletConatiner}>
      <h2>{title}</h2>
      <p> {description}</p>
    </div>
  );
};
