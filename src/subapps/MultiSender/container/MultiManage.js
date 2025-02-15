import React from 'react';
import multisenderStyle from '../style/multisender.module.less';
import { ManageMultiSender } from '../components/ManageMultiSender';
import Alert from 'antd/es/alert';

export const MultiManage = () => {
  return (
    <div className={multisenderStyle.container}>
      {/* <Alert
        showIcon
        message={
          <h2 style={{ margin: "0px", width: "100%" }}>
            Multisender is currently under maintenance. Will be available in 2-3
            days
          </h2>
        }
        type="warning"
        banner={false}
      /> */}
      <ManageMultiSender />
    </div>
  );
};
