import React, { useEffect } from "react";
import Card from "antd/es/card";
import launchpadStyle from "../style/launchpad.module.less";
import Button from "antd/es/button";
import Input from "antd/es/input";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createMintToCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import message from "antd/es/message";

const MINT_STATUS = {
  canMint: false,
  mintMessage: null,
};

export const TokenMint = ({ tokenData }) => {
  const [userCurrentBalance, setUserCurrentBalance] = React.useState(null);
  const [mintStatus, setMintStatus] = React.useState(false);
  const [amoutToMint, setAmoutToMint] = React.useState(null);
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();

  const handleChangeAmount = (event) => {
    setAmoutToMint(event.target.value);
  };
  const handleWalletConnect = () => {
    console.log("handeling wallet connection !!", wallet);
    wallet.connect();
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

  const handleMintToken = async () => {
    if (!amoutToMint) {
      message.error("Please enter non zero amout to token to mint", 5);
      return;
    }
    console.log("mintinghandleMintToken", amoutToMint);

    const amountTokenToMint =
      parseInt(amoutToMint) * 10 ** parseInt(tokenData?.decimals);

    const ATAOfReciever = await getAssociatedTokenAddress(
      new PublicKey(tokenData?.mint),
      wallet.publicKey
    );

    const transaction = new Transaction().add(
      createMintToCheckedInstruction(
        new PublicKey(tokenData?.mint),
        ATAOfReciever,
        new PublicKey(tokenData?.mintAuthority),
        amountTokenToMint,
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
      `successfully minted ${amoutToMint} ${tokenData?.symbol}`,
      5
    );
    setAmoutToMint(null);
    setTimeout(() => {
      updateCurrentWalletAmount();
    }, 3 * 1000);
  };

  useEffect(() => {
    // console.log("tokenmint", to)
    if (wallet?.connected && connection?._rpcEndpoint && tokenData?.mint) {
      // fetch account balance and set userCurrentBalance
      updateCurrentWalletAmount();

      if (tokenData?.mintAuthority) {
        if (tokenData?.mintAuthority != wallet.publicKey.toBase58()) {
          setMintStatus({
            canMint: false,
            mintMessage: `You dont have permission to mint ${tokenData?.symbol}`,
          });
        } else {
          setMintStatus({
            canMint: true,
            mintMessage: null,
          });
        }
      } else {
        setMintStatus({
          canMint: false,
          mintMessage: `${tokenData?.symbol} is not Mintable`,
        });
      }
    } else if (connection?._rpcEndpoint && tokenData?.mint) {
      if (tokenData?.mintAuthority) {
        setMintStatus({
          canMint: false,
          mintMessage: `${tokenData?.symbol} is mintable, Please connect to wallet to check if you can mint.`,
        });
      } else {
        setMintStatus({
          canMint: false,
          mintMessage: `${tokenData?.symbol} is not mintable`,
        });
      }
    }
  }, [wallet?.connected, connection, tokenData?.mint]);

  return (
    <div className={launchpadStyle.tokenMintContent}>
      <Card className={launchpadStyle.burnCard}>
        {mintStatus?.canMint ? (
          <>
            <div className={launchpadStyle.inputBurnTokenContainer}>
              <div className={launchpadStyle.youBurn}>You Mint</div>
              <div className={launchpadStyle.tokenInputAmoutContainer}>
                <Input
                  className={launchpadStyle.inputBurn}
                  placeholder="0"
                  onChange={handleChangeAmount}
                  value={amoutToMint}
                />
                <p className={launchpadStyle.tokenTickerInfo}>
                  <img src={tokenData?.uriData?.image || ""} />
                  <span>{tokenData?.symbol || ""}</span>
                </p>
              </div>
              <div className={launchpadStyle.walletBalance}>
                Wallet Balance: &nbsp;
                {userCurrentBalance
                  ? `${userCurrentBalance} ${tokenData?.symbol}`
                  : ""}
              </div>
            </div>
            <div>
              <Button
                className={`${launchpadStyle.primaryButton} ${launchpadStyle.burnTokenBtn}`}
                onClick={
                  wallet?.connected ? handleMintToken : handleWalletConnect
                }
              >
                {wallet?.connected
                  ? `Mint ${tokenData?.symbol}`
                  : `Connect Wallet`}
              </Button>
            </div>
          </>
        ) : (
          <h2>{mintStatus?.mintMessage}</h2>
        )}
      </Card>
    </div>
  );
};
