import React, { useState, useContext } from 'react';
import message from 'antd/es/message';
import { ExtensionType } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey } from '@solana/web3.js';

import BigNumber from 'bignumber.js';
import { TokenCreationForm22 } from '../components/TokenCreationForm22';
import { SolUtils } from '../../../solana/SolUtils';
import launchpadStyle from '../style/launchpad.module.less';
import { AppContext, getCluster } from '../../../context/AppStore';
import { CreateMint, Token2022Client } from '../utils/token22';
import {
  DEFAULT_EXTENSION_CONFIG,
  DEFAULT_EXTENSION_VALUES,
  DEFAULT_REVOKE,
  DEFAULT_SOCIAL_MEDIA,
  DEFAULT_TOKEN_STATE,
  SUBMISSION_STATE_ENUM,
} from '../constants/data';
import { TokenCreationInfo22 } from '../components/TokenCreationInfo22';
import { NotifyContext } from '../../../context/Notify';
import { FaqSection } from '../../../components/faq/Faq';
import HelmetLayout from '../../../components/HelmetLayout';
import { uploadAndGenerateURL, uploadMetadata } from '../utils/helpers';

const faqItems = [
  {
    key: '1',
    label: 'What is SPL 2022 Token Creator',
    children: (
      <>
        <p>
          The SPL22 Token Creator tool is a user-friendly decentralized
          application (dApp) designed to facilitate the creation of custom
          Solana SPL2022 Tokens without the need for coding skills.
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
          To create a token using the SPL22 Token Creator, you'll need token
          name, symbol, decimals, total supply, token image, description, and
          optional social links. Also Tax details if tax to be collected on each
          transaction
        </p>
      </>
    ),
  },
  {
    key: '3',
    label: 'Can I Tax Tokens using the Solana Token Creator?',
    children: (
      <>
        <p>
          Yes we support tax extension for tax tokens, Just enable tax extension
          and add tax in percent, limit on tax in number of tokens.
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
          Yes, the SPL2022 Token Creator ensures a secure token creation
          process. Users retain full control over their tokens, with no access
          to private keys or assets required during the creation process.
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

const getSPL22MintConfig = ({
  tokenInfo,
  owner,
  extensionConfig,
  extensionValues,
}) => {
  const totalSupply = new BigNumber(tokenInfo.supply)
    .multipliedBy(new BigNumber(10).exponentiatedBy(tokenInfo?.decimals))
    .toString();

  const mintConfig = new CreateMint(
    tokenInfo.name,
    tokenInfo.ticker,
    tokenInfo.metadataURI,
    totalSupply,
    owner,
    owner,
    tokenInfo.decimals,
    true,
  );
  // 1. metadata pointer is for all tokens
  mintConfig.addExtension(ExtensionType.MetadataPointer);

  // adding extensions
  // 1 trasfer tax extension
  if (extensionConfig.transfer_tax) {
    const { configAuthority, feeWithdrawAuthority, feePercent, maxFee } =
      extensionValues?.transfer_tax || {};

    const feeBasisPoints = feePercent * 100;
    const maxFeeCal = BigInt(maxFee * 10 ** tokenInfo?.decimals);
    mintConfig.addExtension(ExtensionType.TransferFeeConfig, {
      feeBasisPoints,
      configAuthority: configAuthority ? new PublicKey(configAuthority) : owner,
      withdrawAuthority: feeWithdrawAuthority
        ? new PublicKey(feeWithdrawAuthority)
        : owner,
      maxFee: maxFeeCal,
    });
  }
  // 2. InterestBearingConfig
  if (extensionConfig.interest_bearing) {
    const { rate } = extensionValues?.interest_bearing || {};
    mintConfig.addExtension(ExtensionType.InterestBearingConfig, {
      rate,
    });
  }
  // 3. PermanentDelegate
  if (extensionConfig?.permanent_deligate) {
    const { deligate } = extensionValues?.permanent_deligate || {};
    mintConfig.addExtension(ExtensionType.PermanentDelegate, {
      address: deligate ? new PublicKey(deligate) : owner,
    });
  }
  // 4. NonTransferable
  if (extensionConfig?.non_transferable) {
    mintConfig.addExtension(ExtensionType.NonTransferable);
  }
  // 5. ImmutableOwner
  if (extensionConfig?.default_state) {
    mintConfig.addExtension(ExtensionType.DefaultAccountState, {
      state: extensionValues?.default_state?.state,
    });
  }

  return mintConfig;
};

export const CreateToken22 = () => {
  const [appStore] = useContext(AppContext);
  const { connection } = useConnection();
  const wallet = useWallet();

  const [notifyApi] = useContext(NotifyContext);

  const [tokenInfo, setTokenInfo] = useState(DEFAULT_TOKEN_STATE);
  const [extensionConfig, setExtensionConfig] = useState(
    DEFAULT_EXTENSION_CONFIG,
  );
  const [extensionValues, setExtensionValues] = useState(
    DEFAULT_EXTENSION_VALUES,
  );
  const [formSubmission, setIsFormSubmission] = useState(
    SUBMISSION_STATE_ENUM.FORM_FILLING,
  );
  const [imageFile, setImageFile] = useState(null);

  const [addressPrefix, setAddressPrefix] = useState(null);
  const [addressSuffix, setAddressSufix] = useState(null);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [threadCount, setThreadCount] = useState(1);
  const [revokeConfig, setRevokeConfig] = useState(DEFAULT_REVOKE);
  const [csAddressChecked, setCsAddressChecked] = useState(true);
  const [contractKeyPair, setContractKeyPair] = useState(null);
  const [socialMediaInfo, setSocialMediaInfo] = useState(DEFAULT_SOCIAL_MEDIA);
  const [isSocialMediaEnabled, setIsSocialMediaEnabled] = useState(true);

  const createNewToken22 = async tkInfo => {
    
    const mintConfig = getSPL22MintConfig({
      tokenInfo: tkInfo,
      owner: wallet.publicKey,
      extensionConfig,
      extensionValues,
    });
    const cluster = getCluster(appStore?.currentNetwork);

    const token22Client = new Token2022Client(connection);

    let mintAccount = null;
    if (csAddressChecked && contractKeyPair) {
      mintAccount = contractKeyPair;
    } else {
      mintAccount = Keypair.generate();
    }

    const customAddressFee = csAddressChecked && contractKeyPair ? true : false;

    const txn = await token22Client.getCreateMintTransaction(
      wallet.publicKey,
      mintAccount.publicKey,
      mintConfig,
      customAddressFee,
      revokeConfig,
    );

    const signature = await SolUtils.sendAndConfirmRawTransactionV1(
      connection,
      txn,
      wallet,
      [mintAccount],
      notifyApi,
      cluster,
    );

    if (!signature) {
      throw new Error('unable to create token');
    }

    return {
      tokenAddress: mintAccount.publicKey.toBase58(),
      signature,
      tokenName: tokenInfo.name,
    };
  };
  const handleTokenSubmission = async () => {
    if (!wallet.connected) {
      message.error('Please connect to wallet to proceed further.');
      return;
    }

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

      await createNewToken22(tkInfo);

      setRevokeConfig(DEFAULT_REVOKE);
      setTokenInfo(DEFAULT_TOKEN_STATE);
      setSocialMediaInfo(DEFAULT_SOCIAL_MEDIA);
      setExtensionConfig(DEFAULT_EXTENSION_CONFIG);
      setExtensionValues(DEFAULT_EXTENSION_VALUES);
      setContractKeyPair(null);
      setAddressPrefix(null);
      setAddressSufix(null);
      setCaseSensitive(false);
      setThreadCount(1);
      setIsSocialMediaEnabled(true);
      setCsAddressChecked(true);
      setImageFile(null);
    } catch (err) {
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
        title='Create SPL22 Tokens with Token Tax Extension: Token creator tool on solana'
        description='Effortlessly generate SPL22 tokens with a built-in token tax extension using our straightforward no-code token generator. Customize token taxes and mint addresses seamlessly. Start creating custom SPL22 tokens today.'
        keywords='SPL22 token creation, token tax extension, Solana token generator, custom token creation, custom token mint address, no-code token creation platform'
      />

      <div className={launchpadStyle.createTokenContainer}>
        <div className={launchpadStyle.creationSection}>
          <TokenCreationForm22
            tokenInfo={tokenInfo}
            setTokenInfo={setTokenInfo}
            formSubmission={formSubmission}
            uploadMetadata={uploadMetadata}
            handleTokenSubmission={handleTokenSubmission}
            uploadAndGenerateURL={uploadAndGenerateURL}
            extensionConfig={extensionConfig}
            setExtensionConfig={setExtensionConfig}
            extensionValues={extensionValues}
            setExtensionValues={setExtensionValues}
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
          <TokenCreationInfo22 />
        </div>
        <div>
          <div className={launchpadStyle.headerLine} />
          <FaqSection faqItems={faqItems} />
        </div>
      </div>
    </>
  );
};
