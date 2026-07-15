import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
    queryFn: () => fetchJson<boolean>('/api/soop'),
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
