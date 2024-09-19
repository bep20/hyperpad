import React, { useState, useContext } from "react";
import {
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMint,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  findProgramAddressSync,
} from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { TokenCreationForm } from "../components/TokenCreationForm";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import { WebIrys } from "@irys/sdk";
import { TokenCreationInfo } from "../components/TokenCreationInfo";
import launchpadStyle from "../style/launchpad.module.less";
import message from "antd/es/message";
import { AppContext, NETWORKS } from "../../../context/AppStore";
import { IRYS_DEVNET, IRYS_MAINNET } from "../../../constants/urls";
import { TokenSuccess } from "../components/TokenSuccess";

const TOKEN_DEFAULT_STATE = {
  name: "",
  ticker: "",
  decimals: "",
  supply: "",
  description: "",
  imageURL: "",
  metadataURI: "",
};
const SOCIAL_MEDIA = {
  twitter: "",
  telegram: "",
  medium: "",
  website: "",
  discord: "",
};
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

const getWebIrys = async (rpcURL, irysNodeURL, provider) => {
  // Create a wallet object
  const wallet = { rpcUrl: rpcURL, name: "solana", provider: provider };
  // Use the wallet object
  const webIrys = new WebIrys({ url: irysNodeURL, token: "solana", wallet });
  await webIrys.ready();

  return webIrys;
};

const uploadFile = async (rpcURL, irysNodeURL, provider, fileToUpload) => {
  const webIrys = await getWebIrys(rpcURL, irysNodeURL, provider, fileToUpload);
  // Your file
  const tags = [{ name: "Content-Type", value: fileToUpload.type }];

  try {
    const receipt = await webIrys.uploadFile(fileToUpload, { tags });
    console.log(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    return receipt;
  } catch (e) {
    console.log("Error uploading file ", e);
  }
};

const uploadJSON = async (rpcURL, irysNodeURL, provider, jsonData) => {
  const webIrys = await getWebIrys(rpcURL, irysNodeURL, provider);

  const stringifyJSON = JSON.stringify(jsonData);
  console.log("stringifyJSON", stringifyJSON);
  const tags = [{ name: "Content-Type", value: "application/json" }];

  try {
    const receipt = await webIrys.upload(stringifyJSON, { tags });
    console.log(`File uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    return receipt;
  } catch (e) {
    console.log("Error uploading file ", e);
  }
};
export const getUploadedFileURL = (receipt) => {
  return `https://gateway.irys.xyz/${receipt.id}`;
};

const validateDecimals = (decimals) => {
  // validation for decimals

  const isInteger = /^\d+$/.test(decimals);
  if (isInteger) {
    const intValue = parseInt(inputValue);

    if (intValue >= 0 && intValue <= 18) {
      // Valid input
      return null;
    } else {
      // Invalid input range
      return "Enter a valid integer between 0 and 18";
    }
  } else {
    // Invalid input type
    return "Enter a valid non-negative integer";
  }
};
const validateTicker = () => {};

const getIrysNetwork = (solanaNetwork) => {
  switch (solanaNetwork) {
    case NETWORKS.MAINNET:
      return IRYS_MAINNET;
    case NETWORKS.TESTNET:
      return IRYS_DEVNET;
    case NETWORKS.DEVNET:
      return IRYS_DEVNET;
    default:
      return IRYS_MAINNET;
  }
};
const getCluster = (solanaNetwork) => {
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
export const CreateToken = () => {
  const [appStore, dispatchAppStore] = useContext(AppContext);

  const [tokenInfo, setTokenInfo] = useState(TOKEN_DEFAULT_STATE);

  const [socialMediaInfo, setSocialMediaInfo] = useState(SOCIAL_MEDIA);
  const [isSocialMediaEnabled, setIsSocialMediaEnabled] = useState(false);
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();
  console.log("connection and wallet", connection, wallet);

  const validateTokenData = () => {
    // validation for decimals
    const decimalsValidationResult = validateDecimals(tokenInfo.decimals);
    const tickerValidationResult = validateTicker(tokenInfo.ticker);
  };

  const createNewToken = async () => {
    const { publicKey } = wallet;
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const newAccount = Keypair.generate();
    const tokenATA = await getAssociatedTokenAddress(
      newAccount.publicKey,
      publicKey
    );
    const numerOfToken = parseInt(tokenInfo.supply, 10);
    const numberOfDecimals = parseInt(tokenInfo.decimals, 10);

    // connection.requestAirdrop();

    // const umi = createUmi(connection._rpcEndpoint);

    //Constants
    const mplProgramId = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        mplProgramId.toBytes(),
        newAccount.publicKey.toBytes(),
      ],
      mplProgramId
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: newAccount.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        newAccount.publicKey,
        numberOfDecimals,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
      ),
      createAssociatedTokenAccountInstruction(
        publicKey,
        tokenATA,
        publicKey,
        newAccount.publicKey
      ),
      createMintToInstruction(
        newAccount.publicKey,
        tokenATA,
        publicKey,
        numerOfToken * Math.pow(10, numberOfDecimals)
      ),
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadata,
          mint: newAccount.publicKey,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: tokenInfo.name,
              symbol: tokenInfo.ticker,
              uri: tokenInfo.metadataURI,
              sellerFeeBasisPoints: 0,
              collection: null,
              creators: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      )
    );

    let { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    transaction.feePayer = publicKey;
    // partially sign
    transaction.partialSign(newAccount);

    // sign by wallet
    let signedTransaction = await wallet.signTransaction(transaction);

    // sendAndConfirmTransaction;
    console.log("serarlised", signedTransaction.serialize());

    // Send the signed transaction to the network
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );
    console.log("Transaction submitted:", signature);

    return {
      tokenAddress: newAccount.publicKey,
      signature: signature,
      tokenName: tokenInfo.name,
    };
  };
  const handleTokenSubmission = async () => {
    if (!wallet.connected) {
      message.error("Please connect to wallet to proceed further.");
      return;
    }
    console.log("form data is", tokenInfo);
    const result = await createNewToken();
    console.log("signature is", result);

    const cluster = getCluster(appStore?.currentNetwork);
    message.success(
      <TokenSuccess
        transactionHash={result.signature}
        tokenAddress={result.tokenAddress}
        tokenName={result.tokenName}
        cluster={cluster}
      />,
      30
    );
    setTokenInfo(TOKEN_DEFAULT_STATE);
    setSocialMediaInfo(SOCIAL_MEDIA);
    setIsSocialMediaEnabled(false);
  };

  const uploadAndGenerateURL = async (file) => {
    if (!wallet.connected) {
      message.error("Please connect to wallet to proceed further.");
      return;
    }
    console.log("file want to upload", file);
    const IRYS_NETWORK = getIrysNetwork(appStore?.currentNetwork);
    const uploadedFile = await uploadFile(
      connection._rpcEndpoint,
      IRYS_NETWORK,
      wallet,
      file
    );
    const fileUrl = getUploadedFileURL(uploadedFile);
    setTokenInfo((prev) => {
      console.log("fillllllefilllllle", fileUrl);
      return {
        ...prev,
        imageURL: fileUrl,
      };
    });
  };

  const uploadMetadata = async () => {
    if (!wallet.connected) {
      message.error("Please connect to wallet to proceed further.");
      return;
    }
    console.log("file want to upload");
    const IRYS_NETWORK = getIrysNetwork(appStore?.currentNetwork);
    const uploadedFile = await uploadJSON(
      connection._rpcEndpoint,
      IRYS_NETWORK,
      wallet,
      {
        name: tokenInfo.name,
        image: tokenInfo.imageURL,
        symbol: tokenInfo.ticker,
        description: tokenInfo.description,
        socialMedia: {
          twitter: socialMediaInfo.twitter,
          telegram: socialMediaInfo.telegram,
          website: socialMediaInfo.website,
          medium: socialMediaInfo.medium,
          discord: socialMediaInfo.discord,
        },
      }
    );
    const fileUrl = getUploadedFileURL(uploadedFile);
    console.log("file url", fileUrl);
    setTokenInfo((prev) => {
      return {
        ...prev,
        metadataURI: fileUrl,
      };
    });
  };
  console.log("token Info", tokenInfo);

  return (
    <div className={launchpadStyle.createTokenContainer}>
      <TokenCreationForm
        tokenInfo={tokenInfo}
        socialMediaInfo={socialMediaInfo}
        setSocialMediaInfo={setSocialMediaInfo}
        isSocialMediaEnabled={isSocialMediaEnabled}
        setIsSocialMediaEnabled={setIsSocialMediaEnabled}
        setTokenInfo={setTokenInfo}
        uploadMetadata={uploadMetadata}
        handleTokenSubmission={handleTokenSubmission}
        uploadAndGenerateURL={uploadAndGenerateURL}
      />
      <TokenCreationInfo />
    </div>
  );
};
