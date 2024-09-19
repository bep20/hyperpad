import React from "react";
import Tooltip from "antd/es/tooltip";
import { CopyOutlined, ExportOutlined } from "@ant-design/icons";
import launchpadStyle from "../style/launchpad.module.less";

export const CopyRedirectString = ({ data, link, ...props }) => {
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
  return (
    <p {...props} className={launchpadStyle.copyRedirect}>
      <Tooltip title={tooltipText} onOpenChange={handleTooltipVisibleChange}>
        <a onClick={() => handleCopy(data)} className={launchpadStyle.data}>
          {data}
        </a>
      </Tooltip>
      <Tooltip title={tooltipText} onOpenChange={handleTooltipVisibleChange}>
        <a onClick={() => handleCopy(data)} className={launchpadStyle.copy}>
          &nbsp;
          <CopyOutlined style={{ color: "gray" }} />
          &nbsp;
        </a>
      </Tooltip>
      <a href={link} target="_blank" className={launchpadStyle.redirect}>
        &nbsp;
        <ExportOutlined style={{ color: "gray" }} />
      </a>
    </p>
  );
};
