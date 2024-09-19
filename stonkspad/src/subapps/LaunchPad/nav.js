import React from "react";
import {
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

export const SUB_APP_NAVIGATION = [
  {
    name: "Create Launchpad",
    route: "createlaunchpad",
    key: "createlaunchpad",
    icon: <PieChartOutlined />,
  },
  {
    name: "Create Fair Launch",
    route: "createfairlaunch",
    key: "createfairlaunch",
    icon: <MailOutlined />,
  },
  {
    name: "Create Token",
    route: "createtoken",
    key: "createtoken",
    icon: <DesktopOutlined />,
  },
  {
    name: "My Tokens",
    route: "mytokens",
    key: "mytokens",
    icon: <MailOutlined />,
  },
  {
    name: "Launchpad list",
    route: "launchpadlist",
    key: "launchpadlist",
    icon: <ContainerOutlined />,
  },
];
