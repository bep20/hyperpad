import React from "react";
import Card from "antd/es/card";
import launchpadStyle from "../style/launchpad.module.less";
import { CopyOutlined } from "@ant-design/icons";
import Tooltip from "antd/es/tooltip";
import { SocialIcon } from "react-social-icons";
import { calculateTotalSupply } from "../utils/helpers";
import { CopyString } from "./CopyString";

export const TokenBasicDetails = ({ tokenData }) => {
  const [tooltipText, setTooltipText] = React.useState("Click to copy");

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setTooltipText("Copied !!");
  };
  const handleTooltipVisibleChange = (visible) => {
    if (!visible) {
      setTooltipText("Copy to clipboard");
    }
  };

  const caculatedTotalSupply = calculateTotalSupply(
    tokenData?.supply,
    tokenData?.decimals
  );

  return (
    <div className={launchpadStyle.tokenBasicDetails}>
      <Card style={{ width: "100%" }}>
        <div className={launchpadStyle.cardContent}>
          <div className={launchpadStyle.leftContainer}>
            <div className={launchpadStyle.imageContainer}>
              <img src={tokenData?.uriData?.image || ""} />
            </div>
            <div className={launchpadStyle.textContainer}>
              <p>{tokenData?.name || ""}</p>
              <p>
                <CopyString data={tokenData.mint} dataToCopy={tokenData.mint} />
              </p>
              <p>{tokenData?.symbol || ""}</p>
            </div>
          </div>
          <div className={launchpadStyle.rightContainer}>
            <div>{/* {caculatedTotalSupply}&nbsp;{tokenData?.symbol} */}</div>
            <div>
              <SocialIcon
                target="_blank"
                network="x"
                style={{ width: "30px", height: "30px", margin: "5px" }}
                url={tokenData?.uriData?.socialMedia?.twitter || ""}
              />
              <SocialIcon
                style={{ width: "30px", height: "30px", margin: "5px" }}
                network="telegram"
                url={tokenData?.uriData?.socialMedia?.telegram || ""}
              />
              <SocialIcon
                style={{ width: "30px", height: "30px", margin: "5px" }}
                network="medium"
                url={tokenData?.uriData?.socialMedia?.medium || ""}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
