import React from 'react';
import freezewallet from '../style/freezewallet.module.less';
import { FreezeWalletform } from '../components/FreezeWalletform';
import HelmetLayout from '../../../components/HelmetLayout';

const Freezewallet = () => {
  return (
    <>
      <HelmetLayout
        title='Freeze Solana Token Wallets Instantly with token freeze tool.'
        description='Instantly freeze Solana token wallets and secure your assets with this powerful tool.'></HelmetLayout>
      <div className={freezewallet.container}>
        <FreezeWalletform />
      </div>
    </>
  );
};

export default Freezewallet;
