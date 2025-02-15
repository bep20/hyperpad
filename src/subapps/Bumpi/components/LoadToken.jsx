import React, { useState } from 'react';
import Input from 'antd/es/input';
import message from 'antd/es/message';
import { useConnection } from '@solana/wallet-adapter-react';
import { HyperButton } from '../../../components/buttons/HyperButton';
import { loadTokenDetails, loadTokenDetailsBE } from '../../../utils/helpers';
import { getBondingCurveStatus } from '../utils/apiCalls';
import bumpiStyle from '../style/bumpi.module.less';
import { getMode } from "../utils/helpers";

const LoadToken = ({ setTokenDetails }) => {
  const [token, setToken] = useState('');
  const [loadingTokenDetails, setLoadingTokenDetails] = useState(false);
  const { connection } = useConnection();

  async function loadToken(address) {
    try {
      setLoadingTokenDetails(true);
      setTokenDetails(null);
      const [[result = null], bondingStatus] = await Promise.all([
        loadTokenDetailsBE({
          address,
          mode: getMode(connection),
        }),
        getBondingCurveStatus({ mintAddress: address }),
      ]);

      if (result?.decimals) {
        return setTokenDetails({ ...result, ...bondingStatus });
      }
      throw new Error('Invalid token');
    } catch (err) {
      setTokenDetails(null);
      return message.error(err?.message || 'Invalid Token');
    } finally {
      setLoadingTokenDetails(false);
    }
  }

  return (
    <>
      <h3>Token address</h3>
      <div className='flex items-center gap-x-6 w-full md:flex-col md:gap-y-[1rem]'>
        <Input
          className={`h-[42px] ${bumpiStyle.mintAddress}`}
          placeholder='Token Mint address'
          addonBefore='Mint Address'
          value={token}
          onChange={e => {
            setToken(e.target.value);
          }}
        />

        <HyperButton
          btnSize='medium-btn'
          text={loadingTokenDetails ? 'Loading' : 'Load'}
          onClick={() => loadToken(token)}
          disabled={loadingTokenDetails || !token.trim()}
          loading={loadingTokenDetails}
          className='md:w-[70%]'
        />
      </div>
    </>
  );
};

export default LoadToken;
