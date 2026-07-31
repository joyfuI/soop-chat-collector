import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { LiveDetail, SoopChannel } from 'soop-extension';

import fetchBase from '../utils/fetchBase';
import fetchJson from '../utils/fetchJson';

export const usePostSoopQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (streamerId: string) =>
      fetchBase('/api/soop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamerId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soop'] });
    },
  });
};

export const useGetSoopQuery = () => {
  return useQuery({
    queryKey: ['soop'],
    queryFn: () =>
      fetchJson<{ isStarted: boolean; startedAt: number }>('/api/soop'),
  });
};

export const useDeleteSoopQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchBase('/api/soop', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soop'] });
    },
  });
};

type StationInfo = Awaited<ReturnType<SoopChannel['station']>>;

export const useGetSoopStationQuery = (streamerId?: string) => {
  return useQuery({
    queryKey: ['station', streamerId],
    queryFn: streamerId
      ? () =>
          fetchJson<StationInfo>(
            `/api/soop/station?streamerId=${encodeURIComponent(streamerId)}`,
          )
      : skipToken,
  });
};

export const useGetSoopDetailQuery = (streamerId?: string) => {
  return useQuery({
    queryKey: ['detail', streamerId],
    queryFn: streamerId
      ? () =>
          fetchJson<LiveDetail>(
            `/api/soop/detail?streamerId=${encodeURIComponent(streamerId)}`,
          )
      : skipToken,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
};
