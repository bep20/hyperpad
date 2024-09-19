import {
  PublicKey,
  Transaction,
  SystemProgram,
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import { NETWORKS } from '../../../context/AppStore';
import {
  MULTI_SENDER_ADDRESS,
  MULTI_SENDER_FEE_COLLECTOR,
} from '../../../envs/vars';

const maxRetries = 10;
export const getBlockHash = async connection => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      let { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('finalized');

      if (!blockhash) {
        throw new Error('blockhash not found');
      } else {
        return {
          blockhash,
          lastValidBlockHeight,
        };
      }
    } catch (error) {
      console.error(`Error in transaction: ${error}`);
    }
    // If failed, increment retries
    retries++;
    console.log(`Retry attempt: ${retries}`);
  }
  throw new Error(`Blockhash failed after ${maxRetries} retries`);
};

export const getTokenDetails = (connection, tokenAddresss) => {
  return new Promise((resolve, reject) => {
    connection
      .getParsedAccountInfo(new PublicKey(tokenAddresss), 'recent')
      .then(res => {
        const result = {
          decimals: res?.value?.data?.parsed?.info?.decimals,
          freezeAuthority: res?.value?.data?.parsed?.info?.freezeAuthority,
          mintAuthority: res?.value?.data?.parsed?.info?.mintAuthority,
          supply: res?.value?.data?.parsed?.info?.supply,
        };
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
  });
};
export const buildMultiSendSolTransaction = async (
  connection,
  wallet,
  lamports,
  platformFee,
) => {
  const transaction = new Transaction();

  // add fee transaction

  // transaction.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }));
  // we are using jito in BE no need to set higer compute price
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 }),
  );

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(MULTI_SENDER_FEE_COLLECTOR),
      lamports: platformFee,
    }),
  );

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(MULTI_SENDER_ADDRESS),
      lamports,
    }),
  );
  let { blockhash, lastValidBlockHeight } = await getBlockHash(connection);
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = wallet.publicKey;
  return transaction;
};

export const buildMultiSendToken2022Transaction = async (
  connection,
  wallet,
  tokenAddress,
  tokenAmount,
  platformFee,
  tokenProgramId,
) => {
  const txIx = [];

  // transaction.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }));
  // we are using jito in BE no need to set higher compute price
  txIx.push(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 }));

  // add platform fee
  txIx.push(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(MULTI_SENDER_FEE_COLLECTOR),
      lamports: platformFee,
    }),
  );

  const sourceATA = await splToken.getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    wallet.publicKey,
    false,
    tokenProgramId,
  );

  txIx.push(
    splToken.createApproveInstruction(
      sourceATA,
      new PublicKey(MULTI_SENDER_ADDRESS),
      wallet.publicKey,
      tokenAmount,
      [],
      tokenProgramId,
    ),
  );

  const { blockhash } = await getBlockHash(connection);

  const messageV0 = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: txIx,
  }).compileToLegacyMessage();

  const transaction = new VersionedTransaction(messageV0);

  return transaction;
};

export const validateSolAddress = address => {
  try {
    const pubkey = new PublicKey(address);
    const isSolana = PublicKey.isOnCurve(pubkey.toBuffer());
    return isSolana;
  } catch (error) {
    return false;
  }
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
