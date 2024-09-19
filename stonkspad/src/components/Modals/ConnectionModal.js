import React, { useContext } from "react";
import { AppContext } from "../../context/AppStore";
import Modal from "antd/es/modal/Modal";
import { NETWORKS } from "../../context/AppStore";
import modalsStyle from "../../style/modals.module.less";
import Button from "antd/es/button";

export const ConnectionModal = ({
  changingConnection,
  setChangingConnection,
}) => {
  const [appStore, dispatchAppStore] = useContext(AppContext);

  const currentNetwork = appStore?.currentNetwork;
  const handleConnectionType = (newConnectionType) => {
    console.log("newConnectionType", newConnectionType);
    dispatchAppStore({ type: "SET_NETWORK", payload: newConnectionType });
    setChangingConnection(false);
  };

  //   uncomment it on activate mainnet
  return (
    <Modal
      open={changingConnection}
      footer={null}
      onCancel={() => setChangingConnection(false)}
      closeIcon={true}
      centered
      maskClosable={true}
    >
      <div className={modalsStyle.connectionTypeContainer}>
        <div
          onClick={() => handleConnectionType(NETWORKS.MAINNET)}
          className={`${modalsStyle.connectionTypeItem} ${
            currentNetwork === NETWORKS.MAINNET ? modalsStyle.activeNetwork : ""
          }`}
        >
          <Button className={modalsStyle.connectionTypeItemButton}>
            Mainnet
          </Button>
        </div>
        <div
          onClick={() => handleConnectionType(NETWORKS.TESTNET)}
          className={`${modalsStyle.connectionTypeItem} ${
            currentNetwork === NETWORKS.TESTNET ? modalsStyle.activeNetwork : ""
          }`}
        >
          <Button className={modalsStyle.connectionTypeItemButton}>
            Testnet
          </Button>
        </div>
        <div
          onClick={() => handleConnectionType(NETWORKS.DEVNET)}
          className={`${modalsStyle.connectionTypeItem} ${
            currentNetwork === NETWORKS.DEVNET ? modalsStyle.activeNetwork : ""
          }`}
        >
          <Button className={modalsStyle.connectionTypeItemButton}>
            Devnet
          </Button>
        </div>
      </div>
    </Modal>
  );
};
