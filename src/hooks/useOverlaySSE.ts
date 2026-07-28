import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import type {
  OverlayKey,
  PostOverlayControlResponse,
} from '../../shared/types';

const applyOverlayControlQueryData = async (
  queryClient: QueryClient,
  key: OverlayKey,
  newData: PostOverlayControlResponse,
) => {
  if (newData.status === 'playing') {
    await queryClient.refetchQueries({
      queryKey: ['chat', key],
      type: 'active',
    });
  }

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

const useOverlaySSE = (key: OverlayKey) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource(`/api/overlay/${key}/events`);

    const onPlayback: EventListener = async (event) => {
      try {
        const data = JSON.parse(
          (event as MessageEvent<string>).data,
        ) as PostOverlayControlResponse;
        await applyOverlayControlQueryData(queryClient, key, data);
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
