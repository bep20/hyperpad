import React, { useMemo } from 'react';
import Tabs from 'antd/es/tabs';
import Skeleton from 'antd/es/skeleton';
import { TokenDetails } from './TokenDetails';
import { TokenBurn } from './TokenBurn';
import { TokenMint } from './TokenMint';
import { TokenMintAuthority } from './TokenMintAuthority';
import { TokenAuthority } from './TokenAuthority';
import { TokenFreezeAuthority } from './TokenFreezeAuthority';
import { TokenMetadata } from './TokenMetadata';
import { TokenTabsCard } from './TokenTabsCard';
import launchpadStyle from '../style/launchpad.module.less';
import { TaxAuthority } from './TaxAuthority';
import { WithdrawTaxAuthority } from './WithdrawTaxAuthority';
import { UpdateTax } from './UpdateTax';

export const UpdateToken = ({ tokenData, uriData }) => {
  const TabsTitle = [
    {
      name: 'Details',
      component: TokenDetails,
    },
    {
      name: 'Burn',
      component: TokenBurn,
    },
    {
      name: 'Mint',
      component: TokenMint,
    },
    {
      name: 'Mint Authority',
      component: TokenMintAuthority,
    },
    {
      name: 'Freeze Authority',
      component: TokenFreezeAuthority,
    },
    {
      name: 'Update Metadata',
      component: TokenMetadata,
    },
  ];

  const computedTabs = useMemo(() => {
    const targetTabs = TabsTitle;

    if (tokenData?.extensions) {
      const taxExt = tokenData?.extensions?.find(
        item => item.extension === 'transferFeeConfig',
      );
      if (taxExt) {
        targetTabs.push({
          name: 'Tax Authority',
          component: TaxAuthority,
        });
        targetTabs.push({
          name: 'Tax Withdraw Authority',
          component: WithdrawTaxAuthority,
        });
        // update tax instructions are not yet in js client need to implement those first
        // targetTabs.push({
        //   name: "Update Tax",
        //   component: UpdateTax,
        // });
      }
    }

    return targetTabs;
  }, [tokenData?.extensions]);

  return (
    <div>
      <Tabs
        type='card'
        size='large'
        tabBarStyle={{ fontSize: '3rem' }}
        className={launchpadStyle.tabContainer}
        items={computedTabs?.map((item, i) => {
          const id = String(i + 1);
          return {
            label: `${item.name}`,
            key: id,
            style: { marginBottom: '0px' },
            children: (
              <TokenTabsCard>
                {!tokenData?.decimals ? (
                  <Skeleton active />
                ) : (
                  <item.component tokenData={tokenData} uriData={uriData} />
                )}
              </TokenTabsCard>
            ),
          };
        })}
      />
    </div>
  );
};
