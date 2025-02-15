import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import Skeleton from 'antd/es/skeleton';
import { DisplayTokenCard } from '../components/DisplayTokenCard';
import { SearchTokensFilter } from '../components/SearchTokensFilter';
import launchpadStyle from '../style/launchpad.module.less';
import { ConnectWalletCard } from '../components/ConnectWalletCard';
import { TokenDetailsClient } from '../utils/tokendetails';
import HelmetLayout from '../../../components/HelmetLayout';

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
const mplProgramId = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

// need to define structure of data

export const MyTokens = () => {
  const [currentFilter, setCurrentFilter] = useState(null);
  const [tokensList, setTokensList] = useState([
    {
      name: 'token1',
      tokenTicker: 'TKN1',
      totalSupply: 41,
      decimals: 8,
      mintable: true,
      description: 'this is token description1',
      tokenAddress: 'tokenAddress1',
      tokenImage: 'tokenImage1',
    },
    {
      name: 'token2',
      tokenTicker: 'TKN2',
      totalSupply: 9000,
      decimals: 7,
      mintable: false,
      description: 'this is token description2',
      tokenAddress: 'tokenAddress2',
      tokenImage: 'tokenImage2',
    },
    {
      name: 'token3',
      tokenTicker: 'TKN3',
      totalSupply: 1000,
      decimals: 9,
      mintable: true,
      description: 'this is token description3',
      tokenAddress: 'tokenAddress3',
      tokenImage: 'tokenImage3',
    },
    {
      name: 'token4',
      tokenTicker: 'TKN4',
      totalSupply: 6900,
      decimals: 3,
      mintable: true,
      description: 'this is token description4',
      tokenAddress: 'tokenAddress4',
      tokenImage: 'tokenImage4',
    },
    {
      name: 'token5',
      tokenTicker: 'TKN5',
      totalSupply: 8900,
      decimals: 6,
      mintable: false,
      description: 'this is token description4',
      tokenAddress: 'tokenAddress5',
      tokenImage: 'tokenImage5',
    },
  ]);
  const [filteredList, setFilteredList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();

  const getTokensDetailsList = async () => {
    const tokenDetailsClient = new TokenDetailsClient(connection);
    const userTokens = await tokenDetailsClient.getUserTokensMintAddress(
      wallet.publicKey,
    );
    const userTokensDetail =
      await tokenDetailsClient.getTokensFullDetails(userTokens);
    return userTokensDetail;
  };

  useEffect(() => {
    let filteredTokens = tokensList;
    if (currentFilter && currentFilter?.trim() != '') {
      filteredTokens = tokensList.filter(
        item =>
          item?.metadata?.data?.symbol
            ?.toLowerCase()
            ?.includes(currentFilter?.toLowerCase()) ||
          item?.metadata?.data?.name
            ?.toLowerCase()
            ?.includes(currentFilter?.toLowerCase()),
      );
    }
    setFilteredList(filteredTokens);
  }, [currentFilter, tokensList]);

  useEffect(() => {
    if (wallet.connected && connection) {
      setIsFetching(true);
      getTokensDetailsList()
        .then(resList => {
          setTokensList(resList);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
    return () => {};
  }, [wallet, connection]);

  return (
    <>
      <HelmetLayout
        title='Solana Token Management: Easily Manage Created Tokens'
        description='Effortlessly manage your spl, spl22 tokens on Solana with our comprehensive token management. Revoke mint authority, update authority, change authority, and perform other essential token management tasks with ease. Simplify token management on the Solana blockchain today.'
        keywords='Solana token management, token authority revocation, token management platform, Solana blockchain tools, token management utilities, token authority change, Solana token utilities'
      />

      <div className={launchpadStyle.myTokensPageContainer}>
        {!wallet.connected ? (
          <ConnectWalletCard />
        ) : (
          <>
            <div  className={launchpadStyle.tokenPageTitleConatiner}>
              <h2 className={launchpadStyle.minFormTitle}>
                <span className={launchpadStyle.highlighText}>
                  Tokens:&nbsp;
                </span>
                SPL & SPL22 Tokens
              </h2>
              <div className={launchpadStyle.headerLine} />
            </div>
            <div className={launchpadStyle.tokenSearchContainer}>
              <SearchTokensFilter
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
              />
            </div>
            <div className={launchpadStyle.tokensConatiner}>
              {isFetching ? (
                new Array(12)
                  .fill(1)
                  .map(item => (
                    <Skeleton className={launchpadStyle.tokenItem} active />
                  ))
              ) : (
                <>
                  {filteredList.map(currentToken => (
                    <DisplayTokenCard tokenDetails={currentToken} />
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
