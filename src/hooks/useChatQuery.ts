import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import fetchBase from '../utils/fetchBase';
import fetchJson from '../utils/fetchJson';
import objectToQueryString from '../utils/objectToQueryString';

export const useGetChatRankChatQuery = (params?: {
  streamerId?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['chat', 'rank-chat', params],
    queryFn: params?.streamerId
      ? () =>
          fetchJson<
            {
              rank: number;
              userId: string;
              username: string;
              chatCount: number;
            }[]
          >(`/api/chat/rank-chat?${objectToQueryString(params)}`)
      : skipToken,
  });
};

export const useGetChatRankDonationQuery = (params?: {
  streamerId?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['chat', 'rank-donation', params],
    queryFn: params?.streamerId
      ? () =>
          fetchJson<
            {
              rank: number;
              userId: string;
              username: string;
              totalDonation: number;
            }[]
          >(`/api/chat/rank-donation?${objectToQueryString(params)}`)
      : skipToken,
  });
};

export const useGetChatNewFanClubQuery = (params?: { streamerId?: string }) => {
  return useQuery({
    queryKey: ['chat', 'new-fan-club', params],
    queryFn: params?.streamerId
      ? () =>
          fetchJson<
            {
              receivedTime: string;
              userId: string;
              username: string;
              fanClubOrdinal: number;
            }[]
          >(`/api/chat/new-fan-club?${objectToQueryString(params)}`)
      : skipToken,
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
