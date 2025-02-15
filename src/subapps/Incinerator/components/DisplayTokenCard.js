import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import incStyles from "../style/incinerator.module.less";
import axios from "axios";
import { HyperButton } from "../../../components/buttons/HyperButton";
import { TokenUtils } from "../../../solana/TokenUtils";
import Checkbox from "antd/es/checkbox";

export const DisplayTokenCard = ({
  tokenDetails,
  selectedTokens,
  setSelectedTokens,
  onSelect,
  userTokensAta,
}) => {
  const [URIData, setURIData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenDetails?.metadata?.data?.uri?.length) {
      axios({
        method: "GET",
        url: tokenDetails?.metadata?.data?.uri,
      })
        .then((res) => {
          setURIData(res.data);
        })
        .catch((err) => {
          console.log("catched error", err);
        });
    }
  }, [tokenDetails?.metadata?.data?.uri]);

  const ataItem = userTokensAta.find((item) => item.mint == tokenDetails?.mint);

  return (
    <div className={incStyles.tokenItem}>
      <div
        className={incStyles.tokenCard}
        onClick={(event) => onSelect(event, tokenDetails?.mint)}
      >
        <div className={incStyles.tokenCardContent}>
          <div>
            <Checkbox checked={selectedTokens[tokenDetails?.mint]} />
          </div>
          <div className={incStyles.mainDetails}>
            <div className={incStyles.mediaSection}>
              <div className={incStyles.imageContainer}>
                <img src={URIData?.image} />
              </div>
            </div>
          </div>
          <div className={incStyles.metaDetails}>
            <p>{`${
              tokenDetails?.metadata?.data?.name?.replace(/\u0000/g, "") || ""
            }${
              tokenDetails?.metadata?.data?.symbol
                ? `(${
                    tokenDetails?.metadata?.data?.symbol?.replace(
                      /\u0000/g,
                      ""
                    ) || ""
                  })`
                : ""
            }`}</p>
            <p>
              {`${tokenDetails.mint.slice(0, 4)}...${tokenDetails.mint.slice(-4)}`}{" "}
            </p>
            <p>Balance: {ataItem?.uiAmount}</p>
            <p>{tokenDetails.program} </p>
          </div>
        </div>
      </div>
    </div>
  );
};
