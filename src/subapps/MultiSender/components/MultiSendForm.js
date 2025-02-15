import React, { useState } from 'react';
import message from 'antd/es/message';
import Steps from 'antd/es/steps';
import axios from 'axios';

import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { useNavigate } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import useDevice from '../../../hooks/useDevice';
import {
  getTokenDetails,
  buildMultiSendSolTransaction,
  buildMultiSendToken2022Transaction,
} from '../utils/multisendToken';
import multisenderStyle from '../style/multisender.module.less';
import { TokenType } from './TokenType';
import { ManageAddress } from './ManageAddress';
import { ConfirmData } from './ConfirmData';
import { TOKEN_TYPES } from '../constants/token';
import { isValidSolanaAddress } from '../utils/pbkey';
import { HyperButton } from '../../../components/buttons/HyperButton';
import { HyperSButton } from '../../../components/buttons/HyperSButton';
import {
  MULTI_SENDER_FEE_SOL,
  MULTI_SENDER_FEE_TOKEN,
} from '../../../envs/vars';
import { FaqSection } from '../../../components/faq/Faq';
import { faqItems } from '../utils/faqdata';
import { baseURL } from '../../../utils/api';

const { Step } = Steps;

// validate if user has selected provided tokens or not
const validateTokenType = tokenType => {
  if (
    [TOKEN_TYPES.SOL, TOKEN_TYPES.SPL, TOKEN_TYPES.SPL2022].includes(tokenType)
  ) {
    return true;
  }
  return false;
};

const getAggregates = data => {
  // compute Aggregate of row, if any duplicate is there. & also calculate total amount of all the tokens to display
  const addressMap = new Map();
  for (let i = 0; i < data.length; i++) {
    if (data[i].target && data[i].amount) {
      if (addressMap.has(data[i].target)) {
        const existingAmount = addressMap.get(data[i].target).amount;
        const newAmount =
          parseFloat(existingAmount) + parseFloat(data[i].amount);
        addressMap.set(data[i].target, {
          ...data[i],
          amount: newAmount,
        });
      } else {
        addressMap.set(data[i].target, {
          ...data[i],
          amount: parseFloat(data[i].amount),
        });
      }
    }
  }
  const uniqueAggregatedData = [...addressMap.values()];
  const tempTotalTokenToTransfer = uniqueAggregatedData.reduce(
    (acc, item) => acc + parseFloat(item.amount),
    0,
  );

  return [uniqueAggregatedData, tempTotalTokenToTransfer];
};

const validateAddressList = data => {
  // validate address list
  if (!data?.length) {
    message.error('Add at least one address to distribute');
    return false;
  }

  for (let i = 0; i < data?.length; i++) {
    if (
      (data[i].target === '' || !data[i].target) &&
      (data[i].amount === '' || !data[i].amount)
    ) {
      continue;
    }
    if (!isValidSolanaAddress(data[i].target)) {
      message.error(`Invalid address at index: ${i + 1}`);
      return false;
    }
    if (!parseFloat(data[i].amount)) {
      message.error(`Invalid amount at index: ${i + 1}`);
      return false;
    } else if (parseFloat(data[i].amount) <= 0) {
      message.error(`Amount should be positive at index: ${i + 1}`);
      return false;
    }
  }
  return true;
};

const initialTokenDetails = {
  name: null,
  image: null,
  symbol: null,
  decimals: null,
  supply: null,
  balance: null,
};

export const MultisenderForm = () => {
  const [isSubmission, setIsSubmission] = useState(false);
  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();
  const navigate = useNavigate();

  const [tokenType, setTokenType] = useState(TOKEN_TYPES.SPL);
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenDetails, setTokenDetails] = useState(initialTokenDetails);

  const [messageApi, contextHolder] = message.useMessage();

  const isUnderMaintain = false;

  const loadTokenDetails = () => {
    if (isValidSolanaAddress(tokenAddress)) {
      // address is valid public key
      // fetch token details
      connection
        .getParsedAccountInfo(new PublicKey(tokenAddress), {
          commitment: 'recent',
        })
        .then(response => {
          const newTokenData = {
            decimals: response?.value?.data?.parsed?.info?.decimals,
            supply: response?.value?.data?.parsed?.info?.supply,
            type:
              response?.value?.data?.program == 'spl-token-2022'
                ? TOKEN_TYPES.SPL2022
                : response?.value?.data?.program == 'spl-token'
                  ? TOKEN_TYPES.SPL
                  : null,
          };
          if (newTokenData.type !== tokenType) {
            const errMsg = !(
              tokenType === TOKEN_TYPES.SPL || tokenType === TOKEN_TYPES.SPL2022
            )
              ? `Unable to load token, Please select correct network, (mainnet or devnet)`
              : tokenType === TOKEN_TYPES.SPL
                ? `Token is not spl standard`
                : `Token is not spl-2022 standard`;

            message.error(errMsg);
            return;
          }

          setTokenDetails(prev => {
            return {
              ...prev,
              decimals: newTokenData?.decimals,
              type: newTokenData?.type,
              supply: parseInt(
                newTokenData?.supply / 10 ** newTokenData?.decimals,
              ),
            };
          });
          // getting metadata account info
          axios({
            url: `https://api.degencdn.com/v1/nfts/${tokenAddress}`,
          })
            .then(res => {
              setTokenDetails(prev => ({
                ...prev,
                name: res?.data?.name,
                image: res?.data?.imageUri,
                symbol: res?.data?.symbol,
                decimals: newTokenData?.decimals,
                type: newTokenData?.type,
                supply: parseInt(
                  newTokenData?.supply / 10 ** newTokenData?.decimals,
                ),
              }));
            })
            .catch(err => {
              console.log('catched error', err);
            });
        });

      const tknPgId =
        tokenType === TOKEN_TYPES.SPL
          ? TOKEN_PROGRAM_ID
          : tokenType === TOKEN_TYPES.SPL2022
            ? TOKEN_2022_PROGRAM_ID
            : null;
      const userATA = getAssociatedTokenAddressSync(
        new PublicKey(tokenAddress),
        wallet.publicKey,
        false,
        tknPgId,
      );

      // fetch user balance
      connection
        .getParsedAccountInfo(userATA)
        .then(response => {
          const userTokenAmount =
            response?.value?.data?.parsed?.info?.tokenAmount?.uiAmount;

          const formttedTokenAmount = userTokenAmount
            ? parseFloat(userTokenAmount).toFixed(2)
            : '';
          setTokenDetails(prev => ({
            ...prev,
            balance: formttedTokenAmount,
          }));
        })
        .catch(err => {
          console.log('error while fetching balance');
          message.error('Unable to fetch balance!!');
        });
    }
  };

  const [data, setData] = useState([]);

  const [aggregatedData, setAggregatedData] = useState([]);
  const [totalTokenToTransfer, setTotalTokenToTransfer] = useState(0);

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Token Type',
      content: (
        <TokenType
          tokenType={tokenType}
          setTokenType={val => {
            setTokenDetails(initialTokenDetails);
            setData([]);
            setAggregatedData([]);
            setTotalTokenToTransfer(0);
            setTokenAddress(null);
            setTokenType(val);
          }}
        />
      ),
    },
    {
      title: 'Input Data',
      content: (
        <ManageAddress
          data={data}
          tokenType={tokenType}
          loadTokenDetails={loadTokenDetails}
          tokenDetails={tokenDetails}
          setData={setData}
          tokenAddress={tokenAddress}
          setTokenAddress={setTokenAddress}
        />
      ),
    },
    {
      title: 'Confirm Data',
      content: (
        <ConfirmData
          aggregatedData={aggregatedData}
          tokenType={tokenType}
          totalTokenToTransfer={totalTokenToTransfer}
          tokenAddress={tokenAddress}
          tokenDetails={tokenDetails}
        />
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep === 0) {
      if (validateTokenType(tokenType)) {
        setCurrentStep(currentStep + 1);
      } else {
        message.error('Please select token type to continue');
      }
    } else if (currentStep === 1) {
      // if token selected
      if (tokenType === TOKEN_TYPES.SOL) {
        // nothing to check
      } else if (tokenType === TOKEN_TYPES.SPL) {
        if (!tokenDetails?.decimals) {
          message.error('Please load token details to continue');
          return false;
        }
        if (tokenDetails?.type !== TOKEN_TYPES.SPL) {
          message.error('Entered Address not SPL standard');
          return false;
        }
      } else if (tokenType === TOKEN_TYPES.SPL2022) {
        if (!tokenDetails?.decimals) {
          message.error('Please load token details to continue');
          return false;
        }
        if (tokenDetails?.type !== TOKEN_TYPES.SPL2022) {
          message.error('Entered Address is not SPL 2022 standard');
          return false;
        }
      }

      if (validateAddressList(data)) {
        const [aggregate, totalToken] = getAggregates(data);
        setAggregatedData(aggregate);
        setTotalTokenToTransfer(totalToken);
        setCurrentStep(currentStep + 1);
      }
    }
  };
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleTokenDistribute = async () => {
    if (!wallet.connected) {
      message.error('Connect to wallet to continue !!');
      return;
    }
    // handle distribution
    if (!validateAddressList(aggregatedData)) {
      message.error('Address validation failed');
      return;
    }
    if (connection.rpcEndpoint.indexOf('devnet') > -1) {
      message.error(
        'Multisender only supported on mainnet, Switch to Mainnet !!',
      );
      return;
    }

    const dataToProcess = aggregatedData;
    const platformFee = new BigNumber(
      tokenType === TOKEN_TYPES.SOL
        ? MULTI_SENDER_FEE_SOL
        : MULTI_SENDER_FEE_TOKEN,
    )
      .multipliedBy(new BigNumber(LAMPORTS_PER_SOL))
      .multipliedBy(new BigNumber(dataToProcess?.length));

    let calculatedHolderData = null;
    let mintAddress = null;
    let tokenDecimals = null;

    let transaction = null;
    // add sol fee in transaction

    if (tokenType == TOKEN_TYPES.SOL) {
      let totalLamports = new BigNumber(0);
      calculatedHolderData = dataToProcess.map(item => {
        const newAmount = new BigNumber(item.amount).multipliedBy(
          new BigNumber(LAMPORTS_PER_SOL),
        );
        totalLamports = totalLamports.plus(newAmount);
        return {
          target: item.target,
          lamports: newAmount.toString(),
        };
      });

      transaction = await buildMultiSendSolTransaction(
        connection,
        wallet,
        BigInt(totalLamports.toString()),
        BigInt(platformFee.toString()),
      );
    } else if ([TOKEN_TYPES.SPL, TOKEN_TYPES.SPL2022].includes(tokenType)) {
      mintAddress = tokenAddress;
      const tkDetails = await getTokenDetails(connection, mintAddress);

      tokenDecimals = tkDetails?.decimals;

      let totalTokens = new BigNumber(0);
      calculatedHolderData = dataToProcess.map(item => {
        const newAmount = new BigNumber(item.amount).multipliedBy(
          new BigNumber(10).pow(new BigNumber(tokenDecimals)),
        );
        totalTokens = totalTokens.plus(newAmount);
        return {
          target: item.target,
          token_amount: newAmount.toString(),
          lamports: new BigNumber(0).toString(),
        };
      });

      const tokenProgramId =
        tokenType === TOKEN_TYPES.SPL
          ? TOKEN_PROGRAM_ID
          : TOKEN_2022_PROGRAM_ID;

      if (tokenType == TOKEN_TYPES.SPL || tokenType == TOKEN_TYPES.SPL2022) {
        transaction = await buildMultiSendToken2022Transaction(
          connection,
          wallet,
          tokenAddress,
          BigInt(totalTokens.toString()),
          BigInt(platformFee.toString()),
          tokenProgramId,
        );
      }
    }

    const signedTransaction = await wallet.signTransaction(transaction);

    const base64Transaction = Buffer.from(
      signedTransaction.serialize(),
    ).toString('base64');
    setIsSubmission(true);
    const key = 'processing_transaction';
    messageApi.open({
      key,
      type: 'loading',
      duration: 60,
      content:
        'Processing transaction, It may take few seconds to few minutes, details will be available on Manage section after processing !!',
    });
    axios({
      method: 'POST',
      url: `${baseURL}/create_multisend`,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      data: {
        signed_transaction: base64Transaction,
        holders_data: calculatedHolderData,
        asset_type: tokenType,
        mint_address: mintAddress,
        decimals: tokenDetails?.decimals,
        token_name: tokenDetails?.name,
        owner_pubkey: wallet.publicKey.toBase58(),
      },
    })
      .then(res => {
        messageApi.open({
          key,
          type: 'success',
          content:
            'Transaction Successfull, Check Manage section for details !!',
          duration: 10,
        });

        // resetting state after success
        // setTokenType(TOKEN_TYPES.SPL);
        // setTokenAddress("");
        // setTokenDetails(initialTokenDetails);
        // setTokenDetailsFetching(false);
        // setData([]);
        // setAggregatedData([]);
        // setTotalTokenToTransfer(0);
        // setCurrentStep(0);

        return navigate(
          `/solana-multi-sender/manage/${res?.data?.data?.multisender_id}`,
        );
      })
      .catch(err => {
        console.log('error occured', err);
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
        setIsSubmission(false);
      });
  };

  const { isMobile } = useDevice();

  return (
    <>
      <div className={multisenderStyle.formContainer}>
        {contextHolder}
        <h1 className={multisenderStyle.formTitle}>
          <span className={multisenderStyle.pupleText}>MultiSender:</span>
          <span>&nbsp;Distribute your assets</span>
        </h1>
        <div className={multisenderStyle.headerLine}></div>

        {!isMobile && (
          <Steps current={currentStep}>
            {steps.map((step, index) => (
              <Step key={index} title={step.title} />
            ))}
          </Steps>
        )}

        <div style={{ marginTop: '16px' }}>{steps[currentStep].content}</div>

        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <div>
            {currentStep > 0 ? (
              <HyperSButton
                disabled={isUnderMaintain}
                onClick={prevStep}
                text={'Previous'}
              />
            ) : null}
          </div>
          <div>
            {currentStep < steps.length - 1 ? (
              <HyperButton
                disabled={isUnderMaintain}
                onClick={nextStep}
                text={'Next'}
              />
            ) : (
              <>
                {wallet.connected ? (
                  <HyperButton
                    disabled={isSubmission}
                    text={' Distribute Tokens'}
                    onClick={handleTokenDistribute}
                  />
                ) : (
                  <WalletMultiButton>CONNECT</WalletMultiButton>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <div className={multisenderStyle.headerLine}></div>
        <FaqSection faqItems={faqItems} />
      </div>
    </>
  );
};

export default MultisenderForm;
