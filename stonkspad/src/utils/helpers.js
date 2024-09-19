import { Keypair } from '@solana/web3.js';
import { TokenUtils } from '../solana/TokenUtils';
import { NETWORKS } from '../context/AppStore';
import { BARE_METAL_BACKEND_URL } from '../envs/urls';
import axios from 'axios';

export const roundOff = (num, decimalPlaces = 2) => {
  if (num) {
    const factor = 10 ** decimalPlaces;
    return Math.round((parseFloat(num) + Number.EPSILON) * factor) / factor;
  }
  return 0;
};

export const scroll = id => {
  document.getElementById(id)?.scrollIntoView?.({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  });
};

// Function to check if a public key matches the specified criteria
function keypairMatchesCriteria(keypair, startsWith, endsWith, caseSensitive) {
  const publicKey = keypair.publicKey.toBase58();

  if (!caseSensitive) {
    const lowPubKey = publicKey.toLowerCase();
    if (startsWith && !lowPubKey.startsWith(startsWith?.toLowerCase()))
      return false;
    if (endsWith && !lowPubKey.endsWith(endsWith?.toLowerCase())) return false;
    return true;
  }
  const lowPubKey = publicKey;
  if (startsWith && !lowPubKey.startsWith(startsWith)) return false;
  if (endsWith && !lowPubKey.endsWith(endsWith)) return false;
  return true;
}

export const loadTokenDetails = ({ connection, address }) => {
  const tokenUtils = new TokenUtils(connection);
  return tokenUtils.getTokensFullDetails([address]);
};
export const loadTokenDetailsBE = ({ address, mode }) => {
  return new Promise((resolve, reject) => {
    axios({
      url: `${BARE_METAL_BACKEND_URL}/api/v1/mtb/token-details`,
      params: {
        mintAddress: address,
        mode,
      },
    })
      .then(result => {
        resolve(result?.data?.data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

// Function to search for keypairs matching the criteria
export const grind = (startsWith, endsWith, caseSensitive) => {
  const matchingKeypairs = [];
  for (let i = 0; matchingKeypairs?.length < 1; i++) {
    const keypair = new Keypair();
    if (keypairMatchesCriteria(keypair, startsWith, endsWith, caseSensitive)) {
      matchingKeypairs.push(keypair);
    }
  }
  return matchingKeypairs;
};

export const getTransactionLink = (item, currentNetwork) =>
  `https://solscan.io/tx/${item.transaction_hash}${
    currentNetwork == NETWORKS.DEVNET ? '?cluster=devnet' : ''
  }`;
