import React from 'react';

import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import InputNumber from 'antd/es/input-number';

const NumberInput = ({ min = 1, defaultValue = 1, ...props }) => (
  <InputNumber
    controls={{
      upIcon: <PlusOutlined />,
      downIcon: <MinusOutlined />,
    }}
    defaultValue={defaultValue}
    min={min}
    style={{ width: '100%', fontSize: '1.2rem', height: '2.5rem' }}
    {...props}
  />
);

export default NumberInput;
