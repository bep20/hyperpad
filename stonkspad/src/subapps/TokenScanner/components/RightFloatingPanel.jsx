import React, { useEffect, useMemo, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import Empty from 'antd/es/empty';
import Segmented from 'antd/es/segmented';

import {
  GRAPH_STATUS,
  getFloatingPanelTabOptions,
  panelOptionEnums,
} from '../utils/constants';
import NodeRow from './NodeRow';
import ActionBar from './ActionBar';
import { GraphHistory } from './GraphHistory';

const RightFloatingPanel = ({
  hiddenAddresses,
  nodes,
  ownerDetails,
  setHiddenAddresses,
  initialHiddenPeripherals,
  hiddenPeripherals,
  setHiddenPeripherals,
  graphError,
  graphStatus,
  collapsed,
  setCollapsed,
  selectedRow,
  setSelectedRow,
  currentSelected,
}) => {
  const [searchVal, setSearchVal] = useState('');

  const { tabOptions, walletTabVal, mapHistoryTabVal } = useMemo(() => {
    const options = getFloatingPanelTabOptions({
      disabledWalletList: graphStatus !== GRAPH_STATUS.COMPLETED,
    });
    const [walletTabVal, mapHistoryTabVal] = options;
    return { tabOptions: options, walletTabVal, mapHistoryTabVal };
  }, [graphStatus]);

  const [tabVal, setTabVal] = useState(walletTabVal);

  const handleTabChange = val => {
    const payload =
      val === panelOptionEnums.WALLETS_LIST ? walletTabVal : mapHistoryTabVal;
    setTabVal(payload);
  };

  const searchedNodes = useMemo(() => {
    const search = searchVal.trim();
    if (!search) return nodes;
    return nodes.filter(node => {
      const str = ownerDetails[node.owner]?.name || node.address;

      return str.toLowerCase().includes(search.toLowerCase());
    });
  }, [searchVal, nodes]);

  useEffect(() => {
    if (
      [
        GRAPH_STATUS.PROCESSING,
        GRAPH_STATUS.SUBMITTED,
        GRAPH_STATUS.FAILED,
      ].includes(graphStatus) ||
      graphError
    ) {
      setTabVal(mapHistoryTabVal);
    }
  }, [graphStatus]);

  return (
    <div
      onClick={() => {
        collapsed && setCollapsed(false);
      }}
      className={`floatingPanel ${collapsed && 'collapsed'}`}>
      {collapsed ? (
        <div className='flex m-auto gap-x-2'>
          {tabVal.icon}
          {tabVal.label}
        </div>
      ) : (
        <>
          <div className='header'>
            <div className='flex gap-x-2'>
              {tabVal.icon}
              <h3 className='m-0'>{tabVal.label}</h3>
            </div>
            <div
              className='flex cursor-pointer'
              onClick={() => setCollapsed(true)}>
              <CloseOutlined />
            </div>
          </div>
          <div className='tabs'>
            <Segmented
              options={tabOptions}
              onChange={handleTabChange}
              value={tabVal.value}
            />
          </div>
          {tabVal.value === panelOptionEnums.WALLETS_LIST ? (
            <>
              <Search
                placeholder='input search text'
                allowClear
                value={searchVal}
                onChange={e => {
                  setSearchVal(e.target.value);
                }}
                className='px-[10px]'
              />
              {searchedNodes?.length ? (
                <>
                  <ActionBar
                    hiddenAddresses={hiddenAddresses}
                    setHiddenAddresses={setHiddenAddresses}
                    initialHiddenPeripherals={initialHiddenPeripherals}
                    setHiddenPeripherals={setHiddenPeripherals}
                    nodes={searchedNodes}
                    setSelectedRow={setSelectedRow}
                  />
                  <div className='rows'>
                    {searchedNodes.map(node => (
                      <NodeRow
                        key={node?.address}
                        ownerDetails={ownerDetails}
                        node={node}
                        hiddenAddresses={hiddenAddresses}
                        setHiddenAddresses={setHiddenAddresses}
                        hiddenPeripherals={hiddenPeripherals}
                        setHiddenPeripherals={setHiddenPeripherals}
                        selectedRow={selectedRow}
                        setSelectedRow={setSelectedRow}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Empty className='mt-20' />
              )}
            </>
          ) : (
            <GraphHistory currentSelected={currentSelected} />
          )}
        </>
      )}
    </div>
  );
};

export default RightFloatingPanel;
