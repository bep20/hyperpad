import React, { useState } from 'react';
import { CloseOutlined, CopyOutlined } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';
import { roundOff } from '../../../utils/helpers';

const NodeInfoCard = ({
  selectedRow,
  setSelectedRow,
  ownerDetails,
  clusterPercentage,
  linkedPercentage,
}) => {
  const [copyTT, setCopyTT] = useState('Copy');
  const { owner, address, rank, percentage } = selectedRow;
  const name = ownerDetails[owner]?.name || address;
  return (
    <div
      className='shadow-[-4px_4px_12px_0px_rgba(0,0,0,0.08)] flex flex-col gap-y-[10px] p-[10px]
    bg-white w-[250px] rounded-[4px] absolute top-[54px] left-[7px] z-[1];
'>
      <div>
        <div className='flex items-center justify-between'>
          <strong className='text-[18px]'>Sellected Wallet</strong>
          <div
            className='flex cursor-pointer'
            onClick={() => setSelectedRow(null)}>
            <CloseOutlined />
          </div>
        </div>
        <div className='flex items-center gap-x-1'>
          <p className='truncate m-0 max-w-[150px] text-primary-color'>
            {name}
          </p>
          <Tooltip title={copyTT}>
            <div
              className='flex cursor-pointer'
              onClick={() => {
                navigator.clipboard.writeText(name);
                setCopyTT('Copied');
              }}
              onMouseLeave={() => {
                setCopyTT('Copy');
              }}>
              <CopyOutlined />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className='text-[16px]'>
        <p className='m-0'>
          Wallent Rank: <strong>#{rank}</strong>
        </p>
        <p className='m-0'>
          Percentage: <strong>#{roundOff(percentage)}%</strong>
        </p>
        {linkedPercentage !== null ? (
          <p className='m-0'>
            Linked Percentage:{' '}
            <strong className='text-primary-color'>#{linkedPercentage}%</strong>
          </p>
        ) : null}

        {clusterPercentage !== null ? (
          <p className='m-0'>
            Cluster Percentage:{' '}
            <strong className='text-primary-color'>
              #{clusterPercentage}%
            </strong>
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default NodeInfoCard;
