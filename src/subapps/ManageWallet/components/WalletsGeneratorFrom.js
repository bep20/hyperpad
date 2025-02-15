/* eslint-disable react/no-array-index-key */
/* eslint-disable no-shadow */
/* eslint-disable import/no-webpack-loader-syntax */
import React, { useState } from 'react';
import Input from 'antd/es/input/Input';
import { useWallet } from '@solana/wallet-adapter-react';
import message from 'antd/es/message';
import Pagination from 'antd/es/pagination';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import Worker from 'worker-loader!../../../workers/keyPairGenerator';
import NumberInput from '../../../components/NumberInput';
import { HyperSButton } from '../../../components/buttons/HyperSButton';
import { CopyString } from '../../LaunchPad/components/CopyString';
import { HyperButton } from '../../../components/buttons/HyperButton';
import managewallet from '../style/managewallet.module.less';
import { WORKERS_TO_GEN_KEYPAIR } from '../../../constants';
import useDevice from '../../../hooks/useDevice';
import { FaqSection } from '../../../components/faq/Faq';
import { faqItems } from '../utils/faqdataqna';

export const WalletsGeneratorForm = () => {
  const [numberOfWallets, setNumberOfWallets] = useState(1);
  const [generatedWallets, setGeneratedWallets] = useState([]);
  const [page, setPage] = useState(1);
  const [progress, setProgress] = useState(0);
  const [intialgenrate, setInitialgenrate] = useState(0);
  const [generate, setGenerate] = useState(false);
  const { isMobile } = useDevice();

  const wallet = useWallet();

  const generateWallets = async () => {
    if (!wallet?.connected) {
      message.error('Please Connect to a wallet first');
      return;
    }

    try {
      setGenerate(true);
      setInitialgenrate(numberOfWallets);
      setProgress(0);
      setPage(1);
      const totalGeneratedWallets = [];
      //   const st = new Date().getTime();

      for (let i = 0; i < WORKERS_TO_GEN_KEYPAIR; i++) {
        const worker = new Worker(Worker);
        worker.postMessage({
          numberOfWallets,
        });
        // eslint-disable-next-line consistent-return
        worker.onmessage = e => {
          const { wallet } = e.data || {};
          totalGeneratedWallets.push(wallet);

          if (totalGeneratedWallets.length > numberOfWallets) {
            setGenerate(false);
            // const ed = new Date().getTime();
            // console.log('time consumed', `${ed - st} ms`);
            return worker.terminate();
          }
          setProgress(totalGeneratedWallets.length);
          setGeneratedWallets([...totalGeneratedWallets]);
        };
      }
    } catch (error) {
      console.error('Error generating wallets:', error);
      setGenerate(false);
    }
  };
  const walletsPerPage = 5;

  const indexOfLastWallet = page * walletsPerPage;
  const indexOfFirstWallet = indexOfLastWallet - walletsPerPage;
  const currentWallets = generatedWallets.slice(
    indexOfFirstWallet,
    indexOfLastWallet,
  );
  const handleCopyAll = wallet => {
    const { address, privateKeyArray, mnemonic, privateKeyBase58 } = wallet;
    const copyText = `{"address":"${address}","PrivateKey":"${privateKeyArray}","Mnemonic":"${mnemonic}","Base58":"${privateKeyBase58}"}`;
    navigator.clipboard.writeText(copyText).then(() => {
      message.success('Copied !!');
    });
  };

  const csvHeaders = [
    { label: 'Address', key: 'address' },
    { label: 'Mnemonic', key: 'mnemonic' },
    { label: 'Private Key (Array)', key: 'privateKeyArray' },
    { label: 'Base58 Private Key', key: 'privateKeyBase58' },
  ];

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(generatedWallets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Wallets');
    XLSX.writeFile(workbook, 'generated_wallets.xlsx');
  };
  const handleDownloadJson = () => {
    const jsonData = JSON.stringify(generatedWallets, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_wallets.json';
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className={managewallet.formContainer}>
        <h1 className={managewallet.formTitle}>
          <span>&nbsp;Batch Generate SOL Wallet Addresses</span>
        </h1>
        <div className={managewallet.headerLine} />
        <div className={managewallet.walletformcontainer}>
          <div className={managewallet.fieldContainer}>
            <p className={managewallet.fieldLabel}>
              Number of Generated Wallet Addresses
            </p>
            <NumberInput
              value={numberOfWallets}
              onChange={val => setNumberOfWallets(parseInt(val))}
            />
          </div>
          <div className={managewallet.actionButtonContainer}>
            <HyperButton
              btnSize={isMobile ? 'small-btn' : 'medium-btn'}
              style={{ width: '100%' }}
              disabled={!numberOfWallets || generate}
              onClick={generateWallets}
              text={
                // eslint-disable-next-line no-nested-ternary
                generate
                  ? 'Generating...'
                  : generatedWallets.length > 0
                    ? 'Regenerate'
                    : 'Generate Now'
              }
            />
          </div>
        </div>

        {generatedWallets.length > 0 && (
          <div className='flex flex-col gap-y-8'>
            <div className='flex flex-wrap items-end justify-between gap-3 sm:flex-row-reverse'>
              <h4>
                Progress : {progress}/{intialgenrate}
              </h4>

              <div className={managewallet.downloadButtons}>
                <HyperSButton
                  btnSize='small-btn'
                  text='Download Json'
                  onClick={handleDownloadJson}
                />
                <CSVLink
                  data={generatedWallets}
                  headers={csvHeaders}
                  filename='generated_wallets.csv'
                  className='btn btn-primary'>
                  <HyperSButton btnSize='small-btn' text='Download CSV' />
                </CSVLink>
                <HyperSButton
                  btnSize='small-btn'
                  text='Download Excel'
                  onClick={handleDownloadExcel}
                />
              </div>
            </div>

            {currentWallets.map((wallet, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div className='flex flex-col border gap-y-4 p-4' key={index}>
                <div className='flex items-center justify-between'>
                  <h6>Wallet {indexOfFirstWallet + index + 1}</h6>

                  <HyperSButton
                    btnSize='xsmall-btn'
                    onClick={() => handleCopyAll(wallet)}
                    text='Copy '
                  />
                </div>
                <hr />
                <Row label='Address' value={wallet.address} />
                <Row label='Mnemonic Phrase' value={wallet.mnemonic} />
                <Row label='Private Key' value={wallet.privateKeyArray} />
                <Row
                  label='Base58 Private Key'
                  value={wallet.privateKeyBase58}
                />
              </div>
            ))}
            <Pagination
              current={page}
              onChange={page => setPage(page)}
              total={generatedWallets.length}
              pageSize={walletsPerPage}
              showSizeChanger={false}
              className='text-center'
            />
          </div>
        )}
      </div>

      <div>
        <div className={managewallet.headerLine} />
        <FaqSection faqItems={faqItems} />
      </div>
    </>
  );
};

const Row = ({ label, value }) => (
  <div className='flex items-start justify-between gap-x-8 sm:gap-x-4 bg-[#f8f8f8] px-4 py-2'>
    <div className='flex flex-1 items-center gap-x-4'>
      <strong className='flex-[1] break-all'>{label}</strong>
      <div className='m-0 flex-[3] break-all'>{value}</div>
    </div>
    <CopyString dataToCopy={value} />
  </div>
);
