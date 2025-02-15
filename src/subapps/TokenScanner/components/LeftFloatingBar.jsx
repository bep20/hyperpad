import React from 'react';
import { TokenInfo } from './TokenInfo';
import HelpModal from './HelpModal';
import HyperLinks from './HyperLinks';

const LeftFloatingBar = ({ tokenDetails }) => {
  return (
    <div className='flex gap-x-2 absolute top-[7px] left-[7px] z-[1]'>
      <TokenInfo tokenDetails={tokenDetails} />
      <HyperLinks />
      <HelpModal />
    </div>
  );
};

export default LeftFloatingBar;
