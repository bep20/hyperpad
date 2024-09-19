import React, { useMemo, useRef, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import message from 'antd/es/message';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { TokenInfo } from '../components/TokenInfo';
import LoadToken from '../components/LoadToken';
import BumpiForm from '../components/BumpiForm';
import { HyperButton } from '../../../components/buttons/HyperButton';
import {
  BASE_PDA,
  BONDING_CHARGE,
  FACTOR,
  HYPERPAD_CHARGE,
  JITO_TIP_1X,
  PUMPFUN_CHARGE,
  TX_AMT_L,
} from '../../../envs/vars';
import { BotTransaction } from '../utils/BotTransaction';
import { SolUtils } from '../../../solana/SolUtils';
import { useCreateWallet, useInitCompaign } from '../../../utils/networkCalls';
import { NotifyContext } from '../../../context/Notify';
import { BumpiInfo } from '../components/BumpiInfo';
import { BOT_MIN_RATE } from '../utils/helpers';

const Create = () => {
  const [tokenDetails, setTokenDetails] = useState(null);
  const [notifyApi] = useContext(NotifyContext);
  const notifyRef = useRef(null);

  const { connection } = useConnection();
  const wallet = useWallet();
  const [formData, setFormData] = useState({
    amt: TX_AMT_L,
    count: 1,
    rate: 25,
    tip: JITO_TIP_1X,
  });

  const navigate = useNavigate();

  const { mutate: createWallet } = useCreateWallet({
    onSuccess: data => {
      const { pubKey, campaignId } = data.data.data[0] || {};
      createTxn({ pubKey, campaignId });
    },
    onError: () => {
      message.error('Internal Server Error, Please contact team!!');
    },
  });

  const { mutate: initCompaign } = useInitCompaign({
    onSuccess: () => {
      let campaignId = notifyRef.current;
      notifyRef.current &&
        notifyApi &&
        notifyApi.open({
          key: notifyRef.current,
          placement: 'bottomRight',
          message: 'Request Confirmed',
          description: (
            <div>
              <p>
                Please native to Manage Section to check bot transaction
                details!!
              </p>
              <a href={`/pumpfun-bump-bot/manage/${campaignId}`}>BOT DETAILS</a>
            </div>
          ),
          duration: 10,
        });
      notifyRef.current = null;
      setTimeout(() => {
        navigate(`/pumpfun-bump-bot/manage/${campaignId}`);
      }, 10 * 1000);
    },
    onError: err => {
      message.error(`Unable to start bot, ${err?.message || ''}`);
      notifyRef.current &&
        notifyApi &&
        notifyApi.open({
          key: notifyRef.current,
          placement: 'bottomRight',
          message: 'Request Failed',
          description: (
            <div>
              <p>
                We are unable to process your request, Please contact team !!
              </p>
            </div>
          ),
          duration: 10,
        });
      notifyRef.current = null;
    },
  });

  const solAmt = useMemo(() => {
    const { count, rate, tip } = formData;
    console.log(
      BASE_PDA,
      count,
      tip,
      PUMPFUN_CHARGE,
      BONDING_CHARGE,
      HYPERPAD_CHARGE,
      rate,
    );
    // 1% pumpfun platform fee + jito tip + hyperpad charge
    // jito tip removed.
    return (
      2 * +BASE_PDA + +formData.amt  +
      +count *
        (
          +(formData.amt * 1 / 100) +
          +HYPERPAD_CHARGE * (1 + +rate / 60).toFixed(2))
    ).toFixed(5);
  }, [formData]);

  const createTxn = async ({ pubKey, campaignId }) => {
    const txn = await BotTransaction.createTxn({
      connection,
      wallet,
      solAmt,
      targetAddress: pubKey,
      mintAddress: tokenDetails?.mint
    });

    const signedTxn = await SolUtils.getSignedTransaction(
      connection,
      txn,
      wallet,
      wallet.publicKey,
    );

    const base64Transaction = Buffer.from(signedTxn.serialize()).toString(
      'base64',
    );

    if (base64Transaction) {
      notifyRef.current = campaignId;
      notifyApi &&
        notifyApi.open({
          key: notifyRef.current,
          placement: 'bottomRight',
          message: 'Processing Request',
          description:
            'We are processing your request, Please wait while we confirm your request!!',
          duration: 60,
        });
      initCompaign({
        campaignId,
        createdBy: wallet.publicKey.toString(),
        txnPerMin: formData.rate,
        jitoEnabled: false,
        jitoRatePerTxn: formData.tip * LAMPORTS_PER_SOL,
        maxTxnLimit: formData.count,
        exchangeType: 'PumpFun',
        tokenMintAddress: tokenDetails?.mint,
        symbol: tokenDetails?.fileData?.symbol,
        tradeAccountKey: pubKey,
        signedTxn: base64Transaction,
        perTxnAmt: formData.amt * LAMPORTS_PER_SOL,
        tokenName: tokenDetails?.metadata?.data?.name || '-',
      });
    }
  };

  return (
    <div className='flex gap-x-[2rem] flex-row md:flex-col md:gap-y-[2rem]'>
      <div className='flex flex-col w-[70%] md:w-[100%] p-6 gap-y-4 border bg-[var(--main-background-color)] border-[var(--main-border-color)] rounded-[5px]'>
        <LoadToken setTokenDetails={setTokenDetails} />
        {tokenDetails ? <TokenInfo tokenDetails={tokenDetails} /> : null}
        <BumpiForm formData={formData} setFormData={setFormData} />
        <HyperButton
          className='w-fit mx-auto mt-8'
          text={`Pay and Start (${solAmt})`}
          onClick={() => createWallet()}
          disabled={!tokenDetails || !(tokenDetails?.curveExists && !tokenDetails?.migrated)}
          loading={false}
        />
      </div>
      <div className='w-[30%] md:w-[100%] p-6 gap-y-4 border bg-[var(--main-background-color)] border-[var(--main-border-color)] rounded-[5px]'>
        <BumpiInfo />
      </div>
    </div>
  );
};

export default Create;
