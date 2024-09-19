import { useState, useCallback } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

// Import the SplToken library if not already done

function useSolanaMultisender() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const multisendToken = useCallback(
    async (
      connection,
      wallet,
      multisenderAuthority,
      tokenAccount,
      distributionData
    ) => {
      setLoading(true);
      setError(null);
      console.log(
        "tokenaccount",
        tokenAccount,
        multisenderAuthority,
        distributionData
      );

      try {
        const instructions = [];

        let sourceATA = await splToken.getAssociatedTokenAddress(
          new PublicKey(tokenAccount),
          wallet.publicKey
        );

        for (let i = 0; i < distributionData.length; i++) {
          const targetATA = await splToken.getAssociatedTokenAddress(
            new PublicKey(tokenAccount),
            new PublicKey(distributionData[i][0])
          );

          const associatedTokenAccountInfo = await connection.getAccountInfo(
            targetATA
          );
          console.log("associatedTokenAccountInfo", associatedTokenAccountInfo);
          console.log(
            "eachentry",
            sourceATA.toBase58(),
            targetATA.toBase58(),
            distributionData[i]
          );

          if (associatedTokenAccountInfo == null) {
            //     publicKey,
            // tokenATA,
            // publicKey,
            // newAccount.publicKey
            const createAssociatedTokenAccountIx =
              splToken.createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                targetATA,
                new PublicKey(distributionData[i][0]),
                new PublicKey(tokenAccount)
              );

            // Transfer tokens to the newly created associated token account
            const transferInstruction = splToken.createTransferInstruction(
              sourceATA,
              targetATA,
              wallet.publicKey,
              distributionData[i][1]
            );
            instructions.push(createAssociatedTokenAccountIx);
            instructions.push(transferInstruction);
          } else {
            // Create a token transfer instruction
            const transferInstruction = splToken.createTransferInstruction(
              sourceATA,
              targetATA,
              wallet.publicKey,
              distributionData[i][1]
            );

            // Add the transfer instruction to the instructions array
            instructions.push(transferInstruction);
          }
        }

        // Create and sign the transaction
        const transaction = new Transaction().add(...instructions);
        console.log("transactttion", transaction);
        transaction.feePayer = multisenderAuthority;

        let { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("finalized");
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;

        // sign by wallet
        let signedTransaction = await wallet.signTransaction(transaction);

        // sendAndConfirmTransaction;
        console.log("serarlised", signedTransaction.serialize());

        // Send the signed transaction to the network
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        );
        console.log("Transaction submitted:", signature);
        setSuccess(true);
      } catch (err) {
        console.log("err", err);
        setError(err);
      } finally {
        console.log("finally");
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    success,
    multisendToken,
  };
}

export default useSolanaMultisender;
