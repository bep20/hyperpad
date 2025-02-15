import React, { useContext, useEffect, useMemo, useState } from 'react';
import Radio from 'antd/es/radio';
import Badge from 'antd/es/badge';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Spin from 'antd/es/spin';
import message from 'antd/es/message';
import { ReloadOutlined } from '@ant-design/icons';
import { AppContext, NETWORKS } from '../../../context/AppStore';
import {
  DEVNET_CUSTOM_RPC_KEY,
  MAINNET_CUSTOM_RPC_KEY,
  RPC_ENUMS,
  RPC_LABELS,
} from '../../../constants';
import { GET_RPC_URLS } from '../../../subapps/TokenScanner/utils/helpers';
import storage from '../../../utils/storage';
import { useCheckURL, useGetRPCTime } from '../../../utils/networkCalls';

const Content = () => {
  const [appStore, dispatchAppStore] = useContext(AppContext);
  const RPC_URLS = GET_RPC_URLS(appStore?.currentNetwork);
  const [input, setInput] = useState('');

  const rpcTimeInitialState = {
    [RPC_ENUMS.PRIMARY]: '--',
    [RPC_ENUMS.SECONDARY]: '--',
    [RPC_ENUMS.CUSTOM]: '--',
  };

  const [rpcTime, setRpcTime] = useState(rpcTimeInitialState);
  const cutomRpcKey =
    appStore?.currentNetwork === NETWORKS?.MAINNET
      ? MAINNET_CUSTOM_RPC_KEY
      : DEVNET_CUSTOM_RPC_KEY;
  const [customRpcURL, setCustomRpcURL] = useState(
    storage.get(cutomRpcKey) || '',
  );
  const changeRPC = val => {
    dispatchAppStore({
      type: 'SET_NETWORK_URL',
      payload: val,
    });
  };

  const { mutate: getRpcTime, isPending: gettingRpcTime } = useGetRPCTime({
    onSuccess: (data, body) => {
      if (data?.data?.result) {
        const endTime = Date.now();
        const { startTime, type } = body;
        const tt = endTime - startTime;
        setRpcTime(prev => ({ ...prev, [type]: tt }));
      }
    },
    onError: (_, body) => {
      setRpcTime(prev => ({ ...prev, [body.type]: '--' }));
    },
  });

  const {
    mutate: checkUrl,
    isPending: checkingURL,
    isError,
  } = useCheckURL({
    onSuccess: (data, body) => {
      if (data?.data?.result) {
        const { url, startTime } = body;
        const endTime = Date.now();
        const tt = endTime - startTime;
        storage.set(cutomRpcKey, url);
        setCustomRpcURL(url);
        changeRPC(url);
        setInput('');
        setRpcTime(prev => ({ ...prev, [RPC_ENUMS.CUSTOM]: tt }));
      }
    },
  });

  const RPC_LIST = useMemo(() => {
    const res = [
      {
        type: RPC_ENUMS.PRIMARY,
        label: RPC_LABELS[RPC_ENUMS.PRIMARY],
        value: RPC_URLS[RPC_ENUMS.PRIMARY],
      },
      {
        type: RPC_ENUMS.SECONDARY,
        label: RPC_LABELS[RPC_ENUMS.SECONDARY],
        value: RPC_URLS[RPC_ENUMS.SECONDARY],
      },
    ];
    if (customRpcURL) {
      res.push({
        type: RPC_ENUMS.CUSTOM,
        label: RPC_LABELS[RPC_ENUMS.CUSTOM],
        value: customRpcURL,
      });
    }
    return res;
  }, [customRpcURL, RPC_URLS]);

  // eslint-disable-next-line consistent-return
  const saveCustom = () => {
    const url = `https://${input}`;
    if (RPC_URLS[RPC_ENUMS.PRIMARY] === url) {
      return message.error("Hyperpad Primary URL can't be used as custom");
    }
    if (RPC_URLS[RPC_ENUMS.SECONDARY] === url) {
      return message.error("Hyperpad Secondary URL can't be used as custom");
    }
    const startTime = Date.now();
    checkUrl({ url, startTime });
  };

  const calculateRPCURLsTime = () => {
    RPC_LIST.forEach(rpc => {
      const startTime = Date.now();
      getRpcTime({ type: rpc.type, url: rpc.value, startTime });
    });
  };

  useEffect(() => {
    calculateRPCURLsTime();
  }, []);

  return (
    <div className='flex flex-col gap-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-Bebas'>RPC connection</h3>
        {gettingRpcTime ? (
          <Spin indicator={<ReloadOutlined spin />} size='small' />
        ) : (
          <ReloadOutlined onClick={calculateRPCURLsTime} cursor='pointer' />
        )}
      </div>
      <Radio.Group
        onChange={e => {
          changeRPC(e.target.value);
        }}
        className='flex flex-col gap-y-2'
        value={appStore?.currentNetworkURL}>
        {RPC_LIST.map(rpc => (
          <Radio
            key={rpc.value}
            className={`rpc-option rounded-md text-base font-light w-full py-3.5 px-2.5 ${rpc.value === appStore.currentNetworkURL ? 'bg-[var(--faded-color)]' : ''} hover:bg-[var(--faded-color)]`}
            value={rpc.value}>
            <div className='flex justify-between items-center'>
              {rpc.label}
              <Badge
                color='#23c333'
                text={`${rpcTime[rpc.type]}ms`}
                className='font-extralight'
              />
            </div>
            {/* <div className='truncate ... text-xs m-0 mt-1 max-w-[330px] sm:max-w-[220px]'>
              {rpc.value}
            </div> */}
          </Radio>
        ))}
      </Radio.Group>
      <div>
        <Space.Compact
          style={{
            width: '100%',
          }}>
          <Input
            placeholder='Custom RPC URL'
            size='large'
            status={isError ? 'error' : ''}
            addonBefore='https://'
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Button
            size='large'
            type='primary'
            onClick={saveCustom}
            loading={checkingURL}>
            Save
          </Button>
        </Space.Compact>
        {isError && <small className='text-red-500'>wrong url</small>}
      </div>
    </div>
  );
};

export default Content;
