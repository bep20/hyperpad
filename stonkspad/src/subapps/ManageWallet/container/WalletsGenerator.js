import React from 'react';
import managewallet from '../style/managewallet.module.less';
import { WalletsGeneratorForm } from '../components/WalletsGeneratorFrom';

const WalletsGenetaror = () => {
  return (
    <div className={managewallet.container}>
      <WalletsGeneratorForm />
    </div>
  );
};

export default WalletsGenetaror;
