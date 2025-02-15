import React, { useEffect, useState } from 'react';
import TokenDetailsTabs from '../components/TokenDetailsTabs';
import { TokenMint } from '../components/TokenMint';
import { TokenMintAuthority } from '../components/TokenMintAuthority';
import { TokenFreezeAuthority } from '../components/TokenFreezeAuthority';
import { TokenMetadata } from '../components/TokenMetadata';
import launchpadStyle from '../style/launchpad.module.less';
import { FaqSection } from '../../../components/faq/Faq';
import { faqItems } from '../utils/faqdata';
import { TaxAuthority } from '../components/TaxAuthority';
import { WithdrawTaxAuthority } from '../components/WithdrawTaxAuthority';

const TOKEN_DETAILS = {
  decimals: null,
  freezeAuthority: null,
  mintAuthority: null,
  supply: null,
  isInitialized: null,
  mintAccountOwner: null,
  updateAuthority: null,
  mint: null,
  creators: null,
  name: null,
  sellerFeeBasisPoints: null,
  symbol: null,
  uri: null,
  isMutable: null,
  uriData: null,
};

const Mint = ({ tabType }) => {
  const [tokenData, setTokenData] = useState(TOKEN_DETAILS);
  const [uriData, setURIData] = useState({});

  useEffect(() => {
    setTokenData(TOKEN_DETAILS);
    setURIData({});
  }, [tabType]);
  let content;

  if (tabType === 'mint') {
    content = (
      <div className={launchpadStyle.mintContainer}>
        <div className={launchpadStyle.tokenPageTitleContainer}>
          <h2 className={launchpadStyle.minFormTitle}>
            <span className={launchpadStyle.highlightText}>Manage:&nbsp;</span>
            View & Mint Token
          </h2>
          <div className={launchpadStyle.headerLine} />
        </div>
        <div className={launchpadStyle.mintSubcontainer}>
          <div>
            <TokenDetailsTabs
              key={tabType}
              tabDescription='Mint Token'
              tokenData={tokenData}
              uriData={uriData}
              setURIData={setURIData}
              setTokenData={setTokenData}
              tabType={tabType}
            />
          </div>
          <div>
            <TokenMint
              tokenData={tokenData}
              uriData={uriData}
              className={launchpadStyle.increasedWidth}
            />
          </div>
        </div>
        <div className={launchpadStyle.headerLine} />
        <FaqSection faqItems={faqItems['mint']} />
      </div>
    );
  } else if (tabType === 'mint-authority') {
    content = (
      <div className={launchpadStyle.mintContainer}>
        <div className={launchpadStyle.tokenPageTitleContainer}>
          <h2 className={launchpadStyle.minFormTitle}>
            <span className={launchpadStyle.highlightText}>Manage:&nbsp;</span>
            View & Mint Authority
          </h2>
          <div className={launchpadStyle.headerLine} />
        </div>
        <div className={launchpadStyle.mintSubcontainer}>
          <div>
            <TokenDetailsTabs
              key={tabType}
              tabDescription='Mint Authority'
              tokenData={tokenData}
              uriData={uriData}
              setURIData={setURIData}
              setTokenData={setTokenData}
              tabType={tabType}
            />
          </div>
          <div>
            <TokenMintAuthority
              tokenData={tokenData}
              uriData={uriData}
              className={launchpadStyle.increasedWidth}
            />
          </div>
        </div>
        <div className={launchpadStyle.headerLine} />
        <FaqSection faqItems={faqItems['mint-authority']} />
      </div>
    );
  } else if (tabType === 'freeze-authority') {
    content = (
      <div className={launchpadStyle.mintContainer}>
        <div className={launchpadStyle.tokenPageTitleContainer}>
          <h2 className={launchpadStyle.minFormTitle}>
            <span className={launchpadStyle.highlightText}>Manage:&nbsp;</span>
            View & Freeze Authority
          </h2>
          <div className={launchpadStyle.headerLine} />
        </div>
        <div className={launchpadStyle.mintSubcontainer}>
          <div>
            <TokenDetailsTabs
              key={tabType}
              tabDescription='Freeze Authority'
              tokenData={tokenData}
              uriData={uriData}
              setURIData={setURIData}
              setTokenData={setTokenData}
              tabType={tabType}
            />
          </div>
          <div>
            <TokenFreezeAuthority
              tokenData={tokenData}
              uriData={uriData}
              className={launchpadStyle.increasedWidth}
            />
          </div>
        </div>
        <div className={launchpadStyle.headerLine} />
        <FaqSection faqItems={faqItems['freeze-authority']} />
      </div>
    );
  } else if (tabType === 'update-metadata') {
    content = (
      <div className={launchpadStyle.tokendetailscontainer}>
        <div className={launchpadStyle.tokenPageTitleContainer}>
          <h2 className={launchpadStyle.minFormTitle}>
            <span className={launchpadStyle.highlightText}>Manage:&nbsp;</span>
            Update Metadata
          </h2>
          <div className={launchpadStyle.headerLine} />
        </div>
        <TokenDetailsTabs
          key={tabType}
          tabDescription='Update Metadata'
          tokenData={tokenData}
          uriData={uriData}
          setURIData={setURIData}
          setTokenData={setTokenData}
        />
        <div className={launchpadStyle.tokenmetadatacontainer}>
          <TokenMetadata tokenData={tokenData} uriData={uriData} />
        </div>
        <div className={launchpadStyle.headerLine} />
        <FaqSection faqItems={faqItems['update-metadata']} />
      </div>
    );
  } else if (tabType === 'tax-authority') {
    content = (
      <div className={launchpadStyle.mintContainer}>
        <div className={launchpadStyle.tokenPageTitleContainer}>
          <h2 className={launchpadStyle.minFormTitle}>
            <span className={launchpadStyle.highlightText}>Manage:&nbsp;</span>
            View & Tax Authority
          </h2>
          <div className={launchpadStyle.headerLine} />
        </div>
        <div className={launchpadStyle.mintSubcontainer}>
          <div>
            <TokenDetailsTabs
              key={tabType}
              tabDescription='Tax Authority'
              tokenData={tokenData}
              uriData={uriData}
              setURIData={setURIData}
              setTokenData={setTokenData}
              tabType={tabType}
            />
          </div>
          <div>
            <TaxAuthority
              tokenData={tokenData}
              className={launchpadStyle.increasedWidth}
            />
          </div>
        </div>
        <div className={launchpadStyle.headerLine} />
        <FaqSection faqItems={faqItems['tax-authority']} />
      </div>
    );
  } else if (tabType === 'tax-withdraw-authority') {
    content = (
      <div className={launchpadStyle.mintContainer}>
        <div className={launchpadStyle.tokenPageTitleContainer}>
          <h2 className={launchpadStyle.minFormTitle}>
            <span className={launchpadStyle.highlightText}>Manage:&nbsp;</span>
            View & Tax Withdraw Authority
          </h2>
          <div className={launchpadStyle.headerLine} />
        </div>
        <div className={launchpadStyle.mintSubcontainer}>
          <div>
            <TokenDetailsTabs
              key={tabType}
              tabDescription='Tax With Authority'
              tokenData={tokenData}
              uriData={uriData}
              setURIData={setURIData}
              setTokenData={setTokenData}
              tabType={tabType}
            />
          </div>
          <div>
            <WithdrawTaxAuthority
              tokenData={tokenData}
              className={launchpadStyle.increasedWidth}
            />
          </div>
        </div>
        <div className={launchpadStyle.headerLine} />
        <FaqSection faqItems={faqItems['tax-withdraw-authority']} />
      </div>
    );
  }
  return <div>{content}</div>;
};

export default Mint;
