/* eslint-disable react/no-array-index-key */
import React, { useContext } from 'react';
import Drawer from 'antd/es/drawer';
import { CheckOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AppContext, NETWORKS_OPTIONS } from '../../context/AppStore';
import RPCContent from './rpc/Content';

const MobileDrawer = ({ drawer, closeDrawer }) => {
  const [appStore, dispatchAppStore] = useContext(AppContext);
  const currentNetwork = appStore?.currentNetwork;
  const navigate = useNavigate();

  return (
    <Drawer
      title='Settings'
      closable={false}
      onClose={closeDrawer}
      open={drawer}
      width={320}
      extra={<CloseCircleOutlined onClick={closeDrawer} />}
      style={{
        background: 'linear-gradient(180deg, var(--faded-color), #fff',
      }}>
      <div className='flex flex-col gap-y-8'>
        <div className='flex flex-col gap-y-2'>
          <h3 className='font-Bebas'>Network type:</h3>
          <div className='flex items-center justify-between gap-x-4'>
            {NETWORKS_OPTIONS.map((opt, i) => (
              <div
                key={i}
                className='bg-gradient-border font-bold flex items-center justify-between gap-x-2 flex-1 text-center rounded-md py-2 px-3'
                onClick={() => {
                  dispatchAppStore({
                    type: 'SET_NETWORK',
                    payload: opt.value,
                  });
                  if (opt.value != currentNetwork) {
                    navigate(0);
                  }
                }}>
                {opt.label}
                {opt.value === currentNetwork && (
                  <CheckOutlined style={{ color: '#9800ed' }} />
                )}
              </div>
            ))}
          </div>
        </div>
        <RPCContent />
      </div>
    </Drawer>
  );
};

export default MobileDrawer;
