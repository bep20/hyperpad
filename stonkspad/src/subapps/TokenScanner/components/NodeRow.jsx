import React, { useMemo } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';
import { roundOff } from '../../../utils/helpers';

const NodeRow = ({
  node,
  ownerDetails,
  hiddenAddresses,
  setHiddenAddresses,
  hiddenPeripherals,
  setHiddenPeripherals,
  selectedRow,
  setSelectedRow,
}) => {
  const isHidden = hiddenAddresses.includes(node.address);

  const HiddenIcon = useMemo(
    () => (isHidden ? EyeOutlined : EyeInvisibleOutlined),
    [hiddenAddresses],
  );

  const toggleVisibility = (e, isPeripheral = false) => {
    e.stopPropagation();
    if (isHidden) {
      setHiddenAddresses(hiddenAddresses.filter(add => add !== node.address));
      if (isPeripheral) {
        setHiddenPeripherals(
          hiddenPeripherals.filter(add => add !== node.address),
        );
      }
    } else {
      setHiddenAddresses([...hiddenAddresses, node.address]);
      if (isPeripheral) {
        setHiddenPeripherals([...hiddenPeripherals, node.address]);
      }
      if (selectedRow?.address === node.address) {
        setSelectedRow(null);
      }
    }
  };
  return (
    <div
      id={node.address}
      onClick={() => {
        if (!isHidden) {
          setSelectedRow(node);
        }
      }}
      className={`row ${selectedRow?.address === node.address ? 'bg-primary-color text-white' : selectedRow?.group === node.group ? 'bg-[#dacaff]' : 'hover:bg-[#0000000f]'} ${
        isHidden ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}>
      <div className='flex items-center gap-x-2'>
        <strong>#{node?.rank}</strong>
        <p className='truncate m-0 w-[110px]'>
          {ownerDetails[node.owner]?.name || node.address}
        </p>
      </div>
      <div className='flex items-center gap-x-2'>
        {roundOff(node.percentage)}%
        <Tooltip title={isHidden ? 'Show' : 'Hide'}>
          <div className='flex p-[3px] rounded-[3px] hover:bg-white'>
            <HiddenIcon
              onClick={e => toggleVisibility(e, node?.isPeripheral)}
            />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default NodeRow;
