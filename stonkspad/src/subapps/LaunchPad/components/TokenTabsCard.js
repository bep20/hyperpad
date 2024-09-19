import React from "react";
import Card from "antd/es/card";

export const TokenTabsCard = ({ children }) => {
  return (
    <Card
      style={{
        width: "100%",
        height: "100%",
        borderTop: "0px",
        borderTopLeftRadius: "0px",
      }}
    >
      {children}
    </Card>
  );
};
