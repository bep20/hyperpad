import React, { useContext } from 'react';

export const TokenSuccess = ({
  transactionHash,
  tokenAddress,
  tokenName,
  cluster,
}) => (
  <span>
    Token Created Sucessfully!!. Your &nbsp;
    <a
      target='_blank'
      href={`https://explorer.solana.com/tx/${transactionHash}?cluster=${cluster}`}
      rel='noreferrer'>
      Transaction hash
    </a>
    &nbsp; and Token &nbsp;
    <a
      target='_blank'
      href={`https://explorer.solana.com/address/${tokenAddress}?cluster=${cluster}`}
      rel='noreferrer'>
      {tokenName}
    </a>
  </span>
);
