import React from 'react';
import managewallet from '../style/managewallet.module.less';
import { VanityAddressForm } from '../components/VanityAddressForm';

const VanityAddress = () => {
  return (
    <div className={managewallet.container}>
      <VanityAddressForm />
    </div>
  );
};

export default VanityAddress;
