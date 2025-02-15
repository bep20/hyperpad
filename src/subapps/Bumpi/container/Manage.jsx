import React, { useContext } from 'react';
import { useGetBumpiBots } from '../../../utils/networkCalls';
import { useWallet } from '@solana/wallet-adapter-react';
import Table from 'antd/es/table';
import Tag from 'antd/es/tag';
import { BOT_STATUS_COLORS } from '../../../constants';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { HyperSButton } from '../../../components/buttons/HyperSButton';
import { getTransactionLink } from '../../../utils/helpers';
import { AppContext } from '../../../context/AppStore';
import bumpiStyle from '../style/bumpi.module.less';
dayjs.extend(relativeTime);

const Manage = () => {
  const [appStore] = useContext(AppContext);
  const wallet = useWallet();
  const { data, isLoading } = useGetBumpiBots({
    tenantId: wallet?.publicKey,
  });
  const columns = [
    {
      title: 'Token',
      dataIndex: 'tokenMintAddress',
      render: text => <span className='text-[14px]'>{`${text.slice(0, 4)}...${text.slice(-4)}`}</span>,
    },
    {
      title: 'Token name',
      dataIndex: 'tokenName',
      render: text => <span className='text-[14px]'>{text || '-'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'currentStatus',
      render: text => <Tag color={BOT_STATUS_COLORS[text]}>{text}</Tag>,
    },
    {
      title: 'createdAt',
      dataIndex: 'createdAt',
      render: text => (
        <span className='text-[14px]'>
          {dayjs(text).format('ddd, DD MMM YYYY HH:mm:ss [GMT]')}
        </span>
      ),
    },
    {
      title: 'Txn Account',
      dataIndex: 'tradeAccountKey',
      render: text => <span className='text-[14px]'>{`${text.slice(0, 4)}...${text.slice(-4)}`}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Link to={`${record?.id}`}>
          <HyperSButton btnSize='small-btn' text='View Details' />
        </Link>
      ),
    },
  ];
  return (
    <div className='flex flex-col gap-y-4'>
      <h2>Manage Bump bots</h2>
      <hr />
      <Table
        columns={columns}
        dataSource={data || []}
        loading={isLoading}
        pagination
        virtual
        className={bumpiStyle.tableContainer}
        // scroll={{
        //   y: 500,
        // }}
      />
    </div>
  );
};

export default Manage;
