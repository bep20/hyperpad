import React, { useEffect } from "react";
import Card from "antd/es/card";
import launchpadStyle from "../style/launchpad.module.less";
import Button from "antd/es/button";
import Input from "antd/es/input";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import message from "antd/es/message";
import {
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { PublicKey } from "@metaplex-foundation/js";
import { tokenAmount } from "@metaplex-foundation/umi";
import { Transaction } from "@solana/web3.js";

export const TokenBurn = ({ tokenData }) => {
  const [userCurrentBalance, setUserCurrentBalance] = React.useState(null);
  const [amoutToBurn, setAmountToBurn] = React.useState(null);
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();

  const handleChangeAmount = (event) => {
    setAmountToBurn(event.target.value);
  };
  const updateCurrentWalletAmount = () => {
    console.log("updating wallet amout");
    getAssociatedTokenAddress(
      new PublicKey(tokenData?.mint),
      wallet.publicKey
    ).then((result) => {
      console.log("result", result);

      connection.getTokenAccountBalance(result, "recent").then((response) => {
        console.log("user balance response", response);
        setUserCurrentBalance(response?.value?.uiAmountString);
      });
    });
  };

  const handleBurnToken = async () => {
    if (!(wallet.connected && connection._rpcEndpoint)) {
      message.error("Please connect to wallet to burn tokens");
      return;
    }
    if (!parseInt(amoutToBurn)) {
      message.error("Please enter some amount of token");
      return;
    }
    console.log("amounttttt", amoutToBurn);
    console.log("performing burn operation");
    const amoutOfTokenToBurn =
      parseInt(amoutToBurn) * 10 ** parseInt(tokenData?.decimals);
    // fetch user current token balance
    console.log("amoutOfTokenToBurn", amoutOfTokenToBurn, tokenData?.decimals);
    console.log(`Step 1 - Fetch Token Account`);
    const account = await getAssociatedTokenAddress(
      new PublicKey(tokenData?.mint),
      wallet.publicKey
    );
    console.log(`Associated Token Account Address: ${account.toString()}`);

    // create Burn Instruction and transaction
    const transaction = new Transaction().add(
      createBurnCheckedInstruction(
        account,
        new PublicKey(tokenData?.mint),
        wallet.publicKey,
        amoutOfTokenToBurn,
        parseInt(tokenData?.decimals)
      )
    );

    // get latest block hash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    console.log(`Latest Blockhash: ${blockhash}`);

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    transaction.feePayer = wallet.publicKey;

    // sign by wallet
    let signedTransaction = await wallet.signTransaction(transaction);

    // sendAndConfirmTransaction;
    console.log("serarlised_transaction", signedTransaction.serialize());
    // Send the signed transaction to the network
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );
    console.log("Transactionsubmitted:", signature);
    message.success(
      `successfully burned ${amoutToBurn} ${tokenData?.symbol}`,
      5
    );
    setAmountToBurn(null);
    setTimeout(() => {
      updateCurrentWalletAmount();
    }, 3 * 1000);
  };

  useEffect(() => {
    // console.log("tokenmint", to)
    if (wallet?.connected && connection?._rpcEndpoint && tokenData?.mint) {
      // fetch account balance and set userCurrentBalance
      updateCurrentWalletAmount();
    }
  }, [wallet?.connected, connection, tokenData?.mint]);

  const handleWalletConnect = () => {
    console.log("handeling wallet connection !!", wallet);
    wallet.connect();
  };

  return (
    <div className={launchpadStyle.tokenBurnContent}>
      <Card className={launchpadStyle.burnCard}>
        <div className={launchpadStyle.inputBurnTokenContainer}>
          <div className={launchpadStyle.youBurn}>You Burn</div>
          <div className={launchpadStyle.tokenInputAmoutContainer}>
            <Input
              className={launchpadStyle.inputBurn}
              placeholder="0"
              value={amoutToBurn}
              onChange={handleChangeAmount}
            />
            <p className={launchpadStyle.tokenTickerInfo}>
              <img src={tokenData?.uriData?.image || ""} />
              <span>{tokenData?.symbol || ""}</span>
            </p>
          </div>
          <div className={launchpadStyle.walletBalance}>
            Wallet Balance: &nbsp;{" "}
            {userCurrentBalance
              ? `${userCurrentBalance} ${tokenData?.symbol}`
              : ""}
          </div>
        </div>
        <div>
          <Button
            className={`${launchpadStyle.primaryButton} ${launchpadStyle.burnTokenBtn}`}
            onClick={wallet?.connected ? handleBurnToken : handleWalletConnect}
          >
            {wallet?.connected ? `Burn ${tokenData?.symbol}` : `Connect Wallet`}
          </Button>
        </div>
      </Card>
    </div>
  );
};
