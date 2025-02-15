import React from 'react';
import { DexScreenerIcon } from '../../../icons/socials/dexscreener';
import { SolscanIcon } from '../../../icons/socials/solscan';
import { useParams } from 'react-router-dom';

const HyperLinks = () => {
  const hyperLinks = [{ icon: SolscanIcon }, { icon: DexScreenerIcon }];
  const { mint_address } = useParams();

  return hyperLinks.map(link => (
    <div
      onClick={() => setShow(true)}
      className='cursor-pointer shadow-[-4px_4px_12px_0px_rgba(0,0,0,0.08)] w-[38px] rounded-[4px] flex items-center justify-center bg-white p-[10px]'>
      <a
        target='_blank'
        href={`https://solscan.io/token/${mint_address}`}
        rel='noreferrer'>
        <link.icon />
      </a>
    </div>
  ));
};

export default HyperLinks;
