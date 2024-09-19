import { PublicKey, Transaction } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { NETWORKS } from "../../../context/AppStore";

export const getTokenDetails = (connection, tokenAddresss) => {
  return new Promise((resolve, reject) => {
    connection
      .getParsedAccountInfo(new PublicKey(tokenAddresss), "recent")
      .then((res) => {
        const result = {
          decimals: res?.value?.data?.parsed?.info?.decimals,
          freezeAuthority: res?.value?.data?.parsed?.info?.freezeAuthority,
          mintAuthority: res?.value?.data?.parsed?.info?.mintAuthority,
          supply: res?.value?.data?.parsed?.info?.supply,
        };
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const multisendToken = async (
  connection,
  wallet,
  multisenderAuthority,
  tokenAccount,
  distributionData
) => {
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
    return signature;
  } catch (err) {
    console.log("err", err);
    return null;
  }
};

export const validateSolAddress = (address) => {
  try {
    let pubkey = new PublicKey(address);
    let isSolana = PublicKey.isOnCurve(pubkey.toBuffer());
    return isSolana;
  } catch (error) {
    return false;
  }
};
export const getCluster = (solanaNetwork) => {
  switch (solanaNetwork) {
    case NETWORKS.MAINNET:
      return "mainnet";
    case NETWORKS.TESTNET:
      return "testnet";
    case NETWORKS.DEVNET:
      return "devnet";
    default:
      return "mainnet";
  }
};
