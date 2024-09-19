import React, { useState } from 'react';
import Popover from 'antd/es/popover';
import Radio from 'antd/es/radio';
import {
  PRIORITY_FEE_ENUM,
  PRIORITY_FEE_LABELS,
  PRIORITY_FEE_SPEED,
  PRIORITY_FEE_TABS,
} from '../../constants';

const Content = ({ feeType, setFeeType }) => {
  const changeFeeType = e => {
    localStorage.setItem('hyperpadFeeType', JSON.stringify(e.target.value));
    setFeeType(e.target.value);
  };
  return (
    <div className='flex flex-col gap-y-4'>
      <p className='text-lg m-0'>Enable Priority Fee</p>
      <p className='text-base font-extralight m-0'>
        Adjust your on-chain priority fee on SlerfTools to prioritize your
        transactions and avoid potential failures during network congestion.
      </p>
      <Radio.Group
        value={feeType}
        onChange={changeFeeType}
        buttonStyle='solid'
        size='large'
        className='flex'>
        {PRIORITY_FEE_TABS.map(tab => (
          <Radio.Button
            key={tab.value}
            className='flex-1 h-14 flex items-center justify-center'
            value={tab.value}>
            {tab.label}
          </Radio.Button>
        ))}
      </Radio.Group>
      <div className='flex items-center'>
        {PRIORITY_FEE_TABS.map(tab => (
          <div
            key={tab.value}
            style={{ color: tab.color }}
            className='flex flex-1 justify-center font-light'>
            ≈{tab.fee} SOL
          </div>
        ))}
      </div>
      <p className='text-sm font-extralight m-0 text-[#666]'>
        Consider that priority fees are often helpful in sending transactions to
        the network, but their effectiveness depends on the current state of the
        network
      </p>
    </div>
  );
};

const PriorityFee = () => {
  const [feeType, setFeeType] = useState(
    JSON.parse(localStorage.getItem('hyperpadFeeType')) ||
      PRIORITY_FEE_ENUM.DEFAULT,
  );
  return (
    <Popover
      content={<Content feeType={feeType} setFeeType={setFeeType} />}
      trigger='click'
      overlayClassName='shaded-popover fee-popover'>
      <div
        className='cursor-pointer flex items-center h-[44px] px-4 py-3 shadow-[-4px_4px_#000] hover:shadow-[-2px_2px_#000] rounded-md border border-black'
        style={{
          background: 'linear-gradient(90deg, #fff8ee, var(--faded-color))',
        }}>
        <span className='text-base font-medium opacity-60'>Priority Fee:</span>
        &nbsp;
        <div className='flex items-center gap-x-2'>
          <span className='text-base font-medium'>
            {PRIORITY_FEE_LABELS[feeType]}
          </span>
          <div className='flex items-center justify-center h-[18px] w-[28px] rounded-[10px] bg-[#ba4ff6] font-extralight text-[11px] text-white'>
            {PRIORITY_FEE_SPEED[feeType]}
          </div>
        </div>
      </div>
    </Popover>
  );
};

export default PriorityFee;
