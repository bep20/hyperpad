import React from "react";
import launchpadStyle from "../style/launchpad.module.less";
import Row from "antd/es/row";
import Col from "antd/es/col";
import { calculateTotalSupply } from "../utils/helpers";
import { CopyString } from "./CopyString";
import { CopyRedirectString } from "./CopyRedirectString";

export const TokenDetails = ({ tokenData }) => {
  const caculatedTotalSupply = calculateTotalSupply(
    tokenData?.supply,
    tokenData?.decimals
  );
  return (
    <div className={launchpadStyle.tokenDetailsContent}>
      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Name</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          <p>{tokenData?.name || ""}</p>
        </Col>
      </Row>
      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Symbol</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          <p>{tokenData?.symbol}</p>
        </Col>
      </Row>

      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Supply</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          <p>{caculatedTotalSupply}</p>
        </Col>
      </Row>
      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Decimals</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          <p>{tokenData?.decimals}</p>
        </Col>
      </Row>

      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Metadata URI</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          <CopyRedirectString
            data={tokenData?.uri || ""}
            link={tokenData?.uri || ""}
          />
        </Col>
      </Row>

      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Token Program</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          <CopyString data={tokenData?.mintAccountOwner || ""} />
        </Col>
      </Row>
      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Mint Authority</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          {tokenData?.mintAuthority ? (
            <CopyString data={tokenData?.mintAuthority || ""} />
          ) : (
            "NONE"
          )}
        </Col>
      </Row>
      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Freeze Authority</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          {tokenData?.freezeAuthority ? (
            <CopyString data={tokenData?.freezeAuthority || ""} />
          ) : (
            "NONE"
          )}
        </Col>
      </Row>
      <Row gutter={24} className={launchpadStyle.detailsRow}>
        <Col span={6} className={launchpadStyle.detailsRowColumn}>
          <p>Description</p>
        </Col>
        <Col span={18} className={launchpadStyle.detailsRowColumn}>
          <p>{tokenData?.uriData?.description}</p>
        </Col>
      </Row>
    </div>
  );
};
