import React, { useState, useEffect, useContext } from 'react';
import Input from 'antd/es/input';
import Space from 'antd/es/space';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import message from 'antd/es/message';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createBurnCheckedInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import Card from 'antd/es/card';
import Table from 'antd/es/table';
import AutoComplete from 'antd/es/auto-complete';
import axios from 'axios';
import { HyperSButton } from '../../../components/buttons/HyperSButton';
import { NETWORKS, AppContext } from '../../../context/AppStore';

import { SOL_COMMITMENT } from '../../../constants/solana';
import { TokenDetailsClient } from '../../LaunchPad/utils/tokendetails';
import { httpClient } from '../../../utils/api';
import { HyperButton } from '../../../components/buttons/HyperButton';
import burnerStyle from '../style/burner.module.less';
import { BURNER_FEE, MULTI_SENDER_FEE_COLLECTOR } from '../../../envs/vars';
import { getTransactionLink } from '../../../utils/helpers';

const initialTokenDetails = {
  supply: 0,
  balance: 0,
  decimals: 0,
  program_id: '',
  program_id_text: '',
  mintAddress: '',
  name: '',
  symbol: '',
  imageUri: '',
};

const getTransferDate = curr_time =>
  curr_time
    ? `${new Date(curr_time).toLocaleDateString()} ${new Date(
        curr_time,
      ).toLocaleTimeString()}`
    : '-';

export const getTokens = (connection, wallet, programId) =>
  new Promise(resolve => {
    connection
      .getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId,
      })
      .then(result => {
        const token_details = result?.value?.map(item => {
          return {
            mint: item?.account?.data?.parsed?.info?.mint,
          };
        });

        resolve(token_details);
      });
  });

export const getMetadata = async (mint, connection) => {
  const tokenDetailsClient = new TokenDetailsClient(connection);
  const [tokenDetails] = await tokenDetailsClient.getTokensFullDetails([mint]);

  const uri = tokenDetails?.metadata?.data?.uri?.replace(/\u0000/g, '');
  return new Promise((resolve, reject) => {
    axios({
      url: uri,
    })
      .then(res => {
        resolve({
          mint: tokenDetails?.mint,
          imageUri: res?.data?.image,
          name: tokenDetails?.metadata?.data?.name?.replace(/\u0000/g, ''),
          symbol: tokenDetails?.metadata?.data?.symbol?.replace(/\u0000/g, ''),
        });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const AssetBurner = () => {
  const [appStore, dispatchAppStore] = useContext(AppContext);
  const [userTokens, setUserTokens] = useState([]);

  const [burnHistory, setBurnHistory] = useState([]);

  const [assetAddress, setAssetAddress] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isFormSubmission, setIsFormSubmission] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(initialTokenDetails);
  const [burnInput, setBurnInput] = useState(null);
  const connection = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    if (wallet.connected) {
      if (!(connection.connection.rpcEndpoint.indexOf('devnet') > -1)) {
        httpClient
          .request({
            url: '/user_burns',
            params: {
              wallet_pubkey: wallet.publicKey.toBase58(),
            },
          })
          .then(response => {
            setBurnHistory([...(response?.data?.details || [])]);
          })
          .catch(() => {
            message.error('Unable to fetch burn history, Please contact team');
          });
      }

      // fetch all user tokens spl/spl22

      Promise.all([
        getTokens(connection.connection, wallet, TOKEN_PROGRAM_ID),
        getTokens(connection.connection, wallet, TOKEN_2022_PROGRAM_ID),
      ]).then(res => {
        const metad = [...res[0], ...res[1]];
        const metadata = metad.map(item =>
          getMetadata(item.mint, connection.connection),
        );

        Promise.allSettled(metadata).then(ress => {
          const fdetails = ress?.map((item, index) => {
            if (item.status === 'fulfilled') {
              return {
                ...item.value,
              };
            }
            return {
              mint: metad[index].mint,
            };
          });
          setUserTokens(fdetails);
        });
      });
    }
  }, [wallet.connected]);

  const onAssetLoad = () => {
    if (wallet.connected) {
      // fetch token details
      connection.connection
        .getParsedAccountInfo(new PublicKey(assetAddress))
        .then(result => {
          const tokenSupply =
            result?.value?.data?.parsed?.info?.supply /
            10 ** result?.value?.data?.parsed?.info?.decimals;
          setTokenDetails(prev => ({
            ...prev,
            supply: tokenSupply,
            mintAddress: assetAddress,
            decimals: result?.value?.data?.parsed?.info?.decimals,
          }));

          const programId =
            result?.value?.data?.program == 'spl-token-2022'
              ? TOKEN_2022_PROGRAM_ID
              : result?.value?.data?.program == 'spl-token'
                ? TOKEN_PROGRAM_ID
                : null;
          const program_id_text = result?.value?.data?.program;

          // fetch user token details
          const userATA = getAssociatedTokenAddressSync(
            new PublicKey(assetAddress),
            wallet.publicKey,
            false,
            programId,
          );

          connection.connection
            .getParsedAccountInfo(userATA)
            .then(userDetails => {
              setTokenDetails(prev => ({
                ...prev,
                program_id: programId.toBase58(),
                program_id_text,
                userATA,
                balance:
                  userDetails?.value?.data?.parsed?.info?.tokenAmount
                    ?.uiAmountString,
              }));
            })
            .catch(err => {
              console.log('error while getting user details', err);
            });
        })
        .catch(err => {
          console.log('error is', err);
        });

      // fetch token metadata
      getMetadata(assetAddress, connection.connection).then(response => {
        setTokenDetails(prev => ({
          ...prev,
          imageUri: response?.imageUri,
          name: response?.name,
          symbol: response?.symbol,
        }));
      });
    } else {
      message.error('Please connect wallet to load asset');
    }
  };

  const handleTokenBurn = async () => {
    // validate things
    if (!tokenDetails?.mintAddress) {
      message.error('Please enter Asset Address, load Asset to continue');
      return;
    }

    if (parseFloat(tokenDetails?.balance) > parseFloat(tokenDetails?.supply)) {
      message.error('you dont have sufficient balance to proceeds');
      return;
    }

    // build transaction
    const transaction = new Transaction();

    // add platform fee in transaction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(MULTI_SENDER_FEE_COLLECTOR),
        lamports: BURNER_FEE * LAMPORTS_PER_SOL,
      }),
    );

    // add burn transaction
    transaction.add(
      createBurnCheckedInstruction(
        tokenDetails?.userATA,
        new PublicKey(tokenDetails?.mintAddress),
        wallet.publicKey,
        burnInput * 10 ** tokenDetails?.decimals,
        tokenDetails.decimals,
        [],
        new PublicKey(tokenDetails?.program_id),
      ),
    );
    transaction.feePayer = wallet.publicKey;

    const { blockhash, lastValidBlockHeight } =
      await connection.connection.getLatestBlockhash('finalized');

    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    const signedTx = await wallet.signTransaction(transaction);

    // submit transaction to Backend

    const key = 'burner';
    messageApi.open({
      key,
      type: 'loading',
      content: 'Processing transaction, details will be available shortly',
    });

    setIsFormSubmission(true);

    if (connection.connection.rpcEndpoint.indexOf('devnet') > -1) {
      try {
        const txId = await sendAndConfirmRawTransaction(
          connection.connection,
          signedTx.serialize(),
          {
            skipPreflight: false,
            commitment: SOL_COMMITMENT,
            preflightCommitment: SOL_COMMITMENT,
          },
          {},
        );
        if (!txId) {
          throw new Error('failed');
        }
        messageApi.open({
          key,
          type: 'success',
          content: `Transaction Successfull, ${txId}`,
          duration: 10,
        });
        setBurnInput(null);
        setTokenDetails(initialTokenDetails);
        setAssetAddress(null);
      } catch (err) {
        console.log('errr', err);
        messageApi.open({
          key,
          type: 'error',
          content: 'Transaction failed',
          duration: 10,
        });
      } finally {
        setIsFormSubmission(false);
      }
    } else {
      httpClient
        .request({
          method: 'POST',
          url: '/burn_asset',
          data: {
            signed_transaction: signedTx.serialize(),
            mint_address: assetAddress,
            owner_pubkey: wallet.publicKey.toBase58(),
            amount_burn: burnInput,
          },
        })
        .then(() => {
          messageApi.open({
            key,
            type: 'success',
            content:
              'Transaction Successfull, Check details on transaction table !!',
            duration: 10,
          });

          setBurnInput(null);
          setTokenDetails(initialTokenDetails);
          setAssetAddress(null);
        })
        .catch(err => {
          messageApi.open({
            key,
            type: 'error',
            content:
              err?.response?.data?.error ||
              'Transaction failed!, please contact team',
            duration: 2,
          });
        })
        .finally(() => {
          setIsFormSubmission(false);
        });
    }
  };

  const TB_DETAILS_COLUMN = [
    {
      title: 'Asset Address',
      dataIndex: 'mint_address',
      key: 'mint_address',
      render: text => <span>{text}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount_burn',
      key: 'amount_burn',
      render: text => (
        <span>{text ? parseFloat(text)?.toLocaleString('en-US') : '-'}</span>
      ),
    },
    {
      title: 'Burned At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: text => <span>{getTransferDate(text)}</span>,
    },
    {
      title: 'Transaction',
      dataIndex: 'transaction_hash',
      key: 'transaction_hash',
      render: (text, record) => (
        <span>
          {text ? (
            <a
              target='_blank'
              href={getTransactionLink(record, appStore?.currentNetwork)}
              rel='noreferrer'>
              transaction
            </a>
          ) : (
            ''
          )}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'burn_status',
      key: 'burn_status',
      render: text => <span>{text == 1 ? 'Success' : 'Failed'}</span>,
    },
  ];

  //   imageType

  const assetOptions = userTokens.map(item => ({
    label: (
      <div className={burnerStyle.optionToken}>
        <div className={burnerStyle.optionTokenImage}>
          {item?.imageUri && (
            <img
              alt=''
              height={25}
              width={25}
              style={{ borderRadius: '50%', marginRight: '10px' }}
              src={item.imageUri}
            />
          )}
        </div>
        <div>
          <p className={burnerStyle.optionTokenSymbol}>
            {item.symbol || 'Unknown'}
          </p>
          <p className={burnerStyle.optionTokenAddress}>{item.mint}</p>
        </div>
      </div>
    ),
    value: item.mint,
    name: item.name,
    imageUri: item.imageUri,
  }));
  return (
    <div className='flex flex-col gap-y-12'>
      <div className={burnerStyle.container}>
        {contextHolder}
        <Space direction='vertical' className='w-[100%] flex flex-col gap-y-8'>
          <div>
            <h1 className={burnerStyle.burnTitle}>
              <span className={burnerStyle.purpleText}>Burner: </span>Burn your
              Assets (SPL/SPL22/LP)
            </h1>
            <div className={burnerStyle.headerLine} />
          </div>
          <div className={burnerStyle.autoCompleteLoadContainer}>
            <div className={burnerStyle.autoCompleteLoad}>
              <div className={`${burnerStyle.tokenLoad} burnertokenload`}>
                <AutoComplete
                  options={assetOptions}
                  style={{ width: '100%', paddingInline: '0px' }}
                  onSelect={val => {
                    setAssetAddress(val);
                    setTokenDetails(initialTokenDetails);
                  }}
                  popupClassName='customAutoComplete'>
                  <Input
                    value={assetAddress}
                    style={{ width: '100%', height: '100%' }}
                    placeholder='Enter Asset Address'
                    onChange={event => setAssetAddress(event?.target?.value)}
                  />
                </AutoComplete>

                <HyperButton text='load' onClick={onAssetLoad} />
              </div>
              <Card className={burnerStyle.burnCardInfo}>
                <div className={burnerStyle.infoRowContainer}>
                  <p className={burnerStyle.infoRow}>
                    <span>Supply</span>
                    <span className={burnerStyle.btext}>
                      {tokenDetails?.supply?.toLocaleString('en-US') || '-'}
                    </span>
                  </p>
                  <p className={burnerStyle.infoRow}>
                    <span>Balance</span>
                    <span className={burnerStyle.btext}>
                      {tokenDetails?.balance
                        ? parseFloat(tokenDetails?.balance)?.toLocaleString(
                            'en-US',
                          )
                        : '-'}
                    </span>
                  </p>
                  <p className={burnerStyle.infoRow}>
                    <span>Program Id</span>
                    <span className={burnerStyle.btext}>
                      {tokenDetails?.program_id_text || '-'}
                    </span>
                  </p>
                </div>
              </Card>
            </div>
            <div className={burnerStyle.burnCardsWrap}>
              <div className={burnerStyle.burnCards}>
                <Card className={burnerStyle.burnCardAction}>
                  <div className={burnerStyle.burnCardActionContent}>
                    <div className='flex gap-x-8'>
                      <div className='flex items-center justify-center'>
                        {tokenDetails?.imageUri && (
                          <img
                            height={60}
                            width={60}
                            style={{ borderRadius: '50%' }}
                            src={tokenDetails?.imageUri}
                          />
                        )}
                      </div>
                      <div className={burnerStyle.infoRowContainer}>
                        <p className={burnerStyle.infoRow}>
                          <span>Name:</span>
                          <span className={burnerStyle.btext}>
                            {tokenDetails?.name || '-'}
                          </span>
                        </p>
                        <p className={burnerStyle.infoRow}>
                          <span>Symbol:</span>
                          <span className={burnerStyle.btext}>
                            {tokenDetails?.symbol || '-'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className={burnerStyle.burnCardActionInputCt}>
                      <Input
                        value={burnInput}
                        onChange={event => setBurnInput(event.target.value)}
                        placeholder='Enter Amount you want to burn'
                      />
                      <HyperSButton
                        text='All'
                        onClick={() => {
                          setBurnInput(tokenDetails?.balance);
                        }}
                      />
                    </div>
                    <HyperButton
                      disabled={isFormSubmission}
                      text='Burn'
                      onClick={handleTokenBurn}
                    />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Space>
      </div>
      <div className={burnerStyle.container}>
        <Space direction='vertical' className='flex flex-col gap-y-8 w-[100%]'>
          <div>
            <h1 className={burnerStyle.burnTitle}>
              <span className={burnerStyle.purpleText}>Details:&nbsp;</span>
              Burn history
            </h1>
            <div className={burnerStyle.headerLine} />
          </div>
          <div>
            <Table
              columns={TB_DETAILS_COLUMN}
              dataSource={burnHistory}
              pagination={false}
              size='small'
              scroll={{ x: '100%' }}
            />
          </div>
        </Space>
      </div>
    </div>
  );
};
