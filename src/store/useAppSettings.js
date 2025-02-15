import { create } from 'zustand';

import { Numberish } from '@/types/constants';

// it is some global uiStates

export const ExplorerName = {
  EXPLORER: 'explorer',
  SOLSCAN: 'solscan',
  SOLANAFM: 'solanafm',
};

export const ExplorerUrl = {
  EXPLORER: 'https://explorer.solana.com/',
  SOLSCAN: 'https://solscan.io/',
  SOLANAFM: 'https://solana.fm/',
};

export const defaultAppSettings = {
  themeMode: 'light',

  /** detect device */
  isMobile: false,
  isTablet: false,
  isPc: true,

  /** (ui panel controller) ui dialog open flag */
  isWalletSelectorShown: false,

  // default explorer's name and URL
  explorerName: '',
  explorerUrl: '',
};
const useAppSettings = create(() => ({
  ...defaultAppSettings,
}));

export default useAppSettings;
