import React, { useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import Modal from 'antd/es/modal/Modal';
import { roundOff } from '../../../utils/helpers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const KeyValue = ({ label, value }) => (
  <div>
    <strong className='text-primary-color'>{label}:</strong>
    &nbsp;<span>{value}</span>
  </div>
);

export const TokenInfo = ({ tokenDetails }) => {
  const {
    decimals,
    freezeAuthority,
    mintAuthority,
    supply,
    metadata,
    createdAt,
  } = tokenDetails;
  const { uriData: { name = 'Token info', symbol = '', image = '' } = {} } =
    metadata || {};
  const [show, setShow] = useState(false);

  return (
    <>
      <Modal
        open={show}
        onCancel={() => setShow(false)}
        footer={null}
        closeIcon={null}
        width='fit-content'>
        <div className='flex flex-col gap-y-4 items-center'>
          <div className='flex items-center gap-x-2'>
            <img
              width={40}
              height={40}
              className='rounded-[50%]'
              src={image}
              alt='logo'
            />
            <div>
              <strong className='text-primary-color'>{name}</strong>
              <p className='font-bold text-[10px] m-0'>{symbol}</p>
            </div>
          </div>
          <div className='flex flex-col items-center'>
            <strong className='text-primary-color'>
              Date of current snapshot:
            </strong>
            <p className='m-0'>
              {dayjs(createdAt).format('ddd, DD MMM YYYY HH:mm:ss [GMT]')}
            </p>
          </div>
          <div className='flex flex-col items-center'>
            <KeyValue label='Mintable' value={mintAuthority || 'false'} />
            <KeyValue label='Freezable' value={freezeAuthority || 'false'} />
            <KeyValue
              label='Supply'
              value={roundOff(supply / 10 ** decimals) || '-'}
            />
          </div>
        </div>
      </Modal>

      <div
        onClick={() => setShow(true)}
        className='shadow-[-4px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center gap-x-2 px-[10px] py-[8px]
      bg-white rounded-[4px] cursor-pointer
  '>
        <strong>{name}</strong>
        <InfoCircleOutlined />
      </div>
    </>
  );
};
