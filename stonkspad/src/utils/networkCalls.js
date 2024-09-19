import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { httpClientBareMetal } from './api';

export const useCheckURL = ({ onSuccess }) => {
  return useMutation({
    mutationFn: data =>
      axios({
        method: 'POST',
        url: data.url,
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'getBlockHeight',
        },
      }),

    onSuccess,
  });
};

export const useGetRPCTime = ({ onSuccess, onError }) => {
  return useMutation({
    mutationFn: data =>
      axios({
        method: 'POST',
        url: data.url,
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'getBlockHeight',
        },
      }),

    onSuccess,
    onError,
  });
};

export const useCreateWallet = ({ onSuccess, onError = () => {} }) => {
  const url = 'api/v1/mtb/wallet';
  return useMutation({
    mutationFn: data =>
      httpClientBareMetal({
        method: 'POST',
        url,
        data,
      }),
    onSuccess,
    onError,
  });
};

export const useInitCompaign = ({ onSuccess, onError = () => {} }) => {
  const url = 'api/v1/mtb/campaign';
  return useMutation({
    mutationFn: data =>
      httpClientBareMetal({
        method: 'POST',
        url,
        data,
      }),
    onSuccess,
    onError,
  });
};

export const useGetBumpiBots = ({ tenantId }) => {
  const url = `api/v1/mtb/tenant/${tenantId}/campaign`;

  return useQuery({
    queryKey: [tenantId],
    queryFn: () =>
      httpClientBareMetal({
        url,
      }),
    select: data => data?.data?.data || [],
  });
};

export const useGetBumpiBotDetail = ({ compaignId, onSuccess }) => {
  const url = `api/v1/mtb/campaign/${compaignId}`;

  return useQuery({
    queryKey: [compaignId],
    queryFn: () =>
      httpClientBareMetal({
        url,
      }),
    onSuccess,
    select: data => data?.data?.data?.[0] || {},
  });
};

export const useGetBumpiBotStatistics = ({ compaignId }) => {
  const url = `api/v1/mtb/campaign/${compaignId}/txn/statistics`;
  return useQuery({
    queryKey: [compaignId, 'statistics'],
    queryFn: () =>
      httpClientBareMetal({
        url,
      }),
    select: data => {
      return data?.data?.data?.[0] || {};
    },
  });
};
