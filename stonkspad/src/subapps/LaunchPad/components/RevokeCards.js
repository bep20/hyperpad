import React from 'react';
import Card from 'antd/es/card';
import Switch from 'antd/es/switch';
import Tooltip from 'antd/es/tooltip';
import { InfoCircleOutlined } from '@ant-design/icons';

import '../style/launchAntd.less';
import launchpadStyle from '../style/launchpad.module.less';

export const RevokeCards = ({
  revokeConfig,
  setRevokeConfig,
  doesFieldDisabled,
}) => {
  return (
    <div>
      <div className={`${launchpadStyle.headerLine} mt-[0rem] mb-[0rem]`} />

      <div className='flex items-center mt-4 gap-x-2'>
        <p
          style={{
            marginBlock: '0.5rem',
            fontSize: '1.25rem',
            fontWeight: '400',
          }}>
          Revoke Authority &nbsp;
          <Tooltip title='Enable authorities to revoke them'>
            <InfoCircleOutlined />
          </Tooltip>
        </p>
      </div>

      <div className={'revokeCards'}>
        <Card
          title='Revoke Update'
          bordered={false}
          className={'cardd'}
          extra={
            <Switch
              value={revokeConfig?.revokeUpdate}
              disabled={doesFieldDisabled}
              onChange={val => {
                setRevokeConfig(prev => ({ ...prev, revokeUpdate: val }));
              }}
            />
          }>
          <p>
            Renouncing ownership means you will not be able to modify the token
            metadata. It indeed makes investors feel more secure.
          </p>
        </Card>
        <Card
          title='Revoke Freeze'
          bordered={false}
          className={'cardd'}
          extra={
            <Switch
              value={revokeConfig?.revokeFreeze}
              disabled={doesFieldDisabled}
              onChange={val => {
                setRevokeConfig(prev => ({ ...prev, revokeFreeze: val }));
              }}
            />
          }>
          <p>
            Revoking Freeze Authority removes control over specific account
            actions.
          </p>
        </Card>
        <Card
          title='Revoke Mint'
          bordered={false}
          className={'cardd'}
          extra={
            <Switch
              value={revokeConfig?.revokeMint}
              disabled={doesFieldDisabled}
              onChange={val => {
                setRevokeConfig(prev => ({ ...prev, revokeMint: val }));
              }}
            />
          }>
          <p>
            Relinquishing minting rights is essential for investor security and
            token success, preventing further token supply.
          </p>
        </Card>
      </div>
    </div>
  );
};
