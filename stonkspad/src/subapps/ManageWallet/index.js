import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WalletsGenetaror from './container/WalletsGenerator';
import HelmetLayout from '../../components/HelmetLayout';
import VanityAddress from './container/VanityAddress';

export const ManageWallet = () => (
  <>
    <HelmetLayout
      title='Solana Multisender: Send SPL, SPL22, SOL Tokens to Multiple Wallets. Batch transfer your asset on solana chain'
      description='Simplify token distribution with our Multisender tool. Send SPL, SPL22, and SOL tokens to multiple holders seamlessly. Our tool Reduces transfer costs by utilizing batch transactions.'
      keywords='Solana Multisender, Multisender tool, token distribution, batch transactions, token transfer efficiency, SPL token multisending, SPL22 token multisending, SOL token multisending, Solana blockchain tools, token distribution platform"'
    />
    <Routes>
      <Route path='wallets-generator' element={<WalletsGenetaror />} />
      <Route path='vanity-address-generator' element={<VanityAddress />} />
    </Routes>
  </>
);
