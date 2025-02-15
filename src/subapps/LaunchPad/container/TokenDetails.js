import React, { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useSearchParams } from 'react-router-dom';

import axios from 'axios';
import Input from 'antd/es/input';
import { HyperButton } from '../../../components/buttons/HyperButton';
import launchpadStyle from '../style/launchpad.module.less';
import { TokenBasicDetails } from '../components/TokenBasicDetails';
import { UpdateToken } from '../components/UpdateToken';
import { TokenDetailsClient } from '../utils/tokendetails';
import HelmetLayout from '../../../components/HelmetLayout';

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
  const [currInput, setCurrInput] = useState(null);
  const [tokenData, setTokenData] = React.useState(TOKEN_DETAILS);
  const [uriData, setURIData] = useState({});
  const { connection } = useConnection();

  const [queryParams, setQueryParams] = useSearchParams();
  const tokenAddress = queryParams.get('address');

  useEffect(() => {
    if (tokenData?.metadata?.data?.uri?.length) {
      axios({
        url: tokenData?.metadata?.data?.uri,
      })
        .then(res => {
          setURIData(res.data);
        })
        .catch(err => {
          console.log('catched error', err);
        });
    }
  }, [tokenData?.metadata?.data?.uri]);

  useEffect(() => {
    // on Mounting and wallet and connection change
    if (tokenAddress) {
      setCurrInput(tokenAddress);
    }

    if (connection?._rpcEndpoint && tokenAddress) {
      const tokenDetailsClient = new TokenDetailsClient(connection);
      tokenDetailsClient
        .getTokensFullDetails([tokenAddress])
        .then(([resss]) => {
          setTokenData(resss);
        });
    }
  }, [tokenAddress, connection]);

  return (
    <>
      <HelmetLayout
        title='Solana Token Management: Easily Manage Created Tokens'
        description='Effortlessly manage your created tokens on Solana with our comprehensive token management. Revoke mint authority, update authority, change authority, and perform other essential token management with ease.'
        keywords='Solana token management, token authority revocation, token management platform, Solana blockchain tools, token management utilities, token authority change, Solana token utilities'
      />

      <div className={launchpadStyle.tokenDetailsContainer}>
        <div className={launchpadStyle.tokenPageTitleConatiner}>
          <h2 className={launchpadStyle.minFormTitle}>
            <span className={launchpadStyle.highlighText}>Manage:&nbsp;</span>
            View & Update Token
          </h2>
          <div className={launchpadStyle.headerLine} />
        </div>

        <div className={launchpadStyle.mintAddress}>
          <Input
            className={launchpadStyle.mintAddressInput}
            addonBefore='Mint Address'
            placeholder='Enter token Mint address'
            value={currInput}
            onChange={event => setCurrInput(event.target.value)}
          />
          <HyperButton
            text='Load Token'
            onClick={() => {
              // validate Pubkey is valid one or not
              setQueryParams(prev => [['address', currInput]]);
            }}
          />
        </div>
        <TokenBasicDetails tokenData={tokenData} uriData={uriData} />
        <UpdateToken tokenData={tokenData} uriData={uriData} />
      </div>
    </>
  );
};
