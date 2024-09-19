import React from 'react';

import Card from 'antd/es/card/Card';
import { createSearchParams, useNavigate } from 'react-router-dom';
import scannerStyle from '../style/scanner.module.less';
import { SolscanIcon } from '../../../icons/socials/solscan';
import { DexScreenerIcon } from '../../../icons/socials/dexscreener';
import { CalendarOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const BubbleCard = ({ item, listView, closeModal }) => {
  //   const [tokenDetails, setTokenDetails] = useState({});
  //   const [URIData, setURIData] = useState({});
  //   const { connection } = useConnection();
  const navigate = useNavigate();

  //   const getTokenDetails = async mint_address => {
  //     const tokenUtilsClient = new TokenUtils(connection);
  //     const [userTokensDetail] = await tokenUtilsClient.getTokensFullDetails([
  //       mint_address,
  //     ]);

  //     return userTokensDetail;
  //   };

  //   useEffect(() => {
  //     if (item?.mint_address) {
  //       getTokenDetails(item?.mint_address).then(result => {
  //         setTokenDetails(result);
  //       });
  //     }
  //   }, [item?.mint_address]);

  //   useEffect(() => {
  //     if (tokenDetails?.metadata?.data?.uri?.length) {
  //       axios({
  //         url: tokenDetails?.metadata?.data?.uri,
  //       })
  //         .then(res => {
  //           setURIData(res.data);
  //         })
  //         .catch(err => {
  //           console.log('catched error', err);
  //         });
  //     }
  //   }, [tokenDetails?.metadata?.data?.uri]);

  return (
    <div
      onClick={() => {
        const path = {
          pathname: item?.mint_address,
          search: createSearchParams({
            mapId: item?.map_id,
          }).toString(),
        };
        navigate(path);
      }}>
      {listView ? (
        <div
          className='flex items-center gap-x-6 rounded-lg p-2 cursor-pointer hover:bg-[#0000000f]'
          onClick={closeModal}>
          <img
            className='rounded-[50%]'
            height={50}
            width={50}
            src={item?.token_details?.metadata?.uriData?.image}
          />
          <div className='flex gap-x-6 items-center flex-1 justify-between'>
            <div>
              <h3>
                {item?.token_details?.metadata?.data?.name || '-'} -{' '}
                {item?.token_details?.metadata?.data?.symbol || '-'}
              </h3>
              <p className='m-0'>{item?.mint_address}</p>
            </div>
            <div>
              <p className='m-0'>
                Created At : {new Date(item.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={scannerStyle.cardWrap}>
          <Card className={scannerStyle.card}>
            <div className={scannerStyle.cardContent}>
              <div>
                <img
                  height={70}
                  width={70}
                  src={item?.token_details?.metadata?.uriData?.image}
                />
              </div>
              <div>
                <h3>{item?.token_details?.metadata?.data?.name || '-'}</h3>
              </div>
              <div className={scannerStyle.socials}>
                <a
                  target='_blank'
                  href={`https://solscan.io/token/${item.mint_address}`}
                  rel='noreferrer'>
                  <SolscanIcon />
                </a>
                <a
                  target='_blank'
                  href={`https://dexscreener.com/solana/${item.mint_address}`}
                  rel='noreferrer'>
                  <DexScreenerIcon />
                </a>
              </div>
              <p className='absolute top-1.5 right-2'>
                <CalendarOutlined />
                &nbsp;&nbsp;
                {dayjs().to(dayjs(item.updatedAt))}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
