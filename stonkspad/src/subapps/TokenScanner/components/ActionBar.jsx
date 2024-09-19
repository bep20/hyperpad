import React, { useEffect, useMemo, useState } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';

const ActionBar = ({
  hiddenAddresses,
  setHiddenAddresses,
  initialHiddenPeripherals,
  setHiddenPeripherals,
  nodes,
  setSelectedRow,
}) => {
  const [hiddenAll, setHiddenAll] = useState(false);

  const nodeAddresses = useMemo(() => nodes.map(node => node.address), [nodes]);
  useEffect(() => {
    // setHiddenAll(nodeAddresses.length === hiddenAddresses.length);
    let flag = true;
    for (let i = 0; i < nodeAddresses.length; i++) {
      if (!hiddenAddresses.includes(nodeAddresses[i])) {
        flag = false;
        break;
      }
    }
    setHiddenAll(flag);
  }, [nodeAddresses, hiddenAddresses]);

  const HiddenIcon = useMemo(
    () => (hiddenAll ? EyeOutlined : EyeInvisibleOutlined),
    [hiddenAll],
  );

  const toggleHide = () => {
    if (!hiddenAll) {
      setSelectedRow(null);
    }
    setHiddenAddresses(hiddenAll ? [] : nodeAddresses);
    setHiddenPeripherals(hiddenAll ? [] : initialHiddenPeripherals);
  };

  return (
    <div className='flex items-center justify-end px-[10px] py-[3px] gap-x-2 border-t border-b'>
      <Tooltip title={hiddenAll ? 'Show All' : 'Hide All'}>
        <div className='flex py-[5px] px-[10px] hover:bg-[#dacaff] rounded-[4px]'>
          <HiddenIcon style={{ fontSize: '20px' }} onClick={toggleHide} />
        </div>
      </Tooltip>
    </div>
  );
};

export default ActionBar;
