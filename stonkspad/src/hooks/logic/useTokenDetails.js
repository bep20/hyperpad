import { useState, useCallback } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

// Import the SplToken library if not already done

function useTokenDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTokenDetails = useCallback(
    async (connection, wallet, tokenAddress) => {
      setLoading(true);
      setError(null);

      try {
        connection.getAccountInfo();
      } catch (err) {
        console.log("err", err);
        setError(err);
      } finally {
        console.log("finally");
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    success,
    multisendToken,
  };
}

export default useSolanaMultisender;
