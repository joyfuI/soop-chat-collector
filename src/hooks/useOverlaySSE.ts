import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import type {
  OverlayKey,
  PostOverlayControlResponse,
  RankChatMessage,
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

const useOverlaySSE = (
  key: OverlayKey,
  onChat?: (message: RankChatMessage) => void,
) => {
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
    const onChatEvent: EventListener = (event) => {
      try {
        const data = JSON.parse(
          (event as MessageEvent<string>).data,
        ) as RankChatMessage;
        onChat?.(data);
      } catch {}
    };

    source.addEventListener('playback', onPlayback);
    source.addEventListener('refresh', onRefresh);
    source.addEventListener('chat', onChatEvent);

    return () => {
      source.removeEventListener('playback', onPlayback);
      source.removeEventListener('refresh', onRefresh);
      source.removeEventListener('chat', onChatEvent);
      source.close();
    };
  }, [key, onChat, queryClient]);
};

export default useOverlaySSE;
