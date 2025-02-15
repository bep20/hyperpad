import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NETWORKS } from '../../../context/AppStore';

export const ASSET_TYPE_MAP = {
  1: 'SOL',
  2: 'SPL',
  3: 'SPL 2022',
};

export const getTransferAsset = (item, clip = true) => {
  if (!(item.asset_type && item.mint_address)) {
    return '';
  }
  if (item.asset_type === 1) {
    return 'SOL';
  }
  const clippedMintAddress = `${item.mint_address.slice(0, 4)}....${item.mint_address.slice(-4)}`;
  return clip ? clippedMintAddress : item.mint_address;
};
export const getTransferAssetAmount = item => {
  if (item.asset_type === 1) {
    return parseFloat(item.sol_amount / LAMPORTS_PER_SOL).toFixed(4) || '';
  }
  return parseFloat(item.token_amount / 10 ** item.decimals).toFixed(4) || '';
};
