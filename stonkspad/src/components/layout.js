import React from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Breadcrumb from "antd/es/breadcrumb";
import Layout from "antd/es/layout";
import Menu from "antd/es/menu";
import { Header } from "antd/es/layout/layout";
import { Content } from "antd/es/layout/layout";
import { Footer } from "antd/es/layout/layout";
import { StonkSider } from "./Sider";
import layoutStyle from "../style/layout.module.less";
import { LaunchPad } from "../subapps/LaunchPad";
import { Route, Routes } from "react-router-dom";
import { getAllRoutes } from "../navigation/baseroutes";
import { StonkNavBar } from "./Navbar";
import { AirDrop } from "../subapps/Airdrop";
import { Home } from "../subapps/Home";
import { MultiSender } from "../subapps/MultiSender";

const items1 = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));
const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
  (icon, index) => {
    const key = String(index + 1);
    return {
      key: `sub${key}`,
      icon: React.createElement(icon),
      label: `subnav ${key}`,
      children: new Array(4).fill(null).map((_, j) => {
        const subKey = index * 4 + j + 1;
        return {
          key: subKey,
          label: `option${subKey}`,
        };
      }),
    };
  }
);
export const PadLayout = () => {
  // const allRoutes = getAllRoutes();
  return (
    <Layout className={layoutStyle.layoutContainer}>
      <Header className={layoutStyle.layoutHeader}>
        <StonkNavBar />
      </Header>
      <Layout className={layoutStyle.layoutWrap}>
        <StonkSider />
        <Layout className={layoutStyle.layoutBox}>
          <Content className={layoutStyle.layoutContent}>
            {/* <Routes>{allRoutes}</Routes> */}
            <Routes>
              <Route path="/launchpad/*" element={<LaunchPad />} />
              <Route path="/airdrop/*" element={<AirDrop />} />
              <Route path="/" element={<Home />} />
              <Route path="/multisender" element={<MultiSender />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
