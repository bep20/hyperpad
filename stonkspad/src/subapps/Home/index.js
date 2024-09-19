import React from 'react';
import { Homepage } from './container/Homepage';
import HelmetLayout from '../../components/HelmetLayout';

export const Home = () => (
  <>
    <HelmetLayout
      title='The Ultimate Tool Suite on Solana Network'
      description='Elevate your Solana endeavors with our cutting-edge tool suite, your
      go-to solution for seamless, efficient project management!!'
      keywords='HyperPad, HYPERSOLANA, Token minting on solana, create token on solana, SPL Tokens, Token burn, token mint, token freeze,  Solana, SOL, Crypto, DEFI, defi, HyperPad, cryptocurrency, token, coin, digital, SOLANA'
    />
    <Homepage />
  </>
);
