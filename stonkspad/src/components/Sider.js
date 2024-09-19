import React, { useState, useEffect } from "react";
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  RocketFilled,
} from "@ant-design/icons";
import Menu from "antd/es/menu";
import Button from "antd/es/button";
import Sider from "antd/es/layout/Sider";
import siderStyle from "../style/sider.module.less";
import { NavLink, useLocation, useParams } from "react-router-dom";

import { SUB_APP_NAVIGATION as NAVIGATION_LAUNCHPAD } from "../subapps/LaunchPad/nav";
import { SUB_APP_NAVIGATION as NAVIGATION_AIRDROP } from "../subapps/Airdrop/nav";

import { useMenu } from "../store/useMenu";
import useDevice from "../hooks/useDevice";

const RenderLevel2 = ({ text, baseNav, route }) => {
  return <NavLink to={`${baseNav}/${route}`}>{text}</NavLink>;
};

function getL2Item(baseNav, route, label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label: <RenderLevel2 text={label} baseNav={baseNav} route={route} />,
    type,
  };
}

function getL1NavItem(route, label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label: <NavLink to={`/${route}`}>{label}</NavLink>,
    type,
  };
}

function getL1Item(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const getSubAppItems = (items = [], baseNav) => {
  let result = [];
  for (let item of items) {
    result.push(getL2Item(baseNav, item.route, item.name, item.key, item.icon));
  }
  return result;
};

const getNavigationItems = (subapps = []) => {
  let navItems = [];

  // Home
  navItems.push(getL1NavItem("", "Home", "home", <RocketFilled />));

  // Launchpad
  navItems.push(
    getL1Item(
      "Launchpad",
      "launchpad",
      <RocketFilled />,
      getSubAppItems(NAVIGATION_LAUNCHPAD, "launchpad")
    )
  );
  // airdrop
  navItems.push(
    getL1Item(
      "AirDrop",
      "airdrop",
      <RocketFilled />,
      getSubAppItems(NAVIGATION_AIRDROP, "airdrop")
    )
  );
  navItems.push(
    getL1NavItem("multisender", "MultiSender", "multisender", <RocketFilled />)
  );
  return navItems;
};

export const StonkSider = () => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const [isNavBarOpen, dispatchMenu] = useMenu((state) => [
    state?.isNavBarOpen,
    state?.dispatch,
  ]);
  const { isMobile, isTablet, isPc } = useDevice();
  const location = useLocation();

  const pathnameParts = location.pathname.split("/");
  // Extract l1 and l2 from the URL if they exist
  let l1 = pathnameParts[1] || ""; // Default to empty string if l1 is undefined
  let l2 = pathnameParts[2] || ""; // Default to empty string if l2 is undefined
  console.log("isMobile", isMobile, isNavBarOpen, openKeys, selectedKeys);

  if (l1 == "") {
    l1 = "home";
    l2 = "home";
  }
  return (
    <>
      {isMobile ? (
        <>
          {isNavBarOpen ? (
            <>
              <div
                style={{
                  overflow: "auto",
                  height: "100%",
                  position: "fixed",
                  top: "0px",
                  left: "0px",
                  paddingTop: "70px",
                  zIndex: 10,
                  flex: "0 0 200px",
                  maxWidth: "200px",
                  minWidth: "200px",
                  width: "200px",
                }}
              >
                <Menu
                  defaultOpenKeys={[l1]}
                  defaultSelectedKeys={[l2]}
                  inlineCollapsed={false}
                  mode="inline"
                  onSelect={(vall) => {
                    console.log("vall", vall);
                    dispatchMenu({ type: "TOGGLE_MENU" });
                  }}
                  style={{
                    height: "100%",
                    borderRight: 0,
                  }}
                  items={getNavigationItems([])}
                />
              </div>
            </>
          ) : null}
        </>
      ) : (
        <div
          style={{
            maxWidth: 250,
          }}
        >
          <Menu
            defaultOpenKeys={[l1]}
            defaultSelectedKeys={[l2]}
            inlineCollapsed={isNavBarOpen}
            mode="inline"
            onSelect={(vall) => {
              console.log("vall", vall);
            }}
            onClick={(valll) => {
              console.log("valll", valll);
            }}
            style={{
              height: "100%",
              borderRight: 0,
            }}
            items={getNavigationItems([])}
          />
        </div>
      )}
    </>
  );
};
