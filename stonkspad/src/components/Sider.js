import React, { useState, useEffect } from 'react';
import {
  HomeOutlined,
  ClusterOutlined,
  FileTextOutlined,
  FireOutlined,
  MediumOutlined,
  LockOutlined,
  RocketOutlined,
  ScanOutlined,
  GiftOutlined,
  RadarChartOutlined,
  AuditOutlined,
  HourglassOutlined,
} from '@ant-design/icons';

import Menu from 'antd/es/menu';
import { NavLink, useLocation } from 'react-router-dom';
import { TelegramIcon } from '../icons/socials/telegram';

import { SUB_APP_NAVIGATION as NAVIGATION_LAUNCHPAD } from '../subapps/LaunchPad/nav';
import { SUB_APP_NAVIGATION as NAVIGATION_SNAPSHOT } from '../subapps/Snapshot/nav';
import { SUB_APP_NAVIGATION as NAVIGATION_MULTISENDER } from '../subapps/MultiSender/nav';
import { SUB_APP_NAVIGATION as NAVIGATION_MANAGEWALLET } from '../subapps/ManageWallet/nav';
import { useMenu } from '../store/useMenu';
import useDevice from '../hooks/useDevice';
import { CoinIcon } from '../icons/navs/coin';
import { TwitterIcon } from '../icons/socials/twitter';
import SliderHeader from './SliderHeader';
import { BUMPI_BOT_SUBAPPS } from '../subapps/Bumpi/nav';

const RenderLevel2 = ({ text, baseNav, route }) => (
  <NavLink to={`${baseNav}/${route}`}>{text}</NavLink>
);

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
    label: (
      <NavLink style={{ color: 'inherit' }} to={`/${route}`}>
        {label}
      </NavLink>
    ),
    type,
  };
}

const getSubAppItems = (baseNav, items = []) => {
  const result = [];
  for (const item of items) {
    result.push(getL2Item(baseNav, item.route, item.name, item.key, item.icon));
  }
  return result;
};

const getNavigationItems = () => {
  const navItems = [];

  // Home
  navItems.push(getL1NavItem('', 'Home', 'home', <HomeOutlined />));

  // Launchpad
  // navItems.push(
  //   getL1Item(
  //     "Launchpad",
  //     "launchpad",
  //     <RocketFilled />,
  //     getSubAppItems(NAVIGATION_LAUNCHPAD, "launchpad")
  //   )
  // );
  // airdrop
  // navItems.push(
  //   getL1Item(
  //     "AirDrop",
  //     "airdrop",
  //     <RocketFilled />,
  //     getSubAppItems(NAVIGATION_AIRDROP, "airdrop")
  //   )
  // );
  navItems.push(
    getL1NavItem(
      'solana-multi-sender/distribute',
      'MultiSender',
      'solana-multi-sender',
      <ClusterOutlined />,
      getSubAppItems('solana-multi-sender', NAVIGATION_MULTISENDER),
    ),
  );
  navItems.push(
    getL1NavItem(
      'manage-wallet/wallets-generator',
      'ManageWallet',
      'manage-wallet',
      <ClusterOutlined />,
      getSubAppItems('manage-wallet', NAVIGATION_MANAGEWALLET),
    ),
  );
  navItems.push(
    getL1NavItem(
      'solana-token-burner',
      'Burner',
      'solana-token-burner',
      <FireOutlined />,
    ),
  );
  navItems.push(getL1NavItem('locker', 'Locker', 'locker', <LockOutlined />));
  navItems.push(
    getL1NavItem(
      'solana-token-manager/manage-token',
      'Token Manager',
      'solana-token-manager',
      <CoinIcon />,
      getSubAppItems('solana-token-manager', NAVIGATION_LAUNCHPAD),
    ),
  );

  navItems.push(
    getL1NavItem(
      'snapshot',
      'Snapshot',
      'snapshot',
      <RadarChartOutlined />,
      getSubAppItems('snapshot', NAVIGATION_SNAPSHOT),
    ),
  );
  navItems.push(
    getL1NavItem(
      'solana-incinerator',
      'Incinerator',
      'solana-incinerator',
      <AuditOutlined />,
    ),
  );
  navItems.push(
    getL1NavItem('launch', 'Launcher', 'launch', <RocketOutlined />),
  );
  navItems.push(
    getL1NavItem('scanner', 'Scanner', 'scanner', <ScanOutlined />),
  );
  navItems.push(
    getL1NavItem(
      'pumpfun-bump-bot/start',
      'Bumpi Bot',
      'pumpfun-bump-bot',
      <HourglassOutlined />,
      getSubAppItems('pumpfun-bump-bot', BUMPI_BOT_SUBAPPS),
    ),
  );

  navItems.push({ type: 'divider' });

  // social media links
  navItems.push({
    key: 'Rewards',
    icon: <GiftOutlined />,
    children: null,
    label: (
      <a target='_blank' href='https://hypersol.xyz' rel='noreferrer'>
        Rewards
      </a>
    ),
    type: null,
  });
  navItems.push({
    key: 'whitepaper',
    icon: <FileTextOutlined />,
    children: null,
    label: (
      <a
        target='_blank'
        href='https://whitepaper.hypersol.xyz/v1'
        rel='noreferrer'>
        Whitepaper
      </a>
    ),
    type: null,
  });
  navItems.push({
    key: 'twitter',
    icon: <TwitterIcon />,
    children: null,
    label: (
      <a target='_blank' href='https://x.com/hypersolX' rel='noreferrer'>
        Twitter
      </a>
    ),
    type: null,
  });
  navItems.push({
    key: 'telegram',
    icon: <TelegramIcon />,
    children: null,
    label: (
      <a target='_blank' href='https://t.me/hypersol' rel='noreferrer'>
        Telegram
      </a>
    ),
    type: null,
  });
  navItems.push({
    key: 'medium',
    icon: <MediumOutlined />,
    children: null,
    label: (
      <a target='_blank' href='https://hypersol.medium.com' rel='noreferrer'>
        Medium
      </a>
    ),
    type: null,
  });

  return navItems;
};

export const StonkSider = () => {
  const [openKeys, setOpenKeys] = useState([]);
  const [isNavBarOpen, dispatchMenu] = useMenu(state => [
    state?.isNavBarOpen,
    state?.dispatch,
  ]);
  const { isMobile } = useDevice();
  const location = useLocation();

  useEffect(() => {
    if (isMobile) {
      dispatchMenu({ type: 'CLOSE_NAVBAR' });
    }
  }, [isMobile]);

  const getSelectedKey = (l2, l1) => {
    const navItems = getNavigationItems();

    if (l2 && Array.isArray(navItems)) {
      for (let item of navItems) {
        if (item?.children && Array.isArray(item?.children)) {
          for (let child of item?.children) {
            if (child.key == l2) {
              return l2;
            }
          }
        }
      }
    }

    return l1 || 'home';
  };

  useEffect(() => {
    const pathnameParts = location.pathname.split('/');
    // Extract l1 and l2 from the URL if they exist
    const l1 = pathnameParts[1] || ''; // Default to empty string if l1 is undefined
    if (!openKeys.includes(l1)) {
      setOpenKeys(prev => [...prev, l1]);
    }
  }, [location.pathname, setOpenKeys]);

  const pathnameParts = location.pathname.split('/');
  // Extract l1 and l2 from the URL if they exist
  const l1 = pathnameParts[1] || ''; // Default to empty string if l1 is undefined
  const l2 = pathnameParts[2] || ''; // Default to empty string if l2 is undefined

  const selectedKey = getSelectedKey(l2, l1);

  return (
    <div
      className={`max-w-[250px] flex flex-col ${isNavBarOpen && isMobile ? 'absolute z-[11] h-[100%]' : ''}`}
      style={{
        transition: 'width 0.5s',
        ...(isMobile && { width: isNavBarOpen ? '200px' : 0 }),
      }}>
      {isMobile && !isNavBarOpen ? null : (
        <SliderHeader
          showLogo={isNavBarOpen}
          showToggleIcon={!isMobile || isNavBarOpen}
          bg='#fff'
        />
      )}
      <div className='flex-1 overflow-auto'>
        {isMobile ? (
          <Menu
            openKeys={openKeys}
            selectedKeys={[selectedKey]}
            selectable
            mode='inline'
            inlineCollapsed={false}
            onSelect={() => {
              dispatchMenu({ type: 'TOGGLE_MENU' });
            }}
            onOpenChange={valllll => {
              const opky = new Set(valllll);
              setOpenKeys(Array.from(opky));
            }}
            style={{
              minHeight: '100%',
              borderRight: 0,
            }}
            items={getNavigationItems()}
          />
        ) : (
          <Menu
            openKeys={openKeys}
            selectedKeys={[selectedKey]}
            selectable
            inlineCollapsed={!isNavBarOpen}
            mode='inline'
            onSelect={() => {}}
            onClick={() => {}}
            onOpenChange={valllll => {
              const opky = new Set(valllll);
              setOpenKeys(Array.from(opky));
            }}
            style={{
              minHeight: '100%',
              borderRight: 0,
            }}
            items={getNavigationItems()}
          />
        )}
      </div>
    </div>
  );
};
