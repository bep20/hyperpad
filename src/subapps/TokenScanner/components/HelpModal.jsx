import React, { useState } from 'react';
import { QuestionOutlined } from '@ant-design/icons';
import Modal from 'antd/es/modal/Modal';

const HelpModal = () => {
  const [show, setShow] = useState(false);
  return (
    <>
      <Modal
        title='Welcome to Bubble graph'
        open={show}
        onCancel={() => setShow(false)}
        footer={null}>
        <strong>How it works:</strong>
        <ul className='text-base'>
          <li>Each bubble represents a wallet.</li>
          <li>
            The bigger the bubble, the larger its share of the total supply.
          </li>
          <li>Links between bubbles represent blockchain transfers.</li>
          <li>Click on a bubble, and start exploring!</li>
        </ul>
      </Modal>
      <div
        onClick={() => setShow(true)}
        className='cursor-pointer shadow-[-4px_4px_12px_0px_rgba(0,0,0,0.08)] w-[38px] rounded-[4px] flex items-center justify-center bg-white p-[10px]'>
        <QuestionOutlined />
      </div>
    </>
  );
};

export default HelpModal;
