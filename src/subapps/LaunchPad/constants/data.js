import { AccountState } from '@solana/spl-token';

export const changeTypeOption = [
  { value: 'REVOKE', label: 'Revoke Authority' },
  { value: 'TRANSFER', label: 'Transfer Authority' },
];
export const changeTypeEnum = {
  REVOKE: 'REVOKE',
  TRANSFER: 'TRANSFER',
};
export const DEFAULT_SOCIAL_MEDIA = {
  twitter: '',
  telegram: '',
  medium: '',
  website: '',
  discord: '',
};
export const DEFAULT_REVOKE = {
  revokeUpdate: false,
  revokeMint: false,
  revokeFreeze: false,
};

export const DEFAULT_TOKEN_STATE = {
  name: '',
  ticker: '',
  decimals: '',
  supply: '',
  description: '',
  imageURL: '',
  metadataURI: '',
};

export const DEFAULT_STATE_OPTIONS = [
  {
    label: 'UNINITILISED',
    value: AccountState.Uninitialized,
  },
  {
    label: 'INITILISED',
    value: AccountState.Initialized,
  },
  {
    label: 'FROZEN',
    value: AccountState.Frozen,
  },
];

export const DEFAULT_EXTENSION_CONFIG = {
  transfer_tax: false,
  interest_bearing: false,
  default_state: false,
  permanent_deligate: false,
  non_transferable: false,
};

export const DEFAULT_EXTENSION_VALUES = {
  transfer_tax: {
    feePercent: null,
    maxFee: null,
    feeWithdrawAuthority: null,
    configAuthority: null,
  },
  interest_bearing: {
    rate: null,
  },
  default_state: {
    state: AccountState.Initialized,
  },
  permanent_deligate: {
    deligate: null,
  },
  non_transferable: {
    transferable: false,
  },
};

export const SUBMISSION_STATE_ENUM = {
  FILE_UPLOADING: 'FILE_UPLOADING',
  METADATA_UPLOADING: 'METADATA_UPLOADING',
  TOKEN_CREATING: 'TOKEN_CREATING',
  FORM_FILLING: 'FORM_FILLING',
};

export const DEFAULT_SUBMISSION_STATE = {
  FILE_UPLOADING: false,
  METADATA_UPLOADING: false,
  TOKEN_CREATING: false,
  FORM_FILLING: true,
};

export const WalletStatus = {
  FROZEN: 'frozen',
  INVALID: 'invalid',
  ACTIVE: 'active',
  NOTFROZEN: 'Not frozen',
};
