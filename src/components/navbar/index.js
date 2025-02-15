import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Select from 'antd/es/select';
import { SettingOutlined } from '@ant-design/icons';
import {
  AppContext,
  AVAILABLE_NETWORKS,
  NETWORKS_OPTIONS,
} from '../../context/AppStore';
import { ConnectionModal } from '../Modals/ConnectionModal';
import storage from '../../utils/storage';
import useDevice from '../../hooks/useDevice';
import '../../style/navbar.less';
import SliderHeader from '../SliderHeader';
import { useMenu } from '../../store/useMenu';
// import PriorityFee from './PriorityFee';
import MobileDrawer from './MobileDrawer';
import RPC from './rpc';

function truncateAddress(address, prefixLength = 4, suffixLength = 4) {
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }

  const prefix = address.substring(0, prefixLength);
  const suffix = address.substring(address.length - suffixLength);

  return `${prefix}...${suffix}`;
}

export const StonkNavBar = () => {
  const [appStore, dispatchAppStore] = useContext(AppContext);
  const [changingConnection, setChangingConnection] = useState(false);
  const { isMobile, isPc } = useDevice();
  const [currentPubKey, setCurrentPubKey] = useState(null);
  const navigate = useNavigate();
  const isNavBarOpen = useMenu(state => state.isNavBarOpen);
  const [drawer, setDrawer] = useState(false);
  const openDrawer = () => setDrawer(true);
  const closeDrawer = () => setDrawer(false);

  const wallet = useWallet();
  const connection = useConnection();

  const currentNetwork = appStore?.currentNetwork;

  useEffect(() => {
    const network_type = storage.get('NETWORK_TYPE');
    if (network_type && AVAILABLE_NETWORKS.includes(network_type)) {
      dispatchAppStore({ type: 'SET_NETWORK', payload: network_type });
    }
  }, []);

  useEffect(() => {
    if (isPc && wallet?.wallet?.adapter) {
      wallet.connect();
    }
  }, [wallet.wallet]);

  useEffect(() => {
    if (wallet.publicKey && !currentPubKey) {
      setCurrentPubKey(wallet.publicKey);
    } else if (!wallet.publicKey && currentPubKey) {
      navigate(0);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    const fetchBalance = async (connection, publicKey) => {
      let balance = await connection.getBalance(publicKey, 'confirmed');
      balance /= LAMPORTS_PER_SOL;
    };

    connection?.connection &&
      wallet?.publicKey &&
      fetchBalance(connection.connection, wallet.publicKey);
  }, [connection.connection, wallet.publicKey]);

  return (
    <nav
      className={`navbarContainer flex items-center px-2 py-3 w-full bg-[#f6f2f7] justify-between gap-x-8 border-b ${isMobile ? 'h-[48px]' : 'h-[68px]'} sticky top-0 z-10`}>
      {!isNavBarOpen && <SliderHeader showLogo showToggleIcon={isMobile} />}

      <div className='flex items-center gap-x-4 justify-end flex-1'>
        {/* <PriorityFee /> */}
        <RPC />
        <Select
          className='sm:hidden'
          size={isMobile ? 'small' : 'medium'}
          style={{
            width: isMobile ? 100 : 130,
          }}
          options={NETWORKS_OPTIONS}
          value={currentNetwork}
          onSelect={val => {
            dispatchAppStore({
              type: 'SET_NETWORK',
              payload: val,
            });
            if (val != currentNetwork) {
              navigate(0);
            }
          }}
        />
        <div className='navbarConnect'>
          <WalletMultiButton>
            {wallet.connected
              ? truncateAddress(wallet?.publicKey?.toBase58())
              : 'CONNECT'}
          </WalletMultiButton>
        </div>
        <SettingOutlined
          className='hidden sm:flex text-3xl'
          onClick={openDrawer}
        />
        <MobileDrawer drawer={drawer} closeDrawer={closeDrawer} />
        <ConnectionModal
          changingConnection={changingConnection}
          setChangingConnection={setChangingConnection}
        />
      </div>
    </nav>
  );
};
