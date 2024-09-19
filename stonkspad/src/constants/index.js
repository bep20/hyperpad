import {
  JITO_TIP_1X,
  JITO_TIP_5X,
  JITO_TIP_10X,
  TX_AMT_H,
  TX_AMT_L,
  TX_AMT_M,
} from '../envs/vars';

export const PRIORITY_FEE_ENUM = {
  DEFAULT: 1,
  HIGH_SPEED: 2,
  EXTREME_SPEED: 3,
};
export const PRIORITY_FEE_LABELS = {
  [PRIORITY_FEE_ENUM.DEFAULT]: 'Default',
  [PRIORITY_FEE_ENUM.HIGH_SPEED]: 'High',
  [PRIORITY_FEE_ENUM.EXTREME_SPEED]: 'Ultra',
};

export const PRIORITY_FEE = {
  [PRIORITY_FEE_ENUM.DEFAULT]: JITO_TIP_1X,
  [PRIORITY_FEE_ENUM.HIGH_SPEED]: JITO_TIP_5X,
  [PRIORITY_FEE_ENUM.EXTREME_SPEED]: JITO_TIP_10X,
};
export const PRIORITY_FEE_SPEED = {
  [PRIORITY_FEE_ENUM.DEFAULT]: '1x',
  [PRIORITY_FEE_ENUM.HIGH_SPEED]: '5x',
  [PRIORITY_FEE_ENUM.EXTREME_SPEED]: '10x',
};

export const PRIORITY_FEE_TABS = [
  {
    label: PRIORITY_FEE_LABELS[PRIORITY_FEE_ENUM.DEFAULT],
    value: PRIORITY_FEE_ENUM.DEFAULT,
    fee: PRIORITY_FEE[PRIORITY_FEE_ENUM.DEFAULT],
    color: '#ff1300',
  },
  {
    label: PRIORITY_FEE_LABELS[PRIORITY_FEE_ENUM.HIGH_SPEED],
    value: PRIORITY_FEE_ENUM.HIGH_SPEED,
    fee: PRIORITY_FEE[PRIORITY_FEE_ENUM.HIGH_SPEED],
    color: '#ffbc00',
  },
  {
    label: PRIORITY_FEE_LABELS[PRIORITY_FEE_ENUM.EXTREME_SPEED],
    value: PRIORITY_FEE_ENUM.EXTREME_SPEED,
    fee: PRIORITY_FEE[PRIORITY_FEE_ENUM.EXTREME_SPEED],
    color: '#23c333',
  },
];

export const TX_AMOUNT_TABS = [
  {
    label: TX_AMT_L,
    value: TX_AMT_L,
  },
  {
    label: TX_AMT_M,
    value: TX_AMT_M,
  },
  {
    label: TX_AMT_H,
    value: TX_AMT_H,
  },
];

export const snapFilterOptions = tokenHoldersCount => [
  { label: 'All', value: tokenHoldersCount },
  { label: 'Top 100', value: '100' },
  { label: 'Top 500', value: '500' },
  { label: 'Top 1000', value: '1000' },
  { label: 'Top 2000', value: '2000' },
  { label: 'Custom', value: 'custom' },
];
export const WORKERS_TO_GEN_KEYPAIR = navigator.hardwareConcurrency || 4;

export const RPC_ENUMS = {
  PRIMARY: 1,
  SECONDARY: 2,
  CUSTOM: 3,
};

export const RPC_LABELS = {
  [RPC_ENUMS.PRIMARY]: 'Hyperpad Primary',
  [RPC_ENUMS.SECONDARY]: 'Hyperpad Secondary',
  [RPC_ENUMS.CUSTOM]: 'Custom',
};

export const MAINNET_CUSTOM_RPC_KEY = 'mainnet_hyperpad_custom_rpc';
export const DEVNET_CUSTOM_RPC_KEY = 'devnet_hyperpad_custom_rpc';

export const BOT_STATUS = {
  INSYNC: 'INSYNC',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  PAUSE: 'PAUSE',
  'WALLE-LIMIT-REACHED': 'WALLET-LIMIT-REACHED',
};

export const BOT_STATUS_COLORS = {
  [BOT_STATUS.INSYNC]: '#28A745',
  [BOT_STATUS.COMPLETED]: '#20C997',
  [BOT_STATUS.FAILURE]: '#DC3545',
  [BOT_STATUS.PENDING]: '#bab007',
  [BOT_STATUS.PAUSE]: '#ffff80',
  [BOT_STATUS['WALLE-LIMIT-REACHED']]: '#ff0000',
};
