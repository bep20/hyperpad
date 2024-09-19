import React, { useState, useEffect } from 'react';
import Card from 'antd/es/card';
import Skeleton from 'antd/es/skeleton';
import launchpadStyle from '../style/launchpad.module.less';
import { CopyString } from './CopyString';

export const TokenBasicDetails = ({
  tokenData,
  uriData,
  isTokenLoading = true,
}) => (
  <div className={launchpadStyle.tokenBasicDetails}>
    <Card>
      {!tokenData?.decimals ? (
        <Skeleton active={isTokenLoading} />
      ) : (
        <div className={launchpadStyle.cardContent}>
          <div className={launchpadStyle.leftContainer}>
            <div className={launchpadStyle.imageContainer}>
              <img src={uriData?.image || ''} />
            </div>
            <div className={launchpadStyle.textContainer}>
              <p>Token Name : {tokenData?.metadata?.data?.name || ''}</p>
              <p>Token Ticker : {tokenData?.metadata?.data?.symbol || ''}</p>
              <p className='flex'>
                <p style={{ whiteSpace: 'nowrap' }}>Token Address : &nbsp;</p>
                <CopyString data={tokenData.mint} dataToCopy={tokenData.mint} />
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  </div>
);
