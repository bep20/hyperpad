import React, { useState } from 'react';
import Switch from 'antd/es/switch';

import { InfoCircleOutlined } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';

import launchpadStyle from '../style/launchpad.module.less';

import '../style/launchAntd.less';

import { Walletaddress } from '../../../components/Walletaddress';

export const CustomAddress = ({
  csAddressChecked,
  setCsAddressChecked,
  doesFieldDisabled,
  contractKeyPair,
  setContractKeyPair,
}) => {
  const onChange = () => {
    setCsAddressChecked(!csAddressChecked);
  };

  return (
    <>
      <div className={`${launchpadStyle.headerLine} mt-[0rem] mb-[1rem]`} />
      <div className='flex items-center mt-0 gap-x-2'>
        <Switch
          onChange={onChange}
          checked={csAddressChecked}
          disabled={doesFieldDisabled}
        />
        <p
          style={{
            marginBlock: '0.5rem',
            fontSize: '1.25rem',
            fontWeight: '400',
          }}>
          Create custom address &nbsp;
          <Tooltip title='Enable this feature to create custom address starting with some prefix. ex: HYPE***********'>
            <InfoCircleOutlined />
          </Tooltip>
        </p>
      </div>
      {csAddressChecked && (
        <Walletaddress
          contractKeyPair={contractKeyPair}
          setContractKeyPair={setContractKeyPair}
          doesFieldDisabled={doesFieldDisabled}
          context='custom'
        />
      )}
    </>
  );
};
