import React from 'react';
import { PieChartOutlined, SwapOutlined } from '@ant-design/icons';

export const SUB_APP_NAVIGATION = [
  {
    name: 'Manage',
    route: 'manage',
    key: 'manage',
    icon: <PieChartOutlined />,
  },
  {
    name: 'Distribute',
    route: 'distribute',
    key: 'distribute',
    icon: <SwapOutlined />,
  },
];
