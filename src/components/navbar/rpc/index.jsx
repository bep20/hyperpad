import { DownOutlined } from '@ant-design/icons';
import React from 'react';
import Popover from 'antd/es/popover';
import Content from './Content';

const RPC = () => {
  return (
    <Popover
      content={<Content />}
      trigger='click'
      overlayClassName='shaded-popover rpc-popover'
      className='sm:hidden'>
      <div className='bg-white cursor-pointer flex items-center gap-x-2 md:h-[30px] h-[44px] px-4 py-3 shadow-[-4px_4px_#000] lg:shadow-[-2px_2px_#000] hover:shadow-[-2px_2px_#000] rounded-md border border-black'>
        <div className='flex items-center justify-center p-[1px] border border-[#23c333] rounded-full h-3 w-3'>
          <i className='bg-[#23c333] rounded-full h-full w-full' />
        </div>
        <span className='font-Bebas font-medium text-2xl md:text-base'>
          RPC
        </span>
        <DownOutlined />
      </div>
    </Popover>
  );
};

export default RPC;
