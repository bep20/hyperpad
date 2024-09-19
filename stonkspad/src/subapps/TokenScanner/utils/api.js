import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSearchParams } from 'react-router-dom';
import { httpClient } from '../../../utils/api';

export const useFetchTokenGraph = ({ mapId, mintAddress }) => {
  const url = '/token_graph';
  const params = { map_id: mapId, mint_address: mintAddress };
  return useQuery({
    queryKey: [mapId, mintAddress],
    queryFn: () => httpClient({ url, params }),
    select: res => res?.data?.bubblemap || {},
  });
};

export const useFetchOwnerDetails = () => {
  const url = '/address_labels';

  return useQuery({
    queryKey: ['address_labels'],
    queryFn: () => httpClient({ url }),
    select: res => {
      const ownerDetails = {};
      const hiddenOwners = [];
      res?.data?.bubblelabels?.forEach(label => {
        const { defaultHidden = false, name, address } = label || {};
        ownerDetails[address] = { name, defaultHidden };
        if (defaultHidden) hiddenOwners.push(address);
      });
      return { ownerDetails, hiddenOwners };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useFetchGraphHistory = ({ mint_address, enabled = true }) => {
  const url = '/token_graph_history';
  const params = {
    mint_address,
  };

  return useQuery({
    queryKey: [mint_address],
    queryFn: () => httpClient({ url, params }),
    select: res => {
      return res?.data?.bubblemaps || [];
    },
    staleTime: 1 * 60 * 1000,
    enabled,
  });
};

export const useFetchRecentGraphs = () => {
  const url = '/recent_graphs';

  return useQuery({
    queryKey: ['recent_graphs'],
    queryFn: () => httpClient({ url }),
    select: res => {
      return res?.data?.bubblemaps || [];
    },
  });
};

export const useGenerateGraph = ({
  onSuccess = null,
  onError = null,
  onSettled = null,
  navigate,
  closeModal = () => {},
}) => {
  const url = '/generate_token_graph';
  const queryClient = useQueryClient();
  const defaultOnSuccess = (res, body) => {
    // refetching the tokenGraph history again
    queryClient.invalidateQueries({
      queryKey: [body?.mint_address],
      exact: true,
    });

    const path = {
      pathname: body?.mint_address,
      search: createSearchParams({
        mapId: res?.data?.map_id,
      }).toString(),
    };
    closeModal();
    navigate(path);
  };
  const defaultOnError = err => {
    console.log(err?.message);
  };
  const defaultOnSettled = () => {};
  return useMutation({
    mutationFn: body =>
      httpClient({
        url,
        method: 'POST',
        data: body,
      }),
    onSuccess: onSuccess || defaultOnSuccess,
    onError: onError || defaultOnError,
    onSettled: onSettled || defaultOnSettled,
  });
};
