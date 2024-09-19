import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'antd/es/modal';
import Input from 'antd/es/input';
import { SearchOutlined } from '@ant-design/icons';
import { useConnection } from '@solana/wallet-adapter-react';
import Alert from 'antd/es/alert';
import Skeleton from 'antd/es/skeleton';
import Empty from 'antd/es/empty';
import Button from 'antd/es/button';
import { useNavigate } from 'react-router-dom';
import {
  useFetchGraphHistory,
  useFetchRecentGraphs,
  useGenerateGraph,
} from '../utils/api';
import { GenerateGraph } from './GenerateGraph';
import { TokenUtils } from '../../../solana/TokenUtils';
import { BubbleCard } from './BubbleCard';

export const SearchModal = ({ modalOpen = true, setModalOpen }) => {
  const [searchText, setSearchText] = useState(null);
  const [mintAddress, setMintAddress] = useState('');
  const [fetchingTokenDetails, setFetchingTokenDetails] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);
  const { connection } = useConnection();
  const navigate = useNavigate();

  const { data: recentGraphs = [], isFetching: fetchingRecentGraphs } =
    useFetchRecentGraphs();

  const { mutate, isPending: isGenerating } = useGenerateGraph({
    navigate,
    closeModal: () => setModalOpen(false),
  });

  const getSearchedToken = async () => {
    const tokenUtils = new TokenUtils(connection);

    const [tkDetails] = await tokenUtils.getTokensFullDetails([searchText]);
    return tkDetails;
  };

  const { data: searchResult = [], isFetching: fetchingSearchResult } =
    useFetchGraphHistory({
      mint_address: mintAddress,
      enabled: !!mintAddress,
    });

  useEffect(() => {
    if (TokenUtils.isValidSolanaAddress(searchText)) {
      setFetchingTokenDetails(true);
      getSearchedToken()
        .then(res => {
          if (res?.decimals) {
            setTokenDetails(res);
            setMintAddress(searchText);
          } else {
            setTokenDetails(null);
            setMintAddress('');
          }
        })
        .finally(() => setFetchingTokenDetails(false));
    } else {
      setTokenDetails(null);
      setMintAddress('');
    }
  }, [searchText]);

  const [listItems, fetchingList] = useMemo(
    () =>
      searchText
        ? [searchResult, fetchingSearchResult]
        : [recentGraphs, fetchingRecentGraphs],
    [
      searchText,
      searchResult,
      recentGraphs,
      fetchingSearchResult,
      fetchingRecentGraphs,
    ],
  );

  return (
    <Modal
      closeIcon={null}
      okText={null}
      okType={null}
      footer={null}
      style={{ top: 20, padding: 0 }}
      width='800px'
      height='80vh'
      open={modalOpen}
      maskClosable
      onCancel={event => {
        setModalOpen(false);
        event.preventDefault();
      }}>
      <div className='flex flex-col gap-y-4'>
        <Input
          size='large'
          placeholder='Search token by address'
          suffix={<SearchOutlined />}
          value={searchText}
          onChange={event => setSearchText(event.target.value)}
        />
        {searchText ? (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {fetchingTokenDetails ? (
              <Skeleton.Input active size='large' block />
            ) : tokenDetails ? (
              <GenerateGraph
                tokenDetails={tokenDetails}
                closeModal={() => setModalOpen(false)}
              />
            ) : (
              <Alert message='Invalid token' type='warning' closable showIcon />
            )}
          </>
        ) : null}

        <div className='flex flex-col gap-y-3'>
          <h1 className='italic underline text-[#555151]'>
            {searchText ? 'Searched token history' : 'Recent history'}
          </h1>
          <div className='flex flex-col gap-y-2 max-h-[55vh] overflow-y-auto'>
            {fetchingList ? (
              Array(5)
                .fill()
                .map((_, i) => (
                  <Skeleton.Input key={i} active size='large' block />
                ))
            ) : listItems?.length ? (
              listItems.map((item, i) => (
                <>
                  <BubbleCard
                    key={item?.map_id}
                    item={item}
                    listView
                    closeModal={() => setModalOpen(false)}
                  />
                  {i !== (listItems?.length || 0) - 1 && <hr />}
                </>
              ))
            ) : (
              <Empty
                className='mt-17'
                description={
                  tokenDetails
                    ? "Don't find the map you are looking for?"
                    : 'No history'
                }>
                {tokenDetails ? (
                  <Button
                    loading={isGenerating}
                    onClick={() => {
                      mutate({
                        mint_address: tokenDetails?.mint,
                      });
                    }}
                    type='primary'>
                    compute it on the fly
                  </Button>
                ) : null}
              </Empty>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SearchModal;
