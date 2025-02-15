import React from 'react';
import Input from 'antd/es/input';
import Checkbox from 'antd/es/checkbox';
import Switch from 'antd/es/switch';
import Tooltip from 'antd/es/tooltip';
import { InfoCircleOutlined } from '@ant-design/icons';

import launchpadStyle from '../style/launchpad.module.less';

export const SocialMedia = ({
  socialMediaInfo,
  setSocialMediaInfo,
  isSocialMediaEnabled,
  setIsSocialMediaEnabled,
  doesFieldDisabled,
}) => (
  <div className={`${launchpadStyle.socialMediaContainer} mb-[1rem]`}>
    <div className={`${launchpadStyle.headerLine} mt-[0rem] mb-[0rem]`} />
    <div className='flex items-center mt-4 gap-x-2'>
      <Switch
        onChange={() => setIsSocialMediaEnabled(prev => !prev)}
        checked={isSocialMediaEnabled}
        disabled={doesFieldDisabled}></Switch>
      <p
        style={{
          marginBlock: '0.5rem',
          fontSize: '1.25rem',
          fontWeight: '400',
        }}>
        Add Social Links &nbsp;
        <Tooltip title='Enable this feature to add social media links of project'>
          <InfoCircleOutlined />
        </Tooltip>
      </p>
    </div>
    {isSocialMediaEnabled && (
      <div className={`${launchpadStyle.mediaLinksContainer} mt-[0rem]`}>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>Twitter</p>
          <Input
            value={socialMediaInfo.twitter}
            disabled={doesFieldDisabled}
            className={launchpadStyle.fieldInput}
            onChange={event =>
              setSocialMediaInfo(prev => ({
                ...prev,
                twitter: event.target.value,
              }))
            }
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>Telegram</p>
          <Input
            value={socialMediaInfo.telegram}
            className={launchpadStyle.fieldInput}
            disabled={doesFieldDisabled}
            onChange={event =>
              setSocialMediaInfo(prev => ({
                ...prev,
                telegram: event.target.value,
              }))
            }
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>Website</p>
          <Input
            value={socialMediaInfo.website}
            className={launchpadStyle.fieldInput}
            disabled={doesFieldDisabled}
            onChange={event =>
              setSocialMediaInfo(prev => ({
                ...prev,
                website: event.target.value,
              }))
            }
          />
        </div>
        <div className={launchpadStyle.fieldContainer}>
          <p className={launchpadStyle.fieldLabel}>Discord</p>
          <Input
            value={socialMediaInfo.discord}
            className={launchpadStyle.fieldInput}
            disabled={doesFieldDisabled}
            onChange={event =>
              setSocialMediaInfo(prev => ({
                ...prev,
                discord: event.target.value,
              }))
            }
          />
        </div>
      </div>
    )}
  </div>
);
