import React from "react";
import Tabs from "antd/es/tabs";
import { TokenDetails } from "./TokenDetails";
import { TokenBurn } from "./TokenBurn";
import { TokenMint } from "./TokenMint";
import { TokenMintAuthority } from "./TokenMintAuthority";
import { TokenAuthority } from "./TokenAuthority";
import { TokenFreezeAuthority } from "./TokenFreezeAuthority";
import { TokenMetadata } from "./TokenMetadata";
import { TokenTabsCard } from "./TokenTabsCard";
import launchpadStyle from "../style/launchpad.module.less";

export const UpdateToken = ({ tokenData }) => {
  const TabsTitle = [
    {
      name: "Details",
      component: TokenDetails,
    },
    {
      name: "Burn",
      component: TokenBurn,
    },
    {
      name: "Mint",
      component: TokenMint,
    },
    {
      name: "Mint Authority",
      component: TokenMintAuthority,
    },
    {
      name: "Freeze Authority",
      component: TokenFreezeAuthority,
    },
    {
      name: "Update Metadata",
      component: TokenMetadata,
    },
  ];
  return (
    <div>
      <Tabs
        type="card"
        size="large"
        tabBarStyle={{ fontSize: "3rem" }}
        className={launchpadStyle.tabContainer}
        items={TabsTitle.map((item, i) => {
          const id = String(i + 1);
          return {
            label: `${item.name}`,
            key: id,
            style: { marginBottom: "0px" },
            children: (
              <TokenTabsCard>
                <item.component tokenData={tokenData} />
              </TokenTabsCard>
            ),
          };
        })}
      />
    </div>
  );
};
