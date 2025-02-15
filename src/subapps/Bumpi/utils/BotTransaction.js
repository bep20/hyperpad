import {
  createAssociatedTokenAccountInstruction,
  createInitializeAccount3Instruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

export class BotTransaction {
  static async getInstructions(mintAddress, wallet, solAmt, targetAddress) {
    const tokenPDA = await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      new PublicKey(targetAddress),
    );

    return [
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(targetAddress),
        lamports: solAmt * LAMPORTS_PER_SOL,
      }),
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenPDA,
        new PublicKey(targetAddress),
        new PublicKey(mintAddress),
      ),
    ];
  }

  static async createTxn({
    connection,
    wallet,
    solAmt,
    targetAddress,
    mintAddress,
  }) {
    const bhash = await connection.getLatestBlockhash('confirmed');
    const instructions = await BotTransaction.getInstructions(
      mintAddress,
      wallet,
      solAmt,
      targetAddress,
    );
    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: bhash.blockhash,
      instructions: instructions,
    }).compileToLegacyMessage();

    const txn = new VersionedTransaction(messageV0);
    return txn;
  }
}
