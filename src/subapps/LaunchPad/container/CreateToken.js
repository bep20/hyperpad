import React, { useState, useContext, useEffect } from 'react';
import { Keypair } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import message from 'antd/es/message';

import BigNumber from 'bignumber.js';
import { TokenCreationForm } from '../components/TokenCreationForm';
import { TokenCreationInfo } from '../components/TokenCreationInfo';
import launchpadStyle from '../style/launchpad.module.less';
import { AppContext, getCluster } from '../../../context/AppStore';
import { NotifyContext } from '../../../context/Notify';
import {
  DEFAULT_REVOKE,
  DEFAULT_TOKEN_STATE,
  SUBMISSION_STATE_ENUM,
} from '../constants/data';
import { CreateMintV1, TokenV1Client } from '../utils/token';
import { SolUtils } from '../../../solana/SolUtils';
import { FaqSection } from '../../../components/faq/Faq';
import { Link } from 'react-router-dom';
import HelmetLayout from '../../../components/HelmetLayout';
import { DEFAULT_SOCIAL_MEDIA } from '../constants/data';
import { uploadAndGenerateURL, uploadMetadata } from '../utils/helpers';

const faqItems = [
  {
    key: '1',
    label: 'What is the SPL Token Creator tool?',
    children: (
      <>
        <p>
          The SPL Token Creator tool is a user-friendly decentralized
          application (dApp) designed to facilitate the creation of custom
          Solana SPL Tokens without the need for coding skills.
        </p>
        <p>
          All this process is faster and cheaper that any other platform as it
          is automatically done.
        </p>
      </>
    ),
  },
  {
    key: '2',
    label:
      'What information do I need to provide when using the Solana Token Creator?',
    children: (
      <>
        <p>
          To create a token using the SPL Token Creator, you'll need token name,
          symbol, decimals, total supply, token image, description, and optional
          social links.
        </p>
      </>
    ),
  },
  {
    key: '3',
    label: 'Can I Tax Tokens using the Solana Token Creator?',
    children: (
      <>
        <p>Yes we support both SPL and SPL22 tokens.</p>
        <p>
          You can create SP2022 / tax tokens here :{' '}
          <Link to='/solana-token-manager/create-spl-token-2022'>
            SPL22 / tax tokens
          </Link>
        </p>
      </>
    ),
  },
  {
    key: '4',
    label: 'Is it Safe to Create token here ?',
    children: (
      <>
        <p>
          Yes, the SPL Token Creator ensures a secure token creation process.
          Users retain full control over their tokens, with no access to private
          keys or assets required during the creation process.
        </p>
      </>
    ),
  },
  {
    key: '5',
    label: 'How much time does it take to create a token',
    children: (
      <p>
        The time of your Token Creation depends on the TPS Status of Solana. It
        usually takes just a few seconds and maximum it can go up to 60seconds
        after submitting the transaction.
      </p>
    ),
  },
  {
    key: '6',
    label: 'How much does it cost to create a token',
    children: (
      <p>
        The token creation currently cost 0.05 Sol, which is cheapest among any
        other platform.
      </p>
    ),
  },
  {
    key: '7',
    label: 'How to create custom prefix address of my token',
    children: (
      <p>
        Enable Create custom address toggle and enter the prefix that you want
        your address to contain. Our program will generate custom address and
        ask you to confirm before creating the token.
      </p>
    ),
  },
  {
    key: '8',
    label: 'Does custom mint address cost extra?',
    children: (
      <p>
        It doesn't cost you anything extra, we have standard 0.05sol for token
        creation.
      </p>
    ),
  },
];

const getMintConfig = ({ tokenInfo, owner }) => {
  const totalSupply = new BigNumber(tokenInfo.supply)
    .multipliedBy(new BigNumber(10).exponentiatedBy(tokenInfo?.decimals))
    .toString();

  const mintConfig = new CreateMintV1(
    tokenInfo?.name,
    tokenInfo?.ticker,
    tokenInfo?.metadataURI,
    totalSupply,
    owner,
    owner,
    tokenInfo?.decimals,
    true,
  );

  return mintConfig;
};

export const CreateToken = () => {
  const [appStore, dispatchAppStore] = useContext(AppContext);
  const [notifyApi] = useContext(NotifyContext);

  const [tokenInfo, setTokenInfo] = useState(DEFAULT_TOKEN_STATE);
  const [formSubmission, setIsFormSubmission] = useState(
    SUBMISSION_STATE_ENUM.FORM_FILLING,
  );
  const [imageFile, setImageFile] = useState(null);
  const [addressPrefix, setAddressPrefix] = useState(null);
  const [addressSuffix, setAddressSufix] = useState(null);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [threadCount, setThreadCount] = useState(1);
  const [revokeConfig, setRevokeConfig] = useState(DEFAULT_REVOKE);
  const [socialMediaInfo, setSocialMediaInfo] = useState(DEFAULT_SOCIAL_MEDIA);
  const [isSocialMediaEnabled, setIsSocialMediaEnabled] = useState(true);

  const [csAddressChecked, setCsAddressChecked] = useState(true);
  const [contractKeyPair, setContractKeyPair] = useState(null);

  const Connection = useConnection();
  const { connection } = Connection;
  const wallet = useWallet();

  const createNewToken = async tkInfo => {
    const mintConfig = getMintConfig({
      tokenInfo: tkInfo,
      owner: wallet.publicKey,
    });

    const cluster = getCluster(appStore?.currentNetwork);

    const tokenClient = new TokenV1Client(connection);
    let mintAccount = null;

    if (csAddressChecked && contractKeyPair) {
      mintAccount = contractKeyPair;
    } else {
      mintAccount = Keypair.generate();
    }

    const customAddressFee = !!(csAddressChecked && contractKeyPair);

    const mintTxn = await tokenClient.getCreateMintTransaction(
      wallet.publicKey,
      mintAccount.publicKey,
      mintConfig,
      customAddressFee,
      revokeConfig,
    );

    const signature = await SolUtils.sendAndConfirmRawTransactionV1(
      connection,
      mintTxn,
      wallet,
      [mintAccount],
      notifyApi,
      cluster,
    );

    return {
      tokenAddress: mintAccount.publicKey,
      signature,
      tokenName: tokenInfo.name,
    };
  };
  const handleTokenSubmission = async () => {
    if (!wallet.connected) {
      message.error('Please connect to wallet to proceed further.');
      return;
    }
    // perform all the validation here..

    try {
      let tkInfo = { ...tokenInfo };
      if (imageFile) {
        setIsFormSubmission(SUBMISSION_STATE_ENUM.FILE_UPLOADING);
        const fileUrl = await uploadAndGenerateURL(imageFile);
        tkInfo = {
          ...tkInfo,
          imageURL: fileUrl,
        };
      }

      setIsFormSubmission(SUBMISSION_STATE_ENUM.METADATA_UPLOADING);

      const metadatUrl = await uploadMetadata(tkInfo, socialMediaInfo);
      tkInfo = {
        ...tkInfo,
        metadataURI: metadatUrl,
      };

      setIsFormSubmission(SUBMISSION_STATE_ENUM.TOKEN_CREATING);
      await createNewToken(tkInfo);
      setTokenInfo(DEFAULT_TOKEN_STATE);
      setContractKeyPair(null);
      setAddressPrefix(null);
      setAddressSufix(null);
      setCaseSensitive(false);
      setThreadCount(1);
      setIsSocialMediaEnabled(true);
      setSocialMediaInfo(DEFAULT_SOCIAL_MEDIA);
      setRevokeConfig(DEFAULT_REVOKE);
      setCsAddressChecked(true);
      setImageFile(null);
    } catch (err) {
      console.error('err', err);
      message.error(
        'Unable to create token, Please contact team if issue persists!!',
      );
    } finally {
      setIsFormSubmission(SUBMISSION_STATE_ENUM.FORM_FILLING);
    }
  };
  return (
    <>
      <HelmetLayout
        title='Create Custom SPL Tokens on Solana: Token Generator tool on Solana'
        description='Create your own Solana Token (SPL, SPL22) without coding. Update token metadata, supply, and logo and mint tokens. Solana token creator. Solana SPL Generator and minter. Generate tokens with custom mint addresses effortlessly with just a few clicks.'
        keywords='Solana SPL token creation, custom token generator, Solana token minting, no-code spl token creation, Solana blockchain tools, Solana tokenization platform, mint address customization, Solana token utilities'
      />

      <div className={launchpadStyle.createTokenContainer}>
        <div className={launchpadStyle.creationSection}>
          <TokenCreationForm
            tokenInfo={tokenInfo}
            formSubmission={formSubmission}
            setTokenInfo={setTokenInfo}
            uploadMetadata={uploadMetadata}
            handleTokenSubmission={handleTokenSubmission}
            uploadAndGenerateURL={uploadAndGenerateURL}
            contractKeyPair={contractKeyPair}
            setContractKeyPair={setContractKeyPair}
            csAddressChecked={csAddressChecked}
            setCsAddressChecked={setCsAddressChecked}
            addressPrefix={addressPrefix}
            setAddressPrefix={setAddressPrefix}
            addressSuffix={addressSuffix}
            setAddressSufix={setAddressSufix}
            caseSensitive={caseSensitive}
            setCaseSensitive={setCaseSensitive}
            threadCount={threadCount}
            setThreadCount={setThreadCount}
            revokeConfig={revokeConfig}
            setRevokeConfig={setRevokeConfig}
            socialMediaInfo={socialMediaInfo}
            setSocialMediaInfo={setSocialMediaInfo}
            isSocialMediaEnabled={isSocialMediaEnabled}
            setIsSocialMediaEnabled={setIsSocialMediaEnabled}
            imageFile={imageFile}
            setImageFile={setImageFile}
          />
          <TokenCreationInfo />
        </div>
        <div>
          <div className={launchpadStyle.headerLine} />
          <FaqSection faqItems={faqItems} />
        </div>
      </div>
    </>
  );
};
