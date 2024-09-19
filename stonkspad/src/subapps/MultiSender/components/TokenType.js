import Select from 'antd/es/select';
import React from 'react';
import { TOKEN_TYPE_OPTIONS } from '../constants/token';
import multisenderStyle from '../style/multisender.module.less';

export const TokenType = ({ tokenType, setTokenType }) => (
  <div className={multisenderStyle.tokenTypeContainer}>
    <div style={{ width: '100%' }}>
      <p className={multisenderStyle.title}>Select Token Type</p>
      <Select
        placeholder='select token type'
        options={TOKEN_TYPE_OPTIONS}
        value={tokenType}
        style={{ width: 200 }}
        onSelect={value => {
          setTokenType(value);
        }}
      />
    </div>
  </div>
);
