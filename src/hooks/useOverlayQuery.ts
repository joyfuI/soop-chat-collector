import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  OverlayKey,
  PostOverlayControlBody,
  PostOverlayControlResponse,
} from '../../shared/types';
import fetchBase from '../utils/fetchBase';
import fetchJson from '../utils/fetchJson';

export const setOverlayControlQueryData = (
  queryClient: QueryClient,
  key: OverlayKey,
  newData: PostOverlayControlResponse,
) => {
  queryClient.setQueryData<PostOverlayControlResponse>(
    ['overlay', key],
    (oldData) => {
      if (oldData && newData.revision < oldData.revision) {
        return oldData;
      }
      return newData;
    },
  );
};

export const usePostOverlayControlQuery = (key: OverlayKey) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: PostOverlayControlBody['action']) =>
      fetchJson<PostOverlayControlResponse>(`/api/overlay/${key}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      }),
    onSuccess: (newData) => {
      // SSE 도착 전에도 즉시 갱신
      setOverlayControlQueryData(queryClient, key, newData);
    },
  });
};

export const usePostOverlayRefreshQuery = (key: OverlayKey) => {
  return useMutation({
    mutationFn: () =>
      fetchBase(`/api/overlay/${key}/refresh`, { method: 'POST' }),
  });
};

const initialData: PostOverlayControlResponse = {
  revision: 0,
  status: 'stopped',
};

export const useGetOverlayControlQuery = (key: OverlayKey) => {
  return useQuery({
    queryKey: ['overlay', key],
    queryFn: () => initialData,
    initialData,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
