import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import { useGenerateGraph } from '../utils/api';

export const GenerateGraph = ({ tokenDetails, closeModal }) => {
  const [URIData, setURIData] = useState({});
  const navigate = useNavigate();
  const { mutate, isPending: isGenerating } = useGenerateGraph({
    navigate,
    closeModal,
  });

  const handleSubmission = () => {
    // submit new request for this particular mint address
    mutate({
      mint_address: tokenDetails?.mint,
    });
  };

  useEffect(() => {
    if (tokenDetails?.metadata?.data?.uri?.length) {
      axios({
        url: tokenDetails?.metadata?.data?.uri,
      })
        .then(res => {
          setURIData(res.data);
        })
        .catch(err => {
          console.log('catched error', err);
        });
    }
  }, [tokenDetails?.metadata?.data?.uri]);

  return (
    <Alert
      message={`${URIData?.name || '-'} - ${URIData?.symbol || '-'}`}
      description={tokenDetails?.mint}
      type='info'
      action={
        <Button
          loading={isGenerating}
          onClick={handleSubmission}
          type='primary'>
          Generate fresh
        </Button>
      }
      showIcon
      icon={
        <img
          height={50}
          width={50}
          className='rounded-[50%] self-center'
          src={URIData?.image}
          alt='token image'
        />
      }
    />
  );
};
