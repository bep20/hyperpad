import React from 'react';
import Card from 'antd/es/card/Card';

export const TokenDetails = ({ tokenDetails }) => {
  return (
    <Card style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'row', columnGap: '3rem' }}>
        <div style={{ width: '100px', borderRadius: '0.3rem' }}>
          <img
            style={{ borderRadius: '0.3rem' }}
            width={100}
            height={100}
            src={tokenDetails.image}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'baseline',
          }}>
          <p>
            <span>Token Name: &nbsp;&nbsp;</span>
            <span style={{ fontWeight: '700' }}>{tokenDetails.name}</span>
          </p>
          <p>
            <span>Token Supply: &nbsp;&nbsp;</span>
            <span style={{ fontWeight: '700' }}>{tokenDetails.supply}</span>
          </p>
          <p>
            <span>Balance: &nbsp;&nbsp;</span>
            <span style={{ fontWeight: '700' }}>{tokenDetails.balance}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};
