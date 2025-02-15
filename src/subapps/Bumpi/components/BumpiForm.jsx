import React from 'react';
import Radio from 'antd/es/radio';

import {
  PRIORITY_FEE_SPEED,
  PRIORITY_FEE_TABS,
  TX_AMOUNT_TABS,
} from '../../../constants';
import NumberInput from '../../../components/NumberInput';
import dayjs from 'dayjs';
import Tooltip  from 'antd/es/tooltip';
import { InfoCircleOutlined } from '@ant-design/icons';
import { BOT_MAX_RATE, BOT_MIN_RATE } from '../utils/helpers';

const getFormattedTime = (txnCount, txnRate) => {
    if(!(txnRate>0)){return ""}
    const diffInMilliseconds = Math.floor(txnCount * 60 * 1000 / txnRate);

    const diffInSeconds = Math.floor(diffInMilliseconds / (1000)); // Total minutes
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60)); // Total minutes
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // Total hours
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)); // Total days

    // Calculate the remaining hours and minutes after extracting days and hours
    const remainingHours = diffInHours % 24;
    const remainingMinutes =( diffInMinutes % 60 )+ (diffInSeconds % 60 ? 1 : 0);

    if (diffInDays > 0) {
        return `${diffInDays} days, ${remainingHours} hours`;
    } else if (diffInHours > 0) {
        return `${diffInHours} hours, ${remainingMinutes} minutes`;
    } else {
        return `${remainingMinutes} minutes`;
    }
}


const BumpiForm = ({ formData, setFormData }) => {
  const handleFormDataChange = ({ key, value }) => {
    setFormData({ ...formData, [key]: value });
  };
  return (
    <div className='grid grid-cols-2 lg:grid-cols-1 gap-4 mt-[1rem]'>
      <div className='flex flex-col md:col-span-2 items-baseline gap-y-2'>
        <b>Total Txn Count: <Tooltip title='Total number of transaction that you want to execute'>
              <InfoCircleOutlined />
            </Tooltip></b>
        <NumberInput
          className='w-full'
          value={formData.count || 1}
          onChange={value => {
            handleFormDataChange({ key: 'count', value });
          }}
        />
      </div>
      <div className='flex flex-col md:col-span-2 items-baseline gap-y-2'>
        <b>Rate (Txn/min): <Tooltip title='Set transactions per minute to 30-60 to rank in the top 5 on the PumpFun homepage.'>
              <InfoCircleOutlined />
            </Tooltip></b>
        <NumberInput
          className='w-full'
          max={BOT_MAX_RATE}
          min={BOT_MIN_RATE}
          value={formData.rate || 1}
          onChange={value => {
            handleFormDataChange({ key: 'rate', value });
          }}
        />
      </div>
      <p>Estimated Time: {getFormattedTime(formData.count, formData.rate)}</p>
      <div className='flex col-span-2 flex-col items-baseline gap-y-2'>
        <b>Txn Amount (SOL): <Tooltip title='Amount of sol that you want to buy and sell in each transaction.'>
              <InfoCircleOutlined />
            </Tooltip></b>
        <Radio.Group
          value={formData.amt}
          name='amt'
          onChange={e => {
            const { value, name: key } = e.target || {};
            handleFormDataChange({ key, value });
          }}
          buttonStyle='solid'
          optionType='button'
          className='flex w-full'>
          {TX_AMOUNT_TABS.map(tab => (
            <Radio.Button
              key={tab.value}
              value={tab.value}
              className='flex flex-1 items-center justify-center h-10 text-[#666]'>
              {tab.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>
      {/* <div className='flex col-span-2 flex-col items-baseline gap-y-2'>
        <b>Jito tip (Per Txn):</b>

        <Radio.Group
          value={formData.tip}
          name='tip'
          onChange={e => {
            const { value, name: key } = e.target || {};
            handleFormDataChange({ key, value });
          }}
          buttonStyle='solid'
          optionType='button'
          className='flex w-full'>
          {PRIORITY_FEE_TABS.map(tab => (
            <Radio.Button
              key={tab.value}
              value={tab.fee}
              className='flex flex-auto items-center justify-center h-10 text-[#666]'>
              <div className='flex items-center justify-between gap-x-4'>
                <span className='md:text-xs text-center'>
                  {tab.label}&nbsp;
                  <span className='text-xs'>{tab.fee}</span>
                </span>
                <div className='flex sm:hidden items-center justify-center h-[18px] min-w-[28px] rounded-[10px] bg-[#ba4ff6] font-extralight text-[11px] text-white'>
                  {PRIORITY_FEE_SPEED[tab.value]}
                </div>
              </div>
            </Radio.Button>
          ))}
        </Radio.Group>
      </div> */}
    </div>
  );
};

export default BumpiForm;
