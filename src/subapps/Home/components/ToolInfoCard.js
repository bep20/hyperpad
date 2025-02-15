import React from 'react';
import Card from 'antd/es/card';
import { Link } from 'react-router-dom';
import homeStyle from '../style/home.module.less';

export const ToolInfoCard = ({
  icon,
  mainTitle,
  mainDescription,
  link = '#',
}) => (
  <Card className={homeStyle.card}>
    <Link to={link}>
      <div className={homeStyle.cardContent}>
        <div className={homeStyle.cardContentIcon}>{icon}</div>
        <h3>{mainTitle}</h3>
        <p>{mainDescription}</p>
      </div>
    </Link>
  </Card>
  );
