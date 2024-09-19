import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import message from 'antd/es/message';
import {
  useGetBumpiBotDetail,
  useGetBumpiBotStatistics,
} from '../../../utils/networkCalls';
import { loadTokenDetails, loadTokenDetailsBE } from '../../../utils/helpers';
import { useConnection } from '@solana/wallet-adapter-react';
import { TokenInfo } from '../components/TokenInfo';
import Piechart from '../components/Piechart';
import { BOT_STATUS, BOT_STATUS_COLORS } from '../../../constants/index';
import Tag from 'antd/es/tag';
import Card from 'antd/es/card';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TransactionBook } from '../../../components/cards/TransactionBook';
import { BARE_METAL_BACKEND_URL } from '../../../envs/urls';
import axios from 'axios';
import { ReloadOutlined } from '@ant-design/icons';
import { getMode } from '../utils/helpers';
import { getBondingCurveStatus } from '../utils/apiCalls';
dayjs.extend(relativeTime);

const refreshData = (url, params) => {
  return new Promise((resolve, reject) => {
    axios({
      method: 'GET',
      params: params,
      url: url,
    })
      .then(response => {
        resolve(response?.data || {});
      })
      .catch(err => {
        reject(err);
      });
  });
};

const Details = () => {
  const { compaignId } = useParams();
  const [tokenDetails, setTokenDetails] = useState(null);
  const [loadingTokenDetails, setLoadingTokenDetails] = useState(false);
  const { connection } = useConnection();
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  let refetchRef = useRef();

  const { data, isLoading } = useGetBumpiBotDetail({
    compaignId,
  });

  async function loadToken(address) {
    try {
      setLoadingTokenDetails(true);
      setTokenDetails(null);
      const [[result = null], bondingStatus] = await Promise.all([
        loadTokenDetailsBE({
          address,
          mode: getMode(connection),
        }),
        getBondingCurveStatus({ mintAddress: address }),
      ]);

      if (result?.decimals) {
        return setTokenDetails({...result, ...bondingStatus});
      }
      throw new Error('Invalid token');
    } catch (err) {
      setTokenDetails(null);
      return message.error(err?.message || 'Invalid Token');
    } finally {
      setLoadingTokenDetails(false);
    }
  }

  const handleRefresh = useCallback(() => {
    let logs_url = `${BARE_METAL_BACKEND_URL}/api/v1/mtb/campaign/${compaignId}/txn/logs`;
    let logs_parms = { limit: 10, currentStatus: BOT_STATUS.COMPLETED };

    let statistics_url = `${BARE_METAL_BACKEND_URL}/api/v1/mtb/campaign/${compaignId}/txn/statistics`;
    let statistics_parms = {};

    setLoadingLogs(true);
    refreshData(logs_url, logs_parms)
      .then(res => {
        setLogs(res?.data || []);
      })
      .finally(() => {
        setLoadingLogs(false);
      });

    setLoadingStatistics(true);
    refreshData(statistics_url, statistics_parms)
      .then(res => {
        setStatistics(res?.data?.[0]);
      })
      .finally(() => {
        setLoadingStatistics(false);
      });
  }, [compaignId]);

  useEffect(() => {
    handleRefresh();
    if (data?.currentStatus === BOT_STATUS.INSYNC) {
      refetchRef.current = setInterval(() => {
        handleRefresh();
      }, 60 * 1000);
    }
    return () => {
      clearInterval(refetchRef.current);
      refetchRef.current = null;
    };
  }, [handleRefresh, data?.currentStatus]);

  useEffect(() => {
    if (data?.tokenMintAddress) loadToken(data?.tokenMintAddress);
  }, [data?.tokenMintAddress]);

  return (
    <div className='flex flex-col gap-y-4'>
      <div className='flex justify-between'>
        <h2>Bump bot details</h2>
        <div className='cursor-pointer' onClick={handleRefresh}>
          <ReloadOutlined /> Refresh
        </div>
      </div>
      <hr />
      <div className='flex gap-x-4 flex-col'>
        <div className='flex flex-row gap-x-4 justify-between flex-1 '>
          <TokenInfo
            tokenDetails={tokenDetails}
            loading={loadingTokenDetails}
            style={{ flex: 1 }}
          />

          <Card
            style={{ flex: 1 }}
            loading={isLoading || loadingStatistics}
            size='small'
            title={
              <div className='flex items-center justify-between gap-x-2'>
                <span>Bot details</span>
                <Tag color={BOT_STATUS_COLORS[data?.currentStatus]}>
                  {data?.currentStatus}
                </Tag>
              </div>
            }>
            <div className='flex flex-col gap-y-4'>
              <div>
                <strong>Created at:</strong>&nbsp;&nbsp;
                <span>
                  {dayjs(data?.createdAt).format(
                    'ddd, DD MMM YYYY HH:mm:ss [GMT]',
                  )}
                </span>
              </div>
              <div>
                <strong>Txn account:</strong>&nbsp;&nbsp;
                <span>{data?.tradeAccountKey}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div className='flex gap-x-4 justify-between'>
        <TransactionBook
          loading={loadingLogs}
          data={logs}
          width={'50%'}
          height={500}
        />
        <Piechart
          width={500}
          height={500}
          statistics={statistics}
          total={data?.maxTxnLimit}
        />
      </div>
    </div>
  );
};

export default Details;
