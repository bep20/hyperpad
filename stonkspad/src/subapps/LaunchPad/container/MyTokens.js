import React, { useState, useEffect } from "react";
import { DisplayTokenCard } from "../components/DisplayTokenCard";
import { SearchTokensFilter } from "../components/SearchTokensFilter";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import launchpadStyle from "../style/launchpad.module.less";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { ConnectWalletCard } from "../components/ConnectWalletCard";
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
const mplProgramId = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// need to define structure of data

export const MyTokens = () => {
  const [currentFilter, setCurrentFilter] = useState({ name: "" });
  const [tokenDetailsMap, setTokenDetailsMap] = useState({});
  const [tokensList, setTokensList] = useState([
    {
      name: "token1",
      tokenTicker: "TKN1",
      totalSupply: 41,
      decimals: 8,
      mintable: true,
      description: "this is token description1",
      tokenAddress: "tokenAddress1",
      tokenImage: "tokenImage1",
    },
    {
      name: "token2",
      tokenTicker: "TKN2",
      totalSupply: 9000,
      decimals: 7,
      mintable: false,
      description: "this is token description2",
      tokenAddress: "tokenAddress2",
      tokenImage: "tokenImage2",
    },
    {
      name: "token3",
      tokenTicker: "TKN3",
      totalSupply: 1000,
      decimals: 9,
      mintable: true,
      description: "this is token description3",
      tokenAddress: "tokenAddress3",
      tokenImage: "tokenImage3",
    },
    {
      name: "token4",
      tokenTicker: "TKN4",
      totalSupply: 6900,
      decimals: 3,
      mintable: true,
      description: "this is token description4",
      tokenAddress: "tokenAddress4",
      tokenImage: "tokenImage4",
    },
    {
      name: "token5",
      tokenTicker: "TKN5",
      totalSupply: 8900,
      decimals: 6,
      mintable: false,
      description: "this is token description4",
      tokenAddress: "tokenAddress5",
      tokenImage: "tokenImage5",
    },
  ]);
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();
  useEffect(() => {
    if (wallet.connected && connection) {
      console.log("sendingrequest");
      //   getParsedTokenAccountsByOwner;
      connection
        .getParsedTokenAccountsByOwner(wallet.publicKey, {
          programId: TOKEN_PROGRAM_ID,
        })
        .then((response) => {
          // fetch tokens associated with current wallet
          let currentTokenList = [];
          response?.value?.reduce((acc, current) => {
            // add current mint to accumulate
            const currentTokenMintAddress =
              current?.account?.data?.parsed?.info?.mint;
            const currentTokenSupply =
              current?.account?.data?.parsed?.info?.tokenAmount?.uiAmountString;
            const currentTokenDecimals =
              current?.account?.data?.parsed?.info?.tokenAmount?.decimals;
            const currentTokenAddress = current?.pubkey;
            const currentTokenInfo = {
              mintAddress: currentTokenMintAddress,
              totalSupply: currentTokenSupply,
              decimals: currentTokenDecimals,
              tokenAddress: currentTokenAddress,
            };
            acc.push(currentTokenInfo);
            return acc;
          }, currentTokenList);
          //   extract mint address from response
          let mintAddressList = [];
          currentTokenList.reduce((acc, current) => {
            acc.push(new PublicKey(current.mintAddress));
            return acc;
          }, mintAddressList);
          //   extract token address from response
          let tokenAddressList = currentTokenList.map((item) => {
            return item.tokenAddress;
          });
          //   setting token address list in state
          setTokensList(tokenAddressList);
          //   build map (tokenAddress => tokenDetails)
          const currentTokenDetailsMap = {};
          for (let currTkn of currentTokenList) {
            currentTokenDetailsMap[currTkn.mintAddress] = {
              mintAddress: currTkn.mintAddress,
              totalSupply: currTkn.totalSupply,
              decimals: currTkn.decimals,
              tokenAddress: currTkn.tokenAddress.toBase58(),
            };
          }
          // set tokenDetails in state
          setTokenDetailsMap(currentTokenDetailsMap);

          //   get mint Accounts details from mintAddress
          connection
            .getMultipleParsedAccounts(mintAddressList, {
              commitment: "recent",
            })
            .then((response) => {
              console.log("mintresponse", response);

              const mintedResults = response?.value.map((item) => {
                return {
                  ...item?.data?.parsed?.info,
                };
              });
              setTokenDetailsMap((prev) => {
                for (let i = 0; i < mintAddressList.length; i++) {
                  prev[mintAddressList[i].toBase58()].mintData =
                    mintedResults[i];
                }
                return prev;
              });
              console.log("mintedResult", mintedResults);
            });

          // extract metadata Address from  mint address and metadata program id
          const metaDataList = [];
          currentTokenList.reduce((acc, current) => {
            const [metadata] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("metadata"),
                mplProgramId.toBytes(),
                new PublicKey(current.mintAddress).toBytes(),
              ],
              mplProgramId
            );
            acc.push(metadata);
            return acc;
          }, metaDataList);

          // getMetadata Account details from metadata Address
          connection
            .getMultipleParsedAccounts(metaDataList, { commitment: "recent" })
            .then((response) => {
              const metadataDetailsList = [];
              response?.value?.forEach((item) => {
                // const wholeDesize = Metadata.deserialize(item, 0);
                let currentMetaData = {};

                if (item?.data) {
                  const [metaa] = Metadata.deserialize(item.data, 0);
                  console.log("wholeDesize", metaa);

                  currentMetaData = {
                    mint: metaa?.mint.toBase58(),
                    updateAuthority: metaa?.updateAuthority.toBase58(),
                    creators: metaa?.data?.creators,
                    name: metaa?.data?.name.replace(/\u0000/g, ""),
                    sellerFeeBasisPoints: metaa?.data?.sellerFeeBasisPoints,
                    symbol: metaa?.data?.symbol.replace(/\u0000/g, ""),
                    uri: metaa?.data?.uri.replace(/\u0000/g, ""),
                  };
                }
                metadataDetailsList.push(currentMetaData);
              });
              setTokenDetailsMap((prev) => {
                for (let currentMeta of metadataDetailsList) {
                  if (currentMeta?.mint) {
                    prev[currentMeta.mint].metadata = {
                      ...currentMeta,
                    };
                  }
                }
                return {
                  ...prev,
                };
              });
              console.log("metadataResponse", response, metadataDetailsList);
            });

          console.log("responseis", response, mintAddressList, metaDataList);
        });
    }
    return () => {
      console.log("this is cleanup");
    };
  }, [wallet, connection]);

  console.log("tokendetailsmap", tokenDetailsMap);
  return (
    <div className={launchpadStyle.myTokensPageContainer}>
      {!wallet.connected ? (
        <ConnectWalletCard />
      ) : (
        <>
          <div className={launchpadStyle.tokenPageTitleConatiner}>
            <h2 className={launchpadStyle.tokenPageTitle}>
              Your Minted Tokens
            </h2>
          </div>
          <div className={launchpadStyle.tokenSearchContainer}>
            <SearchTokensFilter
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
            />
          </div>
          <div className={launchpadStyle.tokensConatiner}>
            {Object.keys(tokenDetailsMap).map((currentToken) => {
              return (
                <DisplayTokenCard
                  tokenDetails={tokenDetailsMap[currentToken]}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
