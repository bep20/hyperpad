import React from 'react';
import { MailOutlined, PieChartOutlined } from '@ant-design/icons';

export const SUB_APP_NAVIGATION = [
  {
    name: 'Create AirDrop',
    route: 'createairdrop',
    key: 'createairdrop',
    icon: <PieChartOutlined />,
  },
  {
    name: 'AirDrop List',
    route: 'airdroplist',
    key: 'airdroplist',
    icon: <MailOutlined />,
  },
];
