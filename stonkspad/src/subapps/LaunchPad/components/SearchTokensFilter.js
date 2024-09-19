import Input from 'antd/es/input/Input';
import React from 'react';
import launchpadStyle from '../style/launchpad.module.less';

export const SearchTokensFilter = ({ currentFilter, setCurrentFilter }) => (
  <div>
    <Input
      value={currentFilter}
      placeholder='Enter Token Name or token symbol'
      className={launchpadStyle.inputTokenSearch}
      style={{
          borderRadius: '16px',
          width: 300,
        }}
      onChange={event => setCurrentFilter(event.target.value)}
      />
  </div>
  );
