import React from 'react';
import Alert from 'antd/es/alert';

const Maintenance = ({ componentType }) => {
  return (
    <Alert
      showIcon
      message={
        <h4 style={{ margin: '0px', width: '100%' ,fontSize:"13px"}}>
          {componentType} is currently under maintenance. Will be available in
          2-3 days
        </h4>
      }
      type='warning'
      banner={false}
    />
  );
};

export default Maintenance;
