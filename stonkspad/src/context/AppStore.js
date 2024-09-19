import React, { useReducer, createContext } from "react";
import storage from "../utils/storage";
import {
  SOLANA_DEVNET,
  SOLANA_MAINNET,
  SOLANA_TESTNET,
} from "../constants/urls";

export const AppContext = createContext();

export const AVAILABLE_NETWORKS = ["MAINNET", "TESTNET", "DEVNET"];
export const NETWORKS = {
  MAINNET: "MAINNET",
  TESTNET: "TESTNET",
  DEVNET: "DEVNET",
};
const currentNetwork = storage.get("NETWORK_TYPE");

const getNetworkURL = (currentNetwork) => {
  return currentNetwork === NETWORKS.MAINNET
    ? SOLANA_MAINNET
    : currentNetwork === NETWORKS.TESTNET
    ? SOLANA_TESTNET
    : currentNetwork === NETWORKS.DEVNET
    ? SOLANA_DEVNET
    : SOLANA_MAINNET;
};

const INITIAL_STATE = {
  currentNetwork: currentNetwork || NETWORKS.MAINNET,
  currentNetworkURL: getNetworkURL(currentNetwork),
};

// It converts actions to the states.
const appReducer = (state, action) => {
  const { type, payload } = action;
  console.log("acttttt", payload);
  switch (type) {
    case "SET_NETWORK":
      storage.set("NETWORK_TYPE", payload);
      return {
        ...state,
        currentNetwork: payload,
        currentNetworkURL: getNetworkURL(payload),
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
