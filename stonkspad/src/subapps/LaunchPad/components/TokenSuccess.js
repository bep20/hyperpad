import React from "react";

export const TokenSuccess = ({
  transactionHash,
  tokenAddress,
  tokenName,
  cluster,
}) => {
  return (
    <span>
      Token Created Sucessfully!!. Your &nbsp;
      <a
        target="_blank"
        href={`https://explorer.solana.com/tx/${transactionHash}?cluster=${cluster}`}
      >
        Transaction hash
      </a>
      &nbsp; and Token &nbsp;
      <a
        target="_blank"
        href={`https://explorer.solana.com/address/${tokenAddress}?cluster=${cluster}`}
      >
        {tokenName}
      </a>
    </span>
  );
};
