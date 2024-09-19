import React, { useContext, useState, useEffect } from "react";
import Button from "antd/es/button";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import navStyle from "../style/navbar.module.less";
import { useMenu } from "../store/useMenu";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Modal from "antd/es/modal/Modal";
import { AppContext, AVAILABLE_NETWORKS, NETWORKS } from "../context/AppStore";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ConnectionModal } from "./Modals/ConnectionModal";
import storage from "../utils/storage";

function truncateAddress(address, prefixLength = 4, suffixLength = 4) {
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }

  const prefix = address.substring(0, prefixLength);
  const suffix = address.substring(address.length - suffixLength);

  return `${prefix}...${suffix}`;
}

export const StonkNavBar = () => {
  const [isNavBarOpen, dispatchMenu] = useMenu((state) => [
    state.isNavBarOpen,
    state.dispatch,
  ]);
  const [appStore, dispatchAppStore] = useContext(AppContext);
  const [changingConnection, setChangingConnection] = useState(false);

  const wallet = useWallet();
  const connection = useConnection();
  console.log("connectionisis", wallet, appStore, connection);
  const handleMenuToggle = () => {
    dispatchMenu({ type: "TOGGLE_MENU" });
  };

  const currentNetwork = appStore?.currentNetwork;

  useEffect(() => {
    const network_type = storage.get("NETWORK_TYPE");
    if (network_type && AVAILABLE_NETWORKS.includes(network_type)) {
      dispatchAppStore({ type: "SET_NETWORK", payload: network_type });
    }
  }, []);

  useEffect(() => {
    const fetchBalance = async (connection, publicKey) => {
      console.log("connectionandpub", connection, publicKey);
      let balance = await connection.getBalance(publicKey, "confirmed");
      balance = balance / LAMPORTS_PER_SOL;
      console.log("balance == " + balance);
    };

    connection?.connection &&
      wallet?.publicKey &&
      fetchBalance(connection.connection, wallet.publicKey);
  }, [connection.connection, wallet.publicKey]);

  return (
    <nav className={navStyle.navbarContainer}>
      <div className={navStyle.navbarToggle} onClick={handleMenuToggle}>
        {isNavBarOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <div className={navStyle.navbarLogo}>StonksPad</div>
      <div className={navStyle.navbarSpacer}></div>
      <div
        className={navStyle.navbarChain}
        onClick={() => setChangingConnection(true)}
      >
        <span>{`${currentNetwork}`}</span>
      </div>
      <div className={navStyle.navbarConnect}>
        {wallet.connected ? (
          <WalletDisconnectButton
            style={{
              backgroundColor: "transparent",
              color: "black",
              borderRadius: "20px",
              fontSize: "1rem",
              height: "40px",
            }}
          >
            {truncateAddress(wallet?.publicKey?.toBase58() || "")}
          </WalletDisconnectButton>
        ) : (
          <WalletMultiButton
            style={{
              backgroundColor: "transparent",
              color: "black",
              borderRadius: "20px",
              fontSize: "1rem",
              height: "40px",
            }}
          >
            Connect
          </WalletMultiButton>
        )}
      </div>
      <ConnectionModal
        changingConnection={changingConnection}
        setChangingConnection={setChangingConnection}
      />
    </nav>
  );
};
