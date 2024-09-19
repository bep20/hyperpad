import { PublicKey } from '@solana/web3.js';
import { unpack } from '@solana/spl-token-metadata';

export function isValidSolanaAddress(address) {
  try {
    // Attempt to create a PublicKey instance from the provided address
    const publicKey = new PublicKey(address);
    // If no error is thrown, the address is valid
    return true;
  } catch (error) {
    // If an error is thrown, the address is invalid
    console.log('err', error);
    return false;
  }
}
export function findValidUnpackIndex(tlvData) {
  for (let i = 0; i < tlvData.length; i++) {
    try {
      // Try to unpack starting from index 'i'
      const metadata = unpack(tlvData.slice(i));

      // If unpacking is successful, log the metadata and return the index
      console.log('Successful unpack at index:', i);
      console.log('Metadata:', JSON.stringify(metadata, null, 2));
      return i;
    } catch (error) {
      // If an error occurs, continue to the next index
      console.log('Unpack failed at index:', i, 'Error:', error.message);
    }
  }
  // If no successful unpacking, return an indication
  return -1;
}
