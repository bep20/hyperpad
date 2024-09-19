import React from 'react';
import { SwapOutlined } from '@ant-design/icons';

export const SUB_APP_NAVIGATION = [
  {
    name: 'Wallets Generator',
    route: 'wallets-generator',
    key: 'wallets-generator',
    icon: <SwapOutlined />,
  },
  {
    name: 'Custom Address',
    route: 'vanity-address-generator',
    key: 'vanity-address-generator',
    icon: <SwapOutlined />,
  },
];
