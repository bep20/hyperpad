import React from 'react';
import dayjs from 'dayjs';
import { createSearchParams, useNavigate, useParams } from 'react-router-dom';

import relativeTime from 'dayjs/plugin/relativeTime';
import { useFetchGraphHistory } from '../utils/api';
import Loader from './Loader';
import Empty from 'antd/es/empty';
import Result from 'antd/es/result';
import Button from 'antd/es/button';

dayjs.extend(relativeTime);

export const GraphHistory = ({ currentSelected }) => {
  const navigate = useNavigate();
  const { mint_address } = useParams();
  const {
    data: graphHistory = [],
    isFetching,
    error,
    refetch,
  } = useFetchGraphHistory({
    mint_address,
  });

  return (
    <div className='rows'>
      {isFetching ? (
        <Loader />
      ) : error ? (
        <Result
          status='error'
          title='Oops!'
          subTitle={error?.message || ''}
          extra={
            <Button type='primary' size='large' onClick={refetch}>
              Retry
            </Button>
          }
        />
      ) : !graphHistory?.length ? (
        <Empty className='mt-20' />
      ) : (
        graphHistory?.map(item => {
          return (
            <div
              onClick={() => {
                const path = {
                  search: createSearchParams({
                    mapId: item.map_id,
                  }).toString(),
                };
                navigate(path);
              }}
              className={`row cursor-pointer ${item?.map_id === currentSelected ? 'bg-primary-color text-white' : 'hover:bg-[#0000000f]'}`}>
              <p className='m-0'>
                {dayjs(item.updatedAt).format('YYYY-MM-DD')}
              </p>
              <p className='m-0'>{dayjs().to(dayjs(item.updatedAt))}</p>
            </div>
          );
        })
      )}
    </div>
  );
};
