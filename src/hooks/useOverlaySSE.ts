import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { OverlayKey, PostOverlayControlResponse } from '../types';
import { setOverlayControlQueryData } from './useOverlayQuery';

const useOverlaySSE = (key: OverlayKey) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource(`/api/overlay/${key}/events`);

    const onPlayback: EventListener = (event) => {
      try {
        const data = JSON.parse(
          (event as MessageEvent<string>).data,
        ) as PostOverlayControlResponse;
        setOverlayControlQueryData(queryClient, key, data);
      } catch {}
    };
    const onRefresh: EventListener = () => {
      queryClient.invalidateQueries({ queryKey: ['store'] });
    };

    source.addEventListener('playback', onPlayback);
    source.addEventListener('refresh', onRefresh);

    return () => {
      source.removeEventListener('playback', onPlayback);
      source.removeEventListener('refresh', onRefresh);
      source.close();
    };
  }, [key, queryClient]);
};

export default useOverlaySSE;
