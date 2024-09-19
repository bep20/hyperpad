import React from 'react';
import { AssetBurner } from './container/AssetBurner';
import HelmetLayout from '../../components/HelmetLayout';

export const Burner = () => (
  <>
    <HelmetLayout
      title='Solana Token Burner: Burn SPL & SPL22 Tokens Instantly'
      description='Easily burn SPL and SPL22 tokens with our Solana Token Burner tool. Reduce token supply with a single click and access transaction details instantly.'
      keywords='Solana token burner, Token burning tool, SPL token burning, SPL22 token burner, Solana token management, Token supply reduction, Solana blockchain tools, Token transaction details, Token supply management, Solana token utilities'
    />
    <AssetBurner />
  </>
);
