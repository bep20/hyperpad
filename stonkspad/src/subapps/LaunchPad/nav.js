import React from 'react';
import {
  MailOutlined,
  PlusCircleOutlined,
  EditOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  AuditOutlined,
  FileSyncOutlined,
} from '@ant-design/icons';
import mintToken from '../../../public/images/stack.png';
// import mintAuthority from '../../../public/images/data-processing.png';
// import freeAuthority from '../../../public/images/snowflake.png';
// import updateMetaData from '../../../public/images/token.png';

export const SUB_APP_NAVIGATION = [
  {
    name: 'Create Token (SPL)',
    route: 'create-spl-token',
    key: 'create-spl-token',
    icon: <PlusCircleOutlined />,
  },
  {
    name: 'Create Token (SPL22)',
    route: 'create-spl-token-2022',
    key: 'create-spl-token-2022',
    icon: <PlusCircleOutlined />,
  },
  {
    name: 'View Tokens',
    route: 'manage-token',
    key: 'manage-token',
    icon: <MailOutlined />,
  },
  {
    name: 'Update Token',
    route: 'update-token',
    key: 'update-token',
    icon: <MailOutlined />,
  },
  {
    name: 'Mint Token',
    route: 'mint',
    key: 'mint',
    icon: (
      <img
        src={mintToken}
        style={{ width: '1.3rem', height: '1.3rem' }}
        alt=''
      />
    ),
  },

  {
    name: 'Mint Authority',
    route: 'mint-authority',
    key: 'mint-authority',
    icon: <FileSyncOutlined />,
  },
  {
    name: 'Freeze Authority',
    route: 'freeze-authority',
    key: 'freeze-authority',
    icon: <AuditOutlined />,
  },
  {
    name: 'Update Metadata',
    route: 'update-metadata',
    key: 'update-metadata',
    icon: <EditOutlined />,
  },
  {
    name: 'Tax Authority',
    route: 'tax-authority',
    key: 'tax-authority',
    icon: <FileProtectOutlined />,
  },
  {
    name: 'Tax Withdraw Authority',
    route: 'tax-withdraw-authority',
    key: 'tax-withdraw-authority',
    icon: <FileSearchOutlined />,
  },
  {
    name: 'Freeze Wallet',
    route: 'solana-wallet-freeze',
    key: 'solana-wallet-freeze',
    icon: <FileSearchOutlined />,
  },
];
