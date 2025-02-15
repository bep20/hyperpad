import React from 'react';
import { MultisenderForm } from '../components/MultiSendForm';
import multisenderStyle from '../style/multisender.module.less';
import Alert from 'antd/es/alert';

export const MultiSend = () => {
  return (
    <div className={multisenderStyle.container}>
      <MultisenderForm />
    </div>
  );
};
