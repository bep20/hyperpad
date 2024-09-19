import Input from "antd/es/input/Input";
import React from "react";
import launchpadStyle from "../style/launchpad.module.less";

export const SearchTokensFilter = ({ currentFilter, setCurrentFilter }) => {
  return (
    <div>
      <Input
        value={currentFilter.name}
        placeholder="Enter Token Name or token symbol"
        className={launchpadStyle.inputTokenSearch}
        style={{
          borderRadius: "16px",
          width: 300,
        }}
        onChange={(event) =>
          setCurrentFilter((prev) => {
            return {
              ...prev,
              name: event.target.value,
            };
          })
        }
      />
    </div>
  );
};
