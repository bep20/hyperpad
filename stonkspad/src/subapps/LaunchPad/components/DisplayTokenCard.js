import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import launchpadStyle from "../style/launchpad.module.less";
import Button from "antd/es/button";
import axios from "axios";
import { calculateTotalSupply } from "../utils/helpers";

export const DisplayTokenCard = ({ tokenDetails }) => {
  const [URIData, setURIData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenDetails?.metadata?.uri?.length) {
      axios({
        method: "GET",
        url: tokenDetails?.metadata?.uri,
      })
        .then((res) => {
          setURIData(res.data);
        })
        .catch((err) => {
          console.log("catched error", err);
        });
    }
  }, [tokenDetails?.metadata?.uri]);

  const calculatedSupply = calculateTotalSupply(
    tokenDetails?.mintData?.supply,
    tokenDetails?.mintData?.decimals
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
              <p className={launchpadStyle.cardTitle}>{`${
                tokenDetails?.metadata?.name || ""
              }${
                tokenDetails?.metadata?.symbol
                  ? `(${tokenDetails?.metadata?.symbol || ""})`
                  : ""
              }`}</p>
              {/* <p className={launchpadStyle.cardDescription}>
                {tokenDetails.description}
              </p> */}
            </div>
          </div>
          <div className={launchpadStyle.metaDetails}>
            <div className={launchpadStyle.metaDetailsItem}>
              <p>Total Supply : </p>
              <p>{calculatedSupply || ""} </p>
            </div>
            <div className={launchpadStyle.metaDetailsItem}>
              <p>Decimals : </p>
              <p>{tokenDetails.mintData?.decimals || ""} </p>
            </div>
            <div className={launchpadStyle.metaDetailsItem}>
              <p>Mintable : </p>
              <p>{tokenDetails.mintable ? "Yes" : "No"} </p>
            </div>
          </div>
          <div className={launchpadStyle.updateAction}>
            <Button
              onClick={() => {
                navigate(`${tokenDetails.mintAddress}`);
              }}
              className={`${launchpadStyle.primaryButton} ${launchpadStyle.updateInfoButton}`}
            >
              View & Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
