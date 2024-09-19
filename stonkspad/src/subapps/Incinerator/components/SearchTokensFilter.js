import Input from "antd/es/input/Input";
import React, { useMemo } from "react";
import incStyles from "../style/incinerator.module.less";
import { HyperButton } from "../../../components/buttons/HyperButton";
import BigNumber from "bignumber.js";

export const SearchTokensFilter = ({
  currentFilter,
  setCurrentFilter,
  selectedTokens,
  onCloseAccounts,
}) => {
  const estimates = useMemo(() => {
    let result = new BigNumber(0);
    Object.keys(selectedTokens).forEach((item) => {
      if (selectedTokens[item]) {
        result = result.plus(new BigNumber(0.002));
      }
    });
    return result.toFixed(3).toString();
  }, [selectedTokens]);

  return (
    <div className={incStyles.searchContainer}>
      <Input
        value={currentFilter}
        placeholder="Enter Token Name or token symbol"
        className={incStyles.inputTokenSearch}
        style={{
          borderRadius: "16px",
          width: 300,
        }}
        onChange={(event) => setCurrentFilter(event.target.value)}
      />
      <HyperButton
        onClick={onCloseAccounts}
        text={`Close Accounts (${estimates} SOL)`}
      />
    </div>
  );
};
