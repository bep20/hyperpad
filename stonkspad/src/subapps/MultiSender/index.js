import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';

import { MultiSend } from './container/MultiSend';
import { MultiManage } from './container/MultiManage';
import { MultiSendDetails } from './container/MultiSendDetails';
import HelmetLayout from '../../components/HelmetLayout';


export const MultiSender = () => (
  <>
    <HelmetLayout
      title='Solana Multisender: Send SPL, SPL22, SOL Tokens to Multiple Wallets. Batch transfer your asset on solana chain'
      description='Simplify token distribution with our Multisender tool. Send SPL, SPL22, and SOL tokens to multiple holders seamlessly. Our tool Reduces transfer costs by utilizing batch transactions.'
      keywords='Solana Multisender, Multisender tool, token distribution, batch transactions, token transfer efficiency, SPL token multisending, SPL22 token multisending, SOL token multisending, Solana blockchain tools, token distribution platform"'
    />
    <Routes>
      <Route path='distribute' element={<MultiSend />} />
      <Route path='manage' element={<MultiManage />} />
      <Route path='manage/:id' element={<MultiSendDetails />} />
    
    </Routes>
  </>
);
