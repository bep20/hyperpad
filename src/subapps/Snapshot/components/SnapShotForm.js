import React, { useMemo } from 'react';
import Input from 'antd/es/input';
import Card from 'antd/es/card';
import Tooltip from 'antd/es/tooltip';
import Skeleton from 'antd/es/skeleton';
import Radio from 'antd/es/radio';
import { InfoCircleOutlined } from '@ant-design/icons';

import snapshotStyle from '../style/snapshot.module.less';
import { HyperButton } from '../../../components/buttons/HyperButton';
import { snapFilterOptions } from '../../../constants';
import { FaqSection } from '../../../components/faq/Faq';
import { faqItems } from '../../../utils/faqdata';

export const SnapShotForm = ({
  inputMintAddress,
  setInputMintAddress,
  loadToken,
  tokenDetails,
  uriData,
  takeSnaphot,
  isTokenLoading,
  tokenAmount,
  setTokenAmount,
  handleRadioChange,
  isFormInSubmission,
  tokenHoldersCount,
  isHolderLoading,
  inputvalue,
  handleCustomInputChange,
}) => {
  const options = useMemo(
    () => snapFilterOptions(tokenHoldersCount),
    [tokenHoldersCount],
  );
  const IscustomInput = useMemo(() => {
    return tokenAmount?.tokenvalue === 'custom';
  }, [tokenAmount?.tokenvalue]);

  return (
    <>
      <div className={snapshotStyle.form}>
        <div className={snapshotStyle.loadToken}>
          <div className={snapshotStyle.inputBar}>
            <Input
              placeholder='Enter token mint address'
              value={inputMintAddress}
              onChange={event => setInputMintAddress(event.target.value)}
            />
            <HyperButton
              text={isTokenLoading ? 'Loading token...' : 'Load Token'}
              onClick={loadToken}
            />
          </div>
          <div className={snapshotStyle.tokenInfo}>
            <Card>
              {tokenDetails?.ticker && !isTokenLoading ? (
                <div className={snapshotStyle.cardContent}>
                  <div className={snapshotStyle.imageContainer}>
                    <img src={uriData?.image} alt='tokenimage' />
                  </div>
                  <div className={snapshotStyle.textContainer}>
                    <p>Token Name : {tokenDetails?.name}</p>
                    <p>Token Ticker : {tokenDetails?.ticker}</p>
                    <p>Token Description : {uriData?.description}</p>
                    <div className='mt-1 flex'>
                      <p>Number of Holders : </p>
                      <p
                        style={{
                          background: '#d2ffca',
                          paddingInline: '0.5rem',
                          borderRadius: '10px',
                          marginLeft: '0.5rem',
                        }}>
                        {isHolderLoading ? (
                          <span>
                            Loading <span className='animate-dots'></span>
                          </span>
                        ) : (
                          tokenHoldersCount
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Skeleton active={isTokenLoading} />
              )}
            </Card>
          </div>
        </div>
      </div>

      <div className={`${snapshotStyle.takesnapshot} mt-3  `}>
        <Card>
          <div
            className={`${snapshotStyle.cardContent} flex flex-col gap-y-6  `}>
            <div>
              <p>
                Snapshot Data Filtering &nbsp;
                <Tooltip title='Specify the number of top holders you wish to capture or select from the available options. To capture all address keep the input empty !!'>
                  <InfoCircleOutlined />
                </Tooltip>
              </p>

              <div className='flex gap-6 sm:flex-col '>
                <Radio.Group
                  optionType='button'
                  onChange={handleRadioChange}
                  buttonStyle='solid'
                  value={tokenAmount.tokenvalue}>
                  {options.map(option => (
                    <Radio.Button key={option.value} value={option.value}>
                      {option.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
                {IscustomInput && (
                  <Input
                    type='number'
                    className={` border ${
                      !options.some(
                        item => item.value == tokenAmount?.tokenvalue,
                      )
                        ? 'border-purple-700'
                        : ''
                    }`}
                    value={inputvalue}
                    onChange={handleCustomInputChange}
                    style={{
                      width: '120px',
                      backgroundColor: 'white',
                    }}
                  />
                )}
              </div>
            </div>

            <div className={snapshotStyle.formField}>
              <p>
                Minimum Token Holdings &nbsp;
                <Tooltip title='Minimum amount of tokens that holder must hold to be part of snapshot. For snapshot of all holders, add 0 or leave it empty'>
                  <InfoCircleOutlined />
                </Tooltip>
              </p>
              <Input
                size='large'
                allowClear
                type='number'
                placeholder='Enter token amount'
                value={tokenAmount}
                onChange={event => setTokenAmount(event.target.value)}
              />
            </div>
            <HyperButton
              disabled={!tokenDetails?.ticker || isFormInSubmission}
              style={{ width: '200px', marginInline: 'auto' }}
              text='Take Snapshot'
              onClick={takeSnaphot}
            />
          </div>
        </Card>
      </div>
      <div>
        <div className={snapshotStyle.headerLine} />
        <FaqSection faqItems={faqItems} />
      </div>
    </>
  );
};
