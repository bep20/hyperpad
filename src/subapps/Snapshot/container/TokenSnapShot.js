/* eslint-disable no-unused-expressions */
import React, { useContext, useState } from 'react';
import Space from 'antd/es/space';
import axios from 'axios';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import snapshotStyle from '../style/snapshot.module.less';
import { SnapShotForm } from '../components/SnapShotForm';
import { TokenUtils } from '../../../solana/TokenUtils';
import { MULTI_SENDER_FEE_COLLECTOR, SNAPSHOT_FEE } from '../../../envs/vars';
import { SolUtils } from '../../../solana/SolUtils';
import { AppContext, NETWORKS } from '../../../context/AppStore';
import { NotifyContext } from '../../../context/Notify';
import { httpClient } from '../../../utils/api';
import { useNavigate } from 'react-router-dom';

const TRANSACTION_MODE = {
  MAINNET: 1,
  DEVNET: 2,
};
const SPL_2022_ACCOUNT_SIZE = 182;
const SPL_ACCOUNT_SIZE = 165;
const DEFAULT_TOKEN_DETAILS = {};

export const TokenSnapShot = () => {
  const [appStore] = useContext(AppContext);
  const [notifyApi] = useContext(NotifyContext);
  const [tokenHoldersCount, setTokenHoldersCount] = useState(0);
  const [isHolderLoading, setIsHolderLoading] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();
  const [inputMintAddress, setInputMintAddress] = useState(null);
  const [tokenAmount, setTokenAmount] = useState({
    amountToken: null,
    tokenvalue: tokenHoldersCount,
  });
  const [isTokenLoading, setIsTokenLoading] = useState(false);

  const [isFormInSubmission, setIsFormInSubmission] = useState(false);

  const [tokenDetails, setTokenDetails] = useState(DEFAULT_TOKEN_DETAILS);
  const [inputvalue, setInputvalue] = useState(null);

  const [uriData, setURIData] = useState({});
  const navigate = useNavigate();

  //   const handleChangeDisabled = () => {
  //     setInputShow(true);
  //   };

  const getTokenHolderList = async (mintAddress, tkDetails) => {
    const tokenUtilsClient = new TokenUtils(connection);

    let mintDetails = tkDetails;

    if (!mintDetails) {
      const [mtDetails = {}] = await tokenUtilsClient.getTokensFullDetails([
        inputMintAddress,
      ]);
      mintDetails = mtDetails;
    }

    const programId =
      mintDetails?.program === 'spl-token'
        ? TOKEN_PROGRAM_ID
        : TOKEN_2022_PROGRAM_ID;
    const accountSize =
      mintDetails?.program === 'spl-token'
        ? SPL_ACCOUNT_SIZE
        : SPL_2022_ACCOUNT_SIZE;
    const accounts = await connection.getProgramAccounts(programId, {
      commitment: 'confirmed',
      filters: [
        { memcmp: { offset: 0, bytes: new PublicKey(mintAddress).toBase58() } },
        { dataSize: accountSize },
      ],
      dataSlice: { offset: 0, length: 0 },
    });

    return accounts.map(account => account.pubkey.toBase58());
  };

  const handleRadioChange = e => {
    const { value } = e.target;

    setTokenAmount(prev => ({
      ...prev,
      tokenvalue: prev.tokenvalue == value ? null : value,
    }));
  };

  const handleCustomInputChange = e => {
    const value = e.target.value;

    setInputvalue(value);
  };

  const loadToken = async () => {
    // load token infomation from mint address

    try {
      setIsTokenLoading(true);

      const tokenUtilsClient = new TokenUtils(connection);

      const [tkDetails = {}] = await tokenUtilsClient.getTokensFullDetails([
        inputMintAddress,
      ]);

      setTokenDetails({
        name: tkDetails?.metadata?.data?.name?.replace(/\u0000/g, ''),
        ticker: tkDetails?.metadata?.data?.symbol?.replace(/\u0000/g, ''),
        description: tkDetails?.description?.replace(/\u0000/g, ''),
        imageURL: tkDetails?.image?.replace(/\u0000/g, ''),
        metadataURI: tkDetails?.metadata?.data?.uri?.replace(/\u0000/g, ''),
      });
      setIsTokenLoading(false);
      axios({
        url: tkDetails?.metadata?.data?.uri?.replace(/\u0000/g, ''),
        headers: { 'Access-Control-Allow-Origin': '*' },
      })
        .then(res => {
          setURIData(res.data);
        })
        .catch(err => {
          console.log('catched error', err);
        });
      setIsHolderLoading(true);
      const tokenHolders = await getTokenHolderList(
        inputMintAddress,
        tkDetails,
      );
      setTokenHoldersCount(tokenHolders.length);
      setTokenAmount({ ...tokenAmount, tokenvalue: tokenHolders.length });
    } catch (err) {
      console.error('Error loading token:', err);
    } finally {
      setIsHolderLoading(false);
      setIsTokenLoading(false);
    }
  };

  const buildTransaction = () => {
    const transaction = new Transaction();

    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }),
    );
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 2 * 1000000 }),
    );
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(MULTI_SENDER_FEE_COLLECTOR),
        lamports: SNAPSHOT_FEE * LAMPORTS_PER_SOL,
      }),
    );

    return transaction;
  };

  const submitSnapshotRequest = ({
    signed_transaction,
    mintAddress,
    tx_mode,
    tokenAmount,
  }) =>
    new Promise((resolve, reject) => {
      httpClient
        .request({
          method: 'POST',
          url: '/token_holder_snapshot',
          data: {
            signed_transaction: signed_transaction.serialize(),
            mint_address: mintAddress,
            user_pubkey: wallet.publicKey.toBase58(),
            tx_mode,
            min_tokens: tokenAmount?.amountToken,
            account_limits:
              tokenAmount?.tokenvalue === 'custom'
                ? inputvalue
                : tokenAmount?.tokenvalue,
          },
        })
        .then(response => {
          resolve(response?.data);
        })
        .catch(err => {
          reject(err);
        });
    });

  const takeSnaphot = async () => {
    // perform snapshot

    const notifyId = 'snap_id';
    try {
      setIsFormInSubmission(true);
      const transaction = buildTransaction();

      const signed_transaction = await SolUtils.getSignedTransaction(
        connection,
        transaction,
        wallet,
        wallet.publicKey,
      );

      const tx_mode =
        appStore?.currentNetwork === NETWORKS.MAINNET
          ? TRANSACTION_MODE.MAINNET
          : TRANSACTION_MODE.DEVNET;

      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Processing Request',
          description:
            'We are processing your request, details will be available in Snapshot history tab shortly.',
          duration: 15,
        });

      const result = await submitSnapshotRequest({
        signed_transaction,
        mintAddress: inputMintAddress,
        tx_mode,
        tokenAmount,
      });

      setTokenAmount({ ...tokenAmount, tokenvalue: tokenHoldersCount });
      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Request Completed',
          description:
            'Your request is completed. Please check snapshot history tab to download holders snapshot. Or Refresh the Snapshot history page !!',
          duration: 5,
        });

      return navigate(`/snapshot/snap-history`);
    } catch (err) {
      console.log('error occured in snapshot..');
      notifyApi &&
        notifyApi.open({
          key: notifyId,
          placement: 'bottomRight',
          message: 'Request Failed',
          description:
            'Your request is failed, try again by refreshing the page. Please contact team if issue persists',
          duration: 5,
        });
    } finally {
      setIsFormInSubmission(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: '3rem' }}>
      <div className={snapshotStyle.container}>
        <Space
          direction='vertical'
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            rowGap: '1rem',
          }}>
          <div>
            <h1 className={snapshotStyle.title}>
              <span className={snapshotStyle.purpleText}>Snapshot: </span>Take
              snapshot of token holders
            </h1>
            <div className={snapshotStyle.headerLine} />
          </div>

          <SnapShotForm
            inputMintAddress={inputMintAddress}
            setInputMintAddress={setInputMintAddress}
            loadToken={loadToken}
            tokenDetails={tokenDetails}
            uriData={uriData}
            takeSnaphot={takeSnaphot}
            isTokenLoading={isTokenLoading}
            tokenAmount={tokenAmount}
            handleRadioChange={handleRadioChange}
            setTokenAmount={setTokenAmount}
            isFormInSubmission={isFormInSubmission}
            tokenHoldersCount={tokenHoldersCount}
            isHolderLoading={isHolderLoading}
            handleCustomInputChange={handleCustomInputChange}
          />
        </Space>
      </div>
    </div>
  );
};
