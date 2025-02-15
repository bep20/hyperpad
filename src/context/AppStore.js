import React, { useReducer, createContext } from 'react';
import storage from '../utils/storage';
import { RPC_ENUMS } from '../constants';
import { GET_RPC_URLS } from '../subapps/TokenScanner/utils/helpers';

export const AppContext = createContext();

export const AVAILABLE_NETWORKS = ['MAINNET', 'DEVNET'];
export const NETWORKS = {
  MAINNET: 'MAINNET',
  DEVNET: 'DEVNET',
};

export const NETWORKS_OPTIONS = [
  {
    label: 'MAINNET',
    value: 'MAINNET',
  },
  {
    label: 'DEVNET',
    value: 'DEVNET',
  },
];
const currentNetwork = storage.get('NETWORK_TYPE') || NETWORKS.MAINNET;

const getNetworkURL = networkType => {
  const RPC_URLS = GET_RPC_URLS(networkType);
  return storage.get('hyperpadRpc') || RPC_URLS[RPC_ENUMS.PRIMARY];
};

export const getCluster = solanaNetwork => {
  switch (solanaNetwork) {
    case NETWORKS.MAINNET:
      return 'mainnet';
    case NETWORKS.TESTNET:
      return 'testnet';
    case NETWORKS.DEVNET:
      return 'devnet';
    default:
      return 'mainnet';
  }
};

const INITIAL_STATE = {
  currentNetwork,
  currentNetworkURL: getNetworkURL(currentNetwork),
};

// It converts actions to the states.
const appReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_NETWORK': {
      const RPC_URLS = GET_RPC_URLS(payload);
      storage.set('NETWORK_TYPE', payload);

      storage.set('hyperpadRpc', RPC_URLS[RPC_ENUMS.PRIMARY]);

      return {
        ...state,
        currentNetwork: payload,
        currentNetworkURL: RPC_URLS[RPC_ENUMS.PRIMARY],
      };
    }
    case 'SET_NETWORK_URL':
      storage.set('hyperpadRpc', payload);
      return {
        ...state,
        currentNetworkURL: payload,
      };
    default:
      return state;
  }
};

export const AppContextProvider = ({ children }) => {
  const store = useReducer(appReducer, {
    ...INITIAL_STATE,
  });
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};
