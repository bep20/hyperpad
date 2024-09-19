import React from "react";
import Card from "antd/es/card";
import Button from "antd/es/button";
import Input from "antd/es/input";
import launchpadStyle from "../style/launchpad.module.less";
import {
  AuthorityType,
  createSetAuthorityInstruction,
} from "@solana/spl-token";
import { CopyString } from "./CopyString";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import message from "antd/es/message";
import { PublicKey, Transaction } from "@solana/web3.js";
import Select from "antd/es/select";
import { changeTypeOption } from "../constants/data";
import { changeTypeEnum } from "../constants/data";

export const TokenFreezeAuthority = ({ tokenData }) => {
  const containerRef = React.useRef(null);
  const [changeType, setChangeType] = React.useState(changeTypeEnum.REVOKE);
  const [targetFreezeAuthority, setTargetFreezeAuthority] =
    React.useState(null);
  const [freezeAuthStatus, setFreezeAuthStatus] = React.useState({
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
      tokenData?.freezeAuthority
    ) {
      if (tokenData?.freezeAuthority) {
        if (tokenData?.freezeAuthority != wallet.publicKey.toBase58()) {
          setFreezeAuthStatus({
            canChange: false,
            message: `You are not authorized to change the Freeze Authority for token.`,
          });
        } else {
          setFreezeAuthStatus({
            canChange: true,
            message: null,
          });
        }
      } else {
        console.log("nofreexeAuth");
        setFreezeAuthStatus({
          canChange: false,
          message: `No individuals currently possess Freeze Authority for this token.`,
        });
      }
    } else if (connection?._rpcEndpoint) {
      if (tokenData?.freezeAuthority) {
        setFreezeAuthStatus({
          canChange: false,
          message: `Connect your wallet to verify freeze authority `,
        });
      } else {
        setFreezeAuthStatus({
          canChange: false,
          message: `No individuals currently possess Freeze Authority for this token.`,
        });
      }
    }
  }, [wallet?.connected, connection, tokenData?.freezeAuthority]);

  React.useEffect(() => {
    const handleResize = () => {
      if (tokenData?.freezeAuthority) {
        const text = tokenData?.freezeAuthority;
        const startChars = 14;
        const endChars = 14;

        const truncated =
          text.substring(0, startChars) +
          "......" +
          text.substring(text.length - endChars);

        setTruncatedText(truncated);
      } else {
        setTruncatedText(null);
      }
    };

    handleResize(); // Initial calculation
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [tokenData?.freezeAuthority]);

  const handleCopyClick = (valueToCopy) => {
    navigator.clipboard.writeText(valueToCopy);
    message.success("Text copied to clipboard");
  };
  const handleTransferFreezeAuthority = async () => {
    console.log("handeling transfer freeze");
    if (!targetFreezeAuthority && changeType === changeTypeEnum.TRANSFER) {
      message.error("Enter a valid transfer address");
      return;
    }
    const newTargetFreezeAuthority =
      changeType === changeTypeEnum.TRANSFER
        ? new PublicKey(targetFreezeAuthority)
        : null;

    const transaction = new Transaction().add(
      createSetAuthorityInstruction(
        new PublicKey(tokenData?.mint),
        new PublicKey(tokenData?.freezeAuthority),
        AuthorityType.FreezeAccount,
        newTargetFreezeAuthority
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
    if (!newTargetFreezeAuthority) {
      message.success(
        `successfully transferred to ${targetFreezeAuthority.toBase58()}`,
        5
      );
    } else {
      message.success(`successfully Revoked`, 5);
    }
    setTargetFreezeAuthority(null);
    // setTimeout(() => {
    //   updateCurrentWalletAmount();
    // }, 3 * 1000);
  };

  return (
    <div className={launchpadStyle.tokenFreezeAuthorityContent}>
      <Card className={launchpadStyle.burnCard}>
        {freezeAuthStatus.canChange ? (
          <>
            <div className={launchpadStyle.burnCardInput}>
              <div className={launchpadStyle.inputBurnTokenContainer}>
                <div className={launchpadStyle.youBurn}>
                  Current Freeze Authority
                </div>
                <div className={launchpadStyle.tokenInputAmoutContainer}>
                  <p
                    className={`${launchpadStyle.inputBurn} ${launchpadStyle.disabledMock}`}
                    placeholder="0"
                    readOnly
                    onClick={(event) => {
                      console.log("event in disabled", event);
                    }}
                    value={tokenData?.freezeAuthority}
                    ref={containerRef}
                  >
                    <CopyString
                      data={truncatedText}
                      dataToCopy={tokenData?.freezeAuthority}
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
                <>
                  <div className={launchpadStyle.inputBurnTokenContainer}>
                    <div className={launchpadStyle.youBurn}>
                      New Freeze Authority
                    </div>
                    <div className={launchpadStyle.tokenInputAmoutContainer}>
                      <Input
                        className={launchpadStyle.inputBurn}
                        placeholder="0"
                        value={targetFreezeAuthority}
                        onChange={(event) =>
                          setTargetFreezeAuthority(event.target.value)
                        }
                      />
                    </div>
                    <div className={launchpadStyle.walletBalance}></div>
                  </div>
                </>
              ) : null}
            </div>
            <div>
              <Button
                onClick={handleTransferFreezeAuthority}
                className={`${launchpadStyle.primaryButton} ${launchpadStyle.burnTokenBtn}`}
              >
                {changeType === changeTypeEnum.TRANSFER
                  ? "Transfer Freeze Authority"
                  : "Revoke Freeze Authority"}{" "}
              </Button>
            </div>
          </>
        ) : (
          <h2>{freezeAuthStatus?.message}</h2>
        )}
      </Card>
    </div>
  );
};
