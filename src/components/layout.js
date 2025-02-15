import React from 'react';
import Layout from 'antd/es/layout';
import { Content } from 'antd/es/layout/layout';
import { Route, Routes } from 'react-router-dom';
import { StonkSider } from './Sider';
import layoutStyle from '../style/layout.module.less';
import { LaunchPad } from '../subapps/LaunchPad';
import { StonkNavBar } from './navbar';
import { Home } from '../subapps/Home';
import { MultiSender } from '../subapps/MultiSender';
import { Locker } from '../subapps/Locker';
import { Burner } from '../subapps/Burner';
import { TokenScanner } from '../subapps/TokenScanner';
import { SnapShot } from '../subapps/Snapshot';
import { Incinerator } from '../subapps/Incinerator';
import WithFooter from '../hocs/WithFooter';
import { ManageWallet } from '../subapps/ManageWallet';
import Bumpi from '../subapps/Bumpi';

export const PadLayout = () => (
  // const allRoutes = getAllRoutes();

  <Layout class='flex h-screen'>
    <StonkSider />
    <RightPanel />
  </Layout>
);

const RightPanel = WithFooter(() => (
  <>
    <StonkNavBar />
    <div className={layoutStyle.layoutBox}>
      <Content className={layoutStyle.layoutContent}>
        {/* <Routes>{allRoutes}</Routes> */}
        <Routes>
          {/* <Route path="/launchpad/*" element={<LaunchPad />} /> */}
          {/* <Route path="/airdrop/*" element={<AirDrop />} /> */}
          <Route path='/' element={<Home />} />
          <Route path='/solana-multi-sender/*' element={<MultiSender />} />
          <Route path='/manage-wallet/*' element={<ManageWallet />} />
          <Route path='/locker/*' element={<Locker />} />
          <Route path='/solana-token-manager/*' element={<LaunchPad />} />
          <Route path='/launch/*' element={<LaunchPad />} />
          <Route path='/solana-token-burner/*' element={<Burner />} />
          <Route path='/scanner/*' element={<TokenScanner />} />
          <Route path='/snapshot/*' element={<SnapShot />} />
          <Route path='/solana-incinerator/*' element={<Incinerator />} />
          <Route path='/pumpfun-bump-bot/*' element={<Bumpi />} />
        </Routes>
      </Content>
    </div>
  </>
));
