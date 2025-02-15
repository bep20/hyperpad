import React, { useState } from 'react';
import bs58 from 'bs58';

import managewallet from '../style/managewallet.module.less';
import { FaqSection } from '../../../components/faq/Faq';
import { faqItems } from '../utils/faqvanityaddress';
import { Walletaddress } from '../../../components/Walletaddress';
import { CopyString } from '../../LaunchPad/components/CopyString';

export const VanityAddressForm = () => {
  const [contractKeyPair, setContractKeyPair] = useState(null);

  return (
    <div className={managewallet.formContainer}>
      <h1 className={managewallet.formTitle}>
        <span>&nbsp;Custom Wallet Address Generator</span>
      </h1>
      <div className={managewallet.headerLine} />
      <Walletaddress
        context='vanity'
        contractKeyPair={contractKeyPair}
        setContractKeyPair={setContractKeyPair}
        doesFieldDisabled={false}
        className='customAddressContainers'
      />

      {contractKeyPair && (
        <div className='flex flex-col  border border-gray-300 rounded-lg p-4 mx-auto mt-4 '>
          <div className='flex items-center  p-1 rounded-lg'>
            <span className='flex-shrink-0 mr-2 font-medium'>
              Wallet Address:
            </span>
            <div className='flex items-center '>
              <CopyString
                style={{
                  background: '#d2ffca',
                }}
                data={contractKeyPair.publicKey?.toBase58()}
                dataToCopy={contractKeyPair.publicKey?.toBase58()}
              />
            </div>
          </div>
          <div className='flex items-center  p-1 rounded-lg'>
            <span className='flex-shrink-0 mr-2 font-medium'>
              Wallet Privatekey:
            </span>
            <div className='flex items-center '>
              <CopyString
                style={{
                  background: '#d2ffca',
                }}
                data={bs58.encode(Buffer.from(contractKeyPair.secretKey))}
                dataToCopy={bs58.encode(Buffer.from(contractKeyPair.secretKey))}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <div className={managewallet.headerLine} />
        <FaqSection faqItems={faqItems} />
      </div>
    </div>
  );
};
