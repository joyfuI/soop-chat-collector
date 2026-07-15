import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import fetchBase from '../utils/fetchBase';
import fetchJson from '../utils/fetchJson';

export const useGetChatRankChatQuery = (params: {
  streamerId: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['chat', 'rank-chat', params],
    queryFn: () =>
      fetchJson<
        { rank: number; userId: string; username: string; chatCount: number }[]
      >(
        `/api/chat/rank-chat?${new URLSearchParams(params as unknown as Record<string, string>).toString()}`,
      ),
  });
};

export const useGetChatRankDonationQuery = (params: {
  streamerId: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['chat', 'rank-donation', params],
    queryFn: () =>
      fetchJson<
        {
          rank: number;
          userId: string;
          username: string;
          totalDonation: number;
        }[]
      >(
        `/api/chat/rank-donation?${new URLSearchParams(params as unknown as Record<string, string>).toString()}`,
      ),
  });
};

export const useDeleteChatQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchBase(`/api/chat`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat'] });
    },
  });
};
