import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useState, useEffect, useContext } from "react";
import { TokenDetailsClient } from "../../LaunchPad/utils/tokendetails";
import incStyles from "../style/incinerator.module.less";
import { TokenUtils } from "../../../solana/TokenUtils";
import { ConnectWalletCard } from "../../../components/ConnectWalletCard";
import Skeleton from "antd/es/skeleton";
import { DisplayTokenCard } from "../components/DisplayTokenCard";
import { SearchTokensFilter } from "../components/SearchTokensFilter";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { SolUtils } from "../../../solana/SolUtils";
import { AppContext, getCluster } from "../../../context/AppStore";
import { NotifyContext } from "../../../context/Notify";
import message from "antd/es/message";
import { FaqSection } from "../../../components/faq/Faq";
import { Link } from "react-router-dom";

const faqItems = [
  {
    key: "1",
    label: "Where is the reclaimed SOL coming from?",
    children: (
      <>
        <p>
          Any accounts on Solana require a small storage fee to open them. By
          burning a token, we can close this account and reclaim the storage
          fee.
        </p>
      </>
    ),
  },
  {
    key: "2",
    label: "How much can I reclaim from burning?",
    children: (
      <>
        <p>Most tokens will give you 0.002 SOL.</p>
      </>
    ),
  },
  {
    key: "3",
    label: "Do you charge any fees?",
    children: (
      <>
        <p>No, Its completely free !!</p>
      </>
    ),
  },
  {
    key: "4",
    label: "Can I burn an LP (Liquidity Pool)?",
    children: (
      <>
        <p>
          Yes, After connecting to wallet, dashboard shows all the spl, spl22
          tokens (including lp tokens). You can select and close those accounts
          also.
        </p>
      </>
    ),
  },
  {
    key: "5",
    label: "Where can I get support?",
    children: (
      <>
        <p>
          Reach out to team hypersol at{" "}
          <Link target="_blank" to="https://t.me/hypersol">
            Telegram
          </Link>{" "}
          or{" "}
          <Link target="_blank" to="https://x.com/hypersolX">
            Twitter
          </Link>
        </p>
      </>
    ),
  },
];

export const SIncinerator = () => {
  const [tokensList, setTokensList] = useState([]);
  const [userTokensAta, setUserTokenAta] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [selectedTokens, setSelectedTokens] = useState({});

  const [notifyApi] = useContext(NotifyContext);
  const [appStore] = useContext(AppContext);

  const wallet = useWallet();
  const { connection } = useConnection();

  const onSelect = (event, mint) => {
    let selectedCount = 0;
    Object.keys(selectedTokens).forEach((item) => {
      if (selectedTokens[item]) {
        selectedCount++;
      }
    });

    if (selectedCount >= 10 && !selectedTokens[mint]) {
      message.error("Only 10 accounts at a time are allowed !!");
      return;
    }

    setSelectedTokens((prev) => ({
      ...prev,
      [mint]: !prev[mint],
    }));
  };

  const getTokensDetailsList = async () => {
    const tokenUtils = new TokenUtils(connection);
    const userTokens = await tokenUtils.getUserTokensDetails(wallet.publicKey);
    const userTokensDetail = await tokenUtils.getTokensFullDetails(
      userTokens.map((item) => item.mint)
    );
    // const userTokensDetail = [];
    return { userTokensDetail, userTokens };
  };

  const onCloseAccounts = async () => {
    // close account and get back rent
    const cluster = getCluster(appStore?.currentNetwork);

    const tx = new Transaction();

    Object.keys(selectedTokens).forEach((item) => {
      if (selectedTokens[item]) {
        const ftItem = tokensList.find((_item) => _item.mint === item);
        const ataItem = userTokensAta.find((_item) => _item.mint == item);

        const pgId = new PublicKey(ftItem.programId);

        const tokenAccount = new PublicKey(ataItem.pubkey);

        tx.add(
          createBurnCheckedInstruction(
            tokenAccount,
            new PublicKey(item),
            wallet.publicKey,
            ataItem.amount,
            ftItem.decimals,
            [],
            pgId
          )
        );

        tx.add(
          createCloseAccountInstruction(
            tokenAccount,
            wallet.publicKey,
            wallet.publicKey,
            [],
            pgId
          )
        );
      }
    });

    if (tx.instructions < 1) {
      message.error("No Token Selected !!");
      return;
    }

    // transaction is ready

    const signature = await SolUtils.sendAndConfirmRawTransactionV2(
      connection,
      tx,
      wallet.publicKey,
      wallet,
      [],
      notifyApi,
      cluster
    );

    if (!signature) {
      throw new Error("Unable to process transaction");
    } else {
      const newList = tokensList.filter((item) => {
        if (selectedTokens[item.mint]) {
          return false;
        }
        return true;
      });
      setTokensList(newList);
      setSelectedTokens({});
    }
  };

  useEffect(() => {
    let filteredTokens = tokensList;
    if (currentFilter && currentFilter?.trim() != "") {
      filteredTokens = tokensList.filter(
        (item) =>
          item?.metadata?.data?.symbol
            ?.toLowerCase()
            ?.includes(currentFilter?.toLowerCase()) ||
          item?.metadata?.data?.name
            ?.toLowerCase()
            ?.includes(currentFilter?.toLowerCase())
      );
    }
    setFilteredList(filteredTokens);
  }, [currentFilter, tokensList]);

  useEffect(() => {
    if (wallet.connected && connection) {
      setIsFetching(true);
      getTokensDetailsList()
        .then((resList) => {
          const { userTokensDetail, userTokens } = resList;
          setTokensList(userTokensDetail);
          setUserTokenAta(userTokens);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
    return () => {};
  }, [wallet, connection]);

  return (
    <div className={incStyles.incineratorContainer}>
      <div className={incStyles.myTokensPageContainer}>
        {!wallet.connected ? (
          <ConnectWalletCard
            title="Connect to wallet to Close Token Account !!"
            description="Connect your wallet to use Solana Incinerator, Close Token Accounts and redeem desposited SOL"
          />
        ) : (
          <>
            <div className={incStyles.tokenPageTitleConatiner}>
              <h2 className={incStyles.minFormTitle}>
                <span className={incStyles.highlighText}>
                  Incinerator:&nbsp;
                </span>
                Close Accounts
              </h2>
              <div className={incStyles.headerLine}></div>
            </div>
            <div className={incStyles.tokenSearchContainer}>
              <SearchTokensFilter
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
                selectedTokens={selectedTokens}
                onCloseAccounts={onCloseAccounts}
              />
            </div>
            <div className={incStyles.tokensConatiner}>
              {isFetching ? (
                new Array(12).fill(1).map((item) => {
                  return <Skeleton className={incStyles.tokenItem} active />;
                })
              ) : (
                <>
                  {filteredList?.length < 1 ? (
                    <p>No Tokens in your wallet.</p>
                  ) : (
                    filteredList.map((currentToken) => {
                      return (
                        <DisplayTokenCard
                          tokenDetails={currentToken}
                          selectedTokens={selectedTokens}
                          setSelectedTokens={setSelectedTokens}
                          onSelect={onSelect}
                          userTokensAta={userTokensAta}
                        />
                      );
                    })
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div>
        <div className={incStyles.headerLine}></div>
        <FaqSection faqItems={faqItems} />
      </div>
    </div>
  );
};
