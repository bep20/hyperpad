import React, { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Input from 'antd/es/input';
import { HyperButton } from '../../../components/buttons/HyperButton';
import launchpadStyle from '../style/launchpad.module.less';
import { TokenBasicDetails } from '../components/TokenBasicDetails';
import { TokenDetailsClient } from '../utils/tokendetails';

const TokenDetailsTabs = ({
  tabDiscription,
  tokenData,
  setTokenData,
  setURIData,
  uriData,
  tabType,
}) => {
  const [currInput, setCurrInput] = useState(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);

  const { connection } = useConnection();
  const [queryParams, setQueryParams] = useSearchParams();
  const tokenAddress = queryParams.get('address');

  useEffect(() => {
    if (tokenData?.metadata?.data?.uri?.length) {
      axios({
        url: tokenData?.metadata?.data?.uri,
        headers: { 'Access-Control-Allow-Origin': '*' },
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
    if (tokenAddress) {
      setCurrInput(tokenAddress);
    }

    if (connection?._rpcEndpoint && tokenAddress) {
      const tokenDetailsClient = new TokenDetailsClient(connection);
      setIsTokenLoading(true);
      tokenDetailsClient
        .getTokensFullDetails([tokenAddress])
        .then(([resss]) => {
          setTokenData(resss);
        })
        .finally(() => {
          setIsTokenLoading(false);
        });
    }
  }, [tokenAddress, connection]);

  return (
    <>
      <div className={launchpadStyle.tokenDetailsContainers}>
        {/* <div className={launchpadStyle.tokenPageTitleConatiner}>
          <h2 className={launchpadStyle.minFormTitle}>
            <span className={launchpadStyle.highlighText}>Manage:&nbsp;</span>
            View & {tabDiscription}
          </h2>
          <div className={launchpadStyle.headerLine} />
        </div> */}
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
            disabled={isTokenLoading}
            onClick={() => {
              // validate Pubkey is valid one or not
              setQueryParams(prev => [['address', currInput]]);
            }}
          />
        </div>
      </div>

      <TokenBasicDetails
        tokenData={tokenData}
        uriData={uriData}
        isTokenLoading={isTokenLoading}
      />
    </>
  );
};

export default TokenDetailsTabs;
