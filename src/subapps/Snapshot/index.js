import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { TokenSnapShot } from './container/TokenSnapShot';
import HelmetLayout from '../../components/HelmetLayout';

import { SnapShotTokenHistory } from './container/SnapShotTokenHistory';

export const SnapShot = () => {
  return (
    <>
      <HelmetLayout
        title='Token Holder Snapshot: Instantly Capture SPL and SPL22 Holders'
        description='Quickly capture holders of SPL and SPL22 tokens with our Snapshot Tool. Easily filter holders based on token thresholds. Simplify your token analysis and governance processes effortlessly.'
        keywords='Token holder snapshot, SPL token snapshot, SPL22 token snapshot, token holder analysis, token governance, Solana blockchain tools, token management utilities'
      />
      <Routes>
        <Route path='/' element={<TokenSnapShot />} />
        <Route path='token-snapshot' element={<TokenSnapShot />} />
        <Route path='snap-history' element={<SnapShotTokenHistory />} />
      </Routes>
    </>
  );
};
