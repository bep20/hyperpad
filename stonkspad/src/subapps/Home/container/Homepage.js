import React from 'react';
import Card from 'antd/es/card';
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  RocketFilled,
  HomeOutlined,
  ClusterOutlined,
  AppstoreAddOutlined,
  FireOutlined,
  FileTextOutlined,
  TwitterOutlined,
  MediumOutlined,
  LockOutlined,
  RadarChartOutlined,
  AuditOutlined,
  ScanOutlined,
  HourglassOutlined,
} from '@ant-design/icons';
import { ToolInfoCard } from '../components/ToolInfoCard';
import homeStyle from '../style/home.module.less';

export const Homepage = () => (
  <div className={homeStyle.homeContainer}>
    <div className={homeStyle.homeMainContent}>
      <h1>
        The Ultimate <span style={{ color: '#9800ed' }}>Tool Suite</span> on
        Solana Network
      </h1>
      <p>
        Elevate your Solana endeavors with our cutting-edge tool suite, your
        go-to solution for seamless, efficient project management!!
      </p>
    </div>
    <div className={homeStyle.cardsContainer}>
      <div className={homeStyle.cardWrap}>
        <ToolInfoCard
          icon={<ClusterOutlined />}
          mainTitle='MultiSender'
          mainDescription='Effortlessly distribute tokens, SOL in batch with a single click.'
          link='/solana-multi-sender/distribute'
        />
      </div>
      <div className={homeStyle.cardWrap}>
        <ToolInfoCard
          icon={<AppstoreAddOutlined />}
          mainTitle='Token Manager'
          mainDescription='Create and manage SPL/SPL22 tokens'
          link='/solana-token-manager/create-spl-token'
        />
      </div>
      <div className={homeStyle.cardWrap}>
        <ToolInfoCard
          icon={<RadarChartOutlined />}
          mainTitle='Snapshot'
          mainDescription='Take Snapshot of holders of any SPL/SPL22 tokens'
          link='/snapshot'
        />
      </div>
      <div className={homeStyle.cardWrap}>
        <ToolInfoCard
          icon={<HourglassOutlined />}
          mainTitle='PumpFun Bump bot'
          mainDescription='Bump your favorite tokens on pumpfun'
          link='/pumpfun-bump-bot/start'
        />
      </div>
      <div className={homeStyle.cardWrap}>
        <ToolInfoCard
          icon={<FireOutlined />}
          mainTitle='Burner'
          mainDescription='Burn your SPL/SPL22 and LP'
          link='/solana-token-burner'
        />
      </div>
      <div className={homeStyle.cardWrap}>
        <ToolInfoCard
          icon={<ScanOutlined />}
          mainTitle='Scanner'
          mainDescription='Scan SPL/SPL22 tokens, Generate holders token transfer graph'
          link='/scanner'
        />
      </div>
      {/* <div className={homeStyle.cardWrap}>
        <ToolInfoCard
          icon={<AuditOutlined />}
          mainTitle='Incinerator'
          mainDescription='Burn any unwanted tokens and reclaim the rent.'
          link='/solana-incinerator'
        />
      </div> */}
      {/* <div className={homeStyle.cardWrap}>
        <ToolInfoCard
          icon={<LockOutlined />}
          mainTitle='Locker'
          mainDescription='Lock your assets (SPL/ SPL22/ SOL/ LP) for a definite time frame'
          link='/locker'
        />
      </div> */}
    </div>
  </div>
);
