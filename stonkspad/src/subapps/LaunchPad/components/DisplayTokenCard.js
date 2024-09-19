import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Button from 'antd/es/button';
import axios from 'axios';
import launchpadStyle from '../style/launchpad.module.less';
import { calculateTotalSupply } from '../utils/helpers';
import { HyperButton } from '../../../components/buttons/HyperButton';

export const DisplayTokenCard = ({ tokenDetails }) => {
  const [URIData, setURIData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenDetails?.metadata?.data?.uri?.length) {
      axios({
        url: tokenDetails?.metadata?.data?.uri,
      })
        .then(res => {
          setURIData(res.data);
        })
        .catch(err => {
          console.log('catched error', err);
        });
    }
  }, [tokenDetails?.metadata?.data?.uri]);

  const calculatedSupply = calculateTotalSupply(
    tokenDetails?.supply,
    tokenDetails?.decimals,
  );

  return (
    <div className={launchpadStyle.tokenItem}>
      <div className={launchpadStyle.tokenCard}>
        <div className={launchpadStyle.tokenCardContent}>
          <div className={launchpadStyle.mainDetails}>
            <div className={launchpadStyle.mediaSection}>
              <div className={launchpadStyle.imageContainer}>
                <img src={URIData?.image} width={100} height={100} />
              </div>
            </div>
            <div className={launchpadStyle.textSection}>
              <p className={launchpadStyle.cardTitle}>
                {`${
                  tokenDetails?.metadata?.data?.name?.replace(/\u0000/g, '') ||
                  ''
                }${
                  tokenDetails?.metadata?.data?.symbol
                    ? `(${
                        tokenDetails?.metadata?.data?.symbol?.replace(
                          /\u0000/g,
                          '',
                        ) || ''
                      })`
                    : ''
                }`}
              </p>
            </div>
          </div>
          <div className={launchpadStyle.metaDetails}>
            <div className={launchpadStyle.metaDetailsItem}>
              <p>Total Supply : </p>
              <p>{calculatedSupply || ''} </p>
            </div>
            <div className={launchpadStyle.metaDetailsItem}>
              <p>Decimals : </p>
              <p>{tokenDetails?.decimals || ''} </p>
            </div>
            <div className={launchpadStyle.metaDetailsItem}>
              <p>Mintable : </p>
              <p>{tokenDetails.mintAuthority ? 'Yes' : 'No'} </p>
            </div>
            <div className={launchpadStyle.metaDetailsItem}>
              <p>Token Type : </p>
              <p>{tokenDetails.program} </p>
            </div>
          </div>
          <div className={launchpadStyle.updateAction}>
            <NavLink
              to={`/solana-token-manager/update-token?address=${tokenDetails.mint}`}>
              <HyperButton
                btnSize='medium-btn'
                style={{ width: '100%' }}
                text='View & Update'
              />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
