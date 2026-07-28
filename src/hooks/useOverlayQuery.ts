import { useMutation, useQuery } from '@tanstack/react-query';

import type {
  OverlayKey,
  PostOverlayControlBody,
  PostOverlayControlResponse,
} from '../../shared/types';
import fetchBase from '../utils/fetchBase';
import fetchJson from '../utils/fetchJson';

export const usePostOverlayControlQuery = (key: OverlayKey) => {
  return useMutation({
    mutationFn: (action: PostOverlayControlBody['action']) =>
      fetchJson<PostOverlayControlResponse>(`/api/overlay/${key}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      }),
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
