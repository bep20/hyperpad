import React from 'react';
import { BarsOutlined, CalendarOutlined } from '@ant-design/icons';

export const MAX_RADIUS = 100;
export const MIN_RADIUS = 5;

export const panelOptionEnums = {
  WALLETS_LIST: 1,
  MAP_HISTORY: 2,
};

export const getFloatingPanelTabOptions = ({
  disabledWalletList = false,
  disableMapHistory = false,
}) => [
  {
    label: 'Wallets List',
    value: panelOptionEnums.WALLETS_LIST,
    disabled: disabledWalletList,
    icon: <BarsOutlined />,
  },
  {
    label: 'Graph History',
    value: panelOptionEnums.MAP_HISTORY,
    disabled: disableMapHistory,
    icon: <CalendarOutlined />,
  },
];

export const GRAPH_STATUS = {
  SUBMITTED: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  FAILED: 4,
};

export const CLUSTER_TYPE = {
  PERIPHERAL: 'peripheral',
  GROUP: 'group',
};
