import React, { useEffect } from "react";
import { UpdateToken } from "../components/UpdateToken";
import { TokenBasicDetails } from "../components/TokenBasicDetails";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import axios from "axios";

const mplProgramId = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const TOKEN_DETAILS = {
  decimals: null,
  freezeAuthority: null,
  mintAuthority: null,
  supply: null,
  isInitialized: null,
  mintAccountOwner: null,
  updateAuthority: null,
  mint: null,
  creators: null,
  name: null,
  sellerFeeBasisPoints: null,
  symbol: null,
  uri: null,
  isMutable: null,
  uriData: null,
};

export const TokenDetails = () => {
  const [tokenData, setTokenData] = React.useState(TOKEN_DETAILS);
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();
  const { id: tokenAddress } = useParams();
  console.log("params are", tokenAddress);

  useEffect(() => {
    // on Mounting and wallet and connection change
    if (connection?._rpcEndpoint && tokenAddress) {
      connection
        .getParsedAccountInfo(new PublicKey(tokenAddress), {
          commitment: "recent",
        })
        .then((response) => {
          console.log("token mint account details", response);
          const newTokenData = {
            decimals: response?.value?.data?.parsed?.info?.decimals,
            freezeAuthority:
              response?.value?.data?.parsed?.info?.freezeAuthority,
            mintAuthority: response?.value?.data?.parsed?.info?.mintAuthority,
            supply: response?.value?.data?.parsed?.info?.supply,
            isInitialized: response?.value?.data?.parsed?.info?.isInitialized,
            mintAccountOwner: response?.value?.owner?.toBase58(),
          };
          setTokenData((prev) => {
            return {
              ...prev,
              ...newTokenData,
            };
          });

          // getting metadata account info

          const [metadata] = PublicKey.findProgramAddressSync(
            [
              Buffer.from("metadata"),
              mplProgramId.toBytes(),
              new PublicKey(tokenAddress).toBytes(),
            ],
            mplProgramId
          );

          connection
            .getParsedAccountInfo(metadata, { commitment: "recent" })
            .then((res) => {
              const [metaa] = Metadata.deserialize(res?.value?.data, 0);

              console.log("metaaaddd", metaa);
              const currentMetaData = {
                metadataAccount: metadata?.toBase58(),
                mint: metaa?.mint?.toBase58(),
                updateAuthority: metaa?.updateAuthority.toBase58(),
                creators: metaa?.data?.creators,
                name: metaa?.data?.name.replace(/\u0000/g, ""),
                sellerFeeBasisPoints: metaa?.data?.sellerFeeBasisPoints,
                symbol: metaa?.data?.symbol.replace(/\u0000/g, ""),
                uri: metaa?.data?.uri.replace(/\u0000/g, ""),
                isMutable: metaa?.isMutable,
              };
              setTokenData((prev) => {
                return {
                  ...prev,
                  ...currentMetaData,
                };
              });
              console.log("metadataacouuntdetails", currentMetaData);

              axios({
                method: "GET",
                url: currentMetaData?.uri,
              })
                .then((res) => {
                  const uriData = {
                    name: res?.data?.name,
                    image: res?.data?.image,
                    symbol: res?.data?.symbol,
                    description: res?.data?.description,
                    socialMedia: {
                      twitter: res?.data?.socialMedia?.twitter,
                      telegram: res?.data?.socialMedia?.telegram,
                      website: res?.data?.socialMedia?.website,
                      medium: res?.data?.socialMedia?.medium,
                      discord: res?.data?.socialMedia?.discord,
                    },
                  };
                  setTokenData((prev) => {
                    return {
                      ...prev,
                      uriData: uriData,
                    };
                  });
                })
                .catch((err) => {
                  console.log("catched error", err);
                });
            });
        });
    }
  }, [tokenAddress, connection]);

  console.log("tokenData", tokenData);
  return (
    <div>
      <TokenBasicDetails tokenData={tokenData} />
      <UpdateToken tokenData={tokenData} />
    </div>
  );
};
