/* eslint-disable react/no-array-index-key */
import React from 'react';
import Empty from 'antd/es/empty';
import Skeleton from 'antd/es/skeleton';
import scannerStyle from '../style/scanner.module.less';
import { BubbleCard } from './BubbleCard';
import { useFetchRecentGraphs } from '../utils/api';

export const BubbleList = () => {
  const { data: recentHistory = [], isLoading } = useFetchRecentGraphs();

  return (
    <div>
      <h2 className='text-center italic text-[2rem] mb-8'>
        Recently generated bubble graphs
      </h2>
      <div className={scannerStyle.cardContainer}>
        {isLoading ? (
          Array(8)
            .fill()
            .map((_, i) => (
              <Skeleton.Avatar key={i} active shape='square' size={220} />
            ))
        ) : recentHistory?.length ? (
          recentHistory.map((item, idx) => <BubbleCard key={idx} item={item} />)
        ) : (
          <Empty className='mt-17' />
        )}
      </div>
    </div>
  );
};
