// SubApp1/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CreateToken } from './container/CreateToken';
import { MyTokens } from './container/MyTokens';
import { TokenDetails } from './container/TokenDetails';
import { CreateToken22 } from './container/CreateToken22';
import HelmetLayout from '../../components/HelmetLayout';

import Mint from './container/Mint';
import Freezewallet from './container/Freezewallet';

export const LaunchPad = props => {
  // return <div>Coming Soon...</div>;
  return (
    <>
      <HelmetLayout
        title='Launcher'
        description='Launch your tokens on solana blockchain with ease.'
        keywords=''
      />

      <Routes>
        {/* <Route path="createlaunchpad" element={<CreateLaunchpad />} /> */}
        {/* <Route path="createfairlaunch" element={<CreateFairLaunch />} /> */}
        <Route path='create-spl-token' element={<CreateToken />} />
        <Route path='create-spl-token-2022' element={<CreateToken22 />} />
        <Route path='update-token' element={<TokenDetails />} />
        <Route path='manage-token' element={<MyTokens />} />
        <Route path='mint' element={<Mint tabType='mint' />} />
        <Route
          path='mint-authority'
          element={<Mint tabType='mint-authority' />}
        />

        <Route
          path='freeze-authority'
          element={<Mint tabType='freeze-authority' />}
        />
        <Route
          path='update-metadata'
          element={<Mint tabType='update-metadata' />}
        />

        <Route
          path='tax-authority'
          element={<Mint tabType='tax-authority' />}
        />
        <Route
          path='tax-withdraw-authority'
          element={<Mint tabType='tax-withdraw-authority' />}
        />

        <Route path='solana-wallet-freeze' element={<Freezewallet />} />

        {/* <Route path="launchpadlist" element={<LaunchPadList />} /> */}
      </Routes>
    </>
  );
};
