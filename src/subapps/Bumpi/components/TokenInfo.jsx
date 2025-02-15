import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from 'antd/es/card';

export const TokenInfo = ({ tokenDetails, loading = false, ...props }) => {
  return (
    <Card size='small' title={`Token Details`} loading={loading} {...props}>
      <div className='flex items-start gap-x-8'>
        <img className='mt-1' width={70} height={70} src={tokenDetails?.fileData?.image} alt='' />
        <div className='flex gap-x-4 flex-1'>
          <div className='flex flex-col gap-y-2 w-[50%]'>
            <p className='m-0'>
              <span>Token Name:&nbsp;&nbsp;</span>
              <span className='font-bold'>
                {tokenDetails?.metadata?.data?.name || '-'}
              </span>
            </p>
            <p className='m-0'>
              <span>Token Ticker:&nbsp;&nbsp;</span>
              <span className='font-bold'>{tokenDetails?.fileData?.symbol || '-'}</span>
            </p>
            <p className='m-0'>
              <span>Token Description:&nbsp;&nbsp;</span>
              <span className='font-bold'>{tokenDetails?.fileData?.description || '-'}</span>
            </p>
          </div>
          <div className='flex flex-col gap-y-2 w-[50%]'>
            <p className='m-0'>
              <span>Bonding Curve:&nbsp;&nbsp;</span>
              <span className='font-bold'>
                {tokenDetails?.curveExists ? 'YES' : 'NO'}
              </span>
            </p>
            <p className='m-0'>
              <span>Curve Migrated:&nbsp;&nbsp;</span>
              <span className='font-bold'>
                {tokenDetails?.migrated ? 'YES' : 'NO'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
