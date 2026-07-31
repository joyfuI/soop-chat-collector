import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';

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

  const onChatEvent = useEffectEvent((event: Event) => {
    if (!onChat) {
      return;
    }
    try {
      const data = JSON.parse(
        (event as MessageEvent<string>).data,
      ) as RankChatMessage;
      onChat(data);
    } catch {}
  });

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
    source.addEventListener('chat', onChatEvent);

    return () => {
      source.removeEventListener('playback', onPlayback);
      source.removeEventListener('refresh', onRefresh);
      source.removeEventListener('chat', onChatEvent);
      source.close();
    };
  }, [key, queryClient]);
};

export default useOverlaySSE;
