import React from 'react';
import Radio from 'antd/es/radio';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import { useWallet } from '@solana/wallet-adapter-react';
import Tooltip from 'antd/es/tooltip';
import { InfoCircleOutlined } from '@ant-design/icons';
import { DEFAULT_STATE_OPTIONS } from '../constants/data';
import launchpadStyle from '../style/launchpad.module.less';

// const EXTENSION_CONFIG = {
//     transfer_tax: false,
//     interest_bearing: false,
//     default_state: false,
//     permanent_deligate: false,
//     non_transferable: false,
//   };

export const SplExtensions = ({
  extensionConfig,
  setExtensionConfig,
  extensionValues,
  setExtensionValues,
}) => {
  const wallet = useWallet();
  return (
    <div style={{ width: '100%', marginTop: '0rem', marginBottom: '1rem' }}>
      <div className={`${launchpadStyle.headerLine} mt-[0rem] mb-[1rem]`} />
      <div className='flex items-center mt-4 gap-x-2'>
        <p
          style={{
            marginBlock: '0.5rem',
            fontSize: '1.25rem',
            fontWeight: '400',
          }}>
          Add SPL22 Extensions &nbsp;
          <Tooltip title='SPL22 extensions, related to tax and interest'>
            <InfoCircleOutlined />
          </Tooltip>
        </p>
      </div>
      <div>
        <div className='mb-2'>
          <Radio
            size='large'
            checked={extensionConfig?.transfer_tax}
            onClick={event => {
              setExtensionConfig(prev => ({
                ...prev,
                transfer_tax: !prev?.transfer_tax,
              }));
              setExtensionValues(prev => ({
                ...prev,
                transfer_tax: {
                  ...prev.transfer_tax,
                  feeWithdrawAuthority: wallet?.publicKey?.toBase58(),
                  configAuthority: wallet?.publicKey?.toBase58(),
                },
              }));
            }}>
            Transfer Tax &nbsp;
            <Tooltip title='Enable to add tax on token transfers.'>
              <InfoCircleOutlined />
            </Tooltip>
          </Radio>

          {extensionConfig?.transfer_tax && (
            <div className='mb-4'>
              <div
                className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}>
                <p className={launchpadStyle.fieldLabel}>
                  Fee (%) &nbsp;
                  <Tooltip title='Transfer tax in percent. ex: Enter 12 for 12% tax'>
                    <InfoCircleOutlined />
                  </Tooltip>
                </p>
                <Input
                  className={launchpadStyle.fieldInput}
                  size='large'
                  allowClear
                  placeholder='Fee'
                  value={extensionValues?.transfer_tax?.feePercent}
                  onChange={event => {
                    setExtensionValues(prev => ({
                      ...prev,
                      transfer_tax: {
                        ...prev.transfer_tax,
                        feePercent: event.target.value,
                      },
                    }));
                  }}
                />
              </div>
              <div
                className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}>
                <p className={launchpadStyle.fieldLabel}>
                  Max Fee &nbsp;
                  <Tooltip title='Maximum transfer tax in terms of token. This is cap on transaction tax that you want to apply. ex. Enter 1200 for 1200 tokens as maxiumum fee'>
                    <InfoCircleOutlined />
                  </Tooltip>
                </p>
                <Input
                  className={launchpadStyle.fieldInput}
                  size='large'
                  allowClear
                  placeholder='Max Fee'
                  value={extensionValues?.transfer_tax?.maxFee}
                  onChange={event => {
                    setExtensionValues(prev => ({
                      ...prev,
                      transfer_tax: {
                        ...prev.transfer_tax,
                        maxFee: event.target.value,
                      },
                    }));
                  }}
                />
              </div>
              <div
                className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}>
                <p className={launchpadStyle.fieldLabel}>
                  Withdraw Authority &nbsp;
                  <Tooltip title='Address which will have the authority to collect the transaction fee. Transaction fee is not automatically collected, but it needs to be done manually and only this address will be able to collect the fee.'>
                    <InfoCircleOutlined />
                  </Tooltip>
                </p>
                <Input
                  className={launchpadStyle.fieldInput}
                  size='large'
                  allowClear
                  placeholder='Withdraw Authority'
                  value={extensionValues?.transfer_tax?.feeWithdrawAuthority}
                  onChange={event => {
                    setExtensionValues(prev => ({
                      ...prev,
                      transfer_tax: {
                        ...prev.transfer_tax,
                        feeWithdrawAuthority: event.target.value,
                      },
                    }));
                  }}
                />
              </div>
              <div
                className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}>
                <p className={launchpadStyle.fieldLabel}>
                  Config Authority &nbsp;
                  <Tooltip title='Address which will have the authority to change the fee configuration'>
                    <InfoCircleOutlined />
                  </Tooltip>
                </p>
                <Input
                  className={launchpadStyle.fieldInput}
                  size='large'
                  allowClear
                  placeholder='Config Authority'
                  value={extensionValues?.transfer_tax?.configAuthority}
                  onChange={event => {
                    setExtensionValues(prev => ({
                      ...prev,
                      transfer_tax: {
                        ...prev.transfer_tax,
                        configAuthority: event.target.value,
                      },
                    }));
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className='mb-2'>
          <Radio
            checked={extensionConfig?.interest_bearing}
            onClick={event => {
              setExtensionConfig(prev => ({
                ...prev,
                interest_bearing: !prev?.interest_bearing,
              }));
            }}>
            Interest Bearing &nbsp;
            <Tooltip title='Enable to set an interest rate on your token'>
              <InfoCircleOutlined />
            </Tooltip>
          </Radio>
          {extensionConfig?.interest_bearing && (
            <div className='mb-4'>
              <div
                className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}>
                <p className={launchpadStyle.fieldLabel}>
                  Rate &nbsp;
                  <Tooltip title='Interest rate in percent. ex: Enter 12 for 12% rate'>
                    <InfoCircleOutlined />
                  </Tooltip>
                </p>
                <Input
                  className={launchpadStyle.fieldInput}
                  size='large'
                  allowClear
                  placeholder='Rate'
                  value={extensionValues?.interest_bearing?.rate}
                  onChange={event => {
                    setExtensionValues(prev => ({
                      ...prev,
                      interest_bearing: {
                        rate: event.target.value,
                      },
                    }));
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* <div className="mb-2">
          <Radio
            checked={extensionConfig?.default_state}
            onClick={(event) => {
              setExtensionConfig((prev) => ({
                ...prev,
                default_state: !prev?.default_state,
              }));
            }}
          >
            Default Account State
          </Radio>
          {extensionConfig?.default_state && (
            <div className="mb-4">
              <div
                className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}
              >
                <p className={launchpadStyle.fieldLabel}>Account State</p>
                <Select
                  size="large"
                  options={DEFAULT_STATE_OPTIONS}
                  value={extensionValues?.default_state?.state}
                  onSelect={(val) => {
                    setExtensionValues((prev) => ({
                      ...prev,
                      default_state: {
                        state: val,
                      },
                    }));
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-2">
          <Radio
            checked={extensionConfig?.permanent_deligate}
            onClick={(event) => {
              setExtensionConfig((prev) => ({
                ...prev,
                permanent_deligate: !prev?.permanent_deligate,
              }));
              setExtensionValues((prev) => ({
                ...prev,
                permanent_deligate: {
                  ...prev.permanent_deligate,
                  deligate: wallet?.publicKey?.toBase58(),
                },
              }));
            }}
          >
            Permanent Delegate
          </Radio>
          {extensionConfig?.permanent_deligate && (
            <div className="mb-4">
              <div
                className={`${launchpadStyle.fieldContainer} ${launchpadStyle.fullWidthField}`}
              >
                <p className={launchpadStyle.fieldLabel}>Deligate</p>
                <Input
                  className={launchpadStyle.fieldInput}
                  size="large"
                  allowClear
                  placeholder="Deligate Address"
                  value={extensionValues?.permanent_deligate?.deligate}
                  onChange={(event) => {
                    setExtensionValues((prev) => ({
                      ...prev,
                      permanent_deligate: {
                        deligate: event.target.value,
                      },
                    }));
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mb-2">
          <Radio
            checked={extensionConfig?.non_transferable}
            onClick={(event) => {
              setExtensionConfig((prev) => ({
                ...prev,
                non_transferable: !prev?.non_transferable,
              }));
            }}
          >
            Non-Transferable
          </Radio>
        </div> */}
      </div>
    </div>
  );
};
