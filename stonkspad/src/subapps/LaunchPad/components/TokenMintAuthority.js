import React, { useEffect } from "react";
import Card from "antd/es/card";
import Button from "antd/es/button";
import Input from "antd/es/input";
import { CopyOutlined } from "@ant-design/icons";
import launchpadStyle from "../style/launchpad.module.less";
import { CopyString } from "./CopyString";
import message from "antd/es/message";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  AuthorityType,
  createSetAuthorityInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Select from "antd/es/select";
import { changeTypeOption } from "../constants/data";
import { changeTypeEnum } from "../constants/data";

export const TokenMintAuthority = ({ tokenData }) => {
  const containerRef = React.useRef(null);
  const [changeType, setChangeType] = React.useState(changeTypeEnum.REVOKE);
  const [targetMintAuthority, setTargetMintAuthority] = React.useState(null);
  const [mintAuthStatus, setMintAuthStatus] = React.useState({
    canChange: false,
    message: null,
  });

  const [truncatedText, setTruncatedText] = React.useState(null);
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();

  React.useEffect(() => {
    if (
      wallet?.connected &&
      connection?._rpcEndpoint &&
      tokenData?.mintAuthority
    ) {
      if (tokenData?.mintAuthority) {
        if (tokenData?.mintAuthority != wallet.publicKey.toBase58()) {
          setMintAuthStatus({
            canChange: false,
            message: `You are not authorized to change the Mint Authority for token.`,
          });
        } else {
          setMintAuthStatus({
            canChange: true,
            message: null,
          });
        }
      } else {
        setMintAuthStatus({
          canChange: false,
          message: `No individuals currently possess Mint Authority for this token.`,
        });
      }
    } else if (connection?._rpcEndpoint && tokenData?.mintAuthority) {
      if (tokenData?.mintAuthority) {
        setMintAuthStatus({
          canChange: false,
          message: `Connect your wallet to verify mint authority `,
        });
      } else {
        setMintAuthStatus({
          canChange: false,
          message: `No individuals currently possess Mint Authority for this token.`,
        });
      }
    }
  }, [wallet?.connected, connection, tokenData?.mintAuthority]);

  useEffect(() => {
    const handleResize = () => {
      const text = tokenData?.mintAuthority;
      const startChars = 14;
      const endChars = 14;

      const truncated =
        text.substring(0, startChars) +
        "......" +
        text.substring(text.length - endChars);

      setTruncatedText(truncated);
    };

    handleResize(); // Initial calculation
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [tokenData?.mintAuthority]);

  const handleCopyClick = (valueToCopy) => {
    navigator.clipboard.writeText(valueToCopy);
    message.success("Text copied to clipboard");
  };
  const handleTransferMintAuthority = async () => {
    if (!targetMintAuthority) {
      message.error(
        "Please enter a valid mint authority that you want to transfer",
        5
      );
    }

    console.log("handeling transfer mint");

    const transaction = new Transaction().add(
      createSetAuthorityInstruction(
        new PublicKey(tokenData?.mint),
        new PublicKey(tokenData?.mintAuthority),
        AuthorityType.MintTokens,
        new PublicKey(targetMintAuthority)
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
    message.success(`successfully transferred to ${targetMintAuthority}`, 5);
    setTargetMintAuthority(null);
    // setTimeout(() => {
    //   updateCurrentWalletAmount();
    // }, 3 * 1000);
  };

  return (
    <div className={launchpadStyle.tokenMintAuthorityContent}>
      <Card className={launchpadStyle.burnCard}>
        {mintAuthStatus?.canChange ? (
          <>
            <div className={launchpadStyle.burnCardInput}>
              <div className={launchpadStyle.inputBurnTokenContainer}>
                <div className={launchpadStyle.youBurn}>
                  Current Mint Authority
                </div>
                <div className={launchpadStyle.tokenInputAmoutContainer}>
                  <p
                    className={`${launchpadStyle.inputBurn} ${launchpadStyle.disabledMock}`}
                    placeholder="0"
                    readOnly
                    onClick={(event) => {
                      console.log("event in disabled", event);
                    }}
                    value={tokenData?.mintAuthority}
                    ref={containerRef}
                  >
                    <CopyString
                      data={truncatedText}
                      dataToCopy={tokenData?.mintAuthority}
                    ></CopyString>
                  </p>
                </div>
                <div className={launchpadStyle.walletBalance}></div>
              </div>
              <div className={launchpadStyle.transferTo}>
                <Select
                  onChange={(val) => setChangeType(val)}
                  value={changeType}
                  size="large"
                  style={{ width: "100%" }}
                  // options={changeTypeOption}
                >
                  {changeTypeOption.map((currentOption) => (
                    <Select.Option
                      key={currentOption.value}
                      value={currentOption.value}
                    >
                      <div>
                        <p style={{ margin: "0px", fontSize: "1.2rem" }}>
                          {currentOption.label}
                        </p>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {changeType === changeTypeEnum.TRANSFER ? (
                <div className={launchpadStyle.inputBurnTokenContainer}>
                  <div className={launchpadStyle.youBurn}>
                    New Mint Authority
                  </div>
                  <div className={launchpadStyle.tokenInputAmoutContainer}>
                    <Input
                      className={launchpadStyle.inputBurn}
                      placeholder="0"
                      value={targetMintAuthority}
                      onChange={(event) =>
                        setTargetMintAuthority(event.target.value)
                      }
                    />
                  </div>
                  <div className={launchpadStyle.walletBalance}></div>
                </div>
              ) : null}
            </div>
            <div>
              <Button
                onClick={handleTransferMintAuthority}
                className={`${launchpadStyle.primaryButton} ${launchpadStyle.burnTokenBtn}`}
              >
                {changeType === changeTypeEnum.TRANSFER
                  ? "Transfer Mint Authority"
                  : "Revoke Mint Authority"}
              </Button>
            </div>
          </>
        ) : (
          <h2>{mintAuthStatus.message}</h2>
        )}
      </Card>
    </div>
  );
};
