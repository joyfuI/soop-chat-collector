import { css } from '@emotion/react';
import Box from '@mui/material/Box';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { RankChatMessage } from '../shared/types';
import { useGetChatRankChatQuery } from './hooks/useChatQuery';
import { useGetOverlayControlQuery } from './hooks/useOverlayQuery';
import useOverlaySSE from './hooks/useOverlaySSE';
import useStore from './hooks/useStore';

const RankChatOverlay = () => {
  const [lastChats, setLastChats] = useState<Record<string, string>>({});
  const rankUserIds = useRef(new Set<string>());
  const chatTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [streamerId] = useStore('streamerId');
  const [limit] = useStore('rankChat.limit');
  const [viewCount] = useStore('rankChat.viewCount');
  const [viewLastChat] = useStore('rankChat.viewLastChat');
  const [style] = useStore('rankChat.style');

  const key = 'rank-chat';
  const { data } = useGetChatRankChatQuery(
    streamerId !== undefined && limit !== undefined
      ? { streamerId, limit }
      : undefined,
  );
  rankUserIds.current = new Set(data?.map((item) => item.userId));
  const { data: playbackData } = useGetOverlayControlQuery(key);

  const handleChat = useCallback(
    (chat: RankChatMessage) => {
      if (
        chat.streamerId !== streamerId ||
        !rankUserIds.current.has(chat.userId)
      ) {
        return;
      }

      const previousTimer = chatTimers.current.get(chat.userId);
      if (previousTimer) {
        clearTimeout(previousTimer);
      }

      setLastChats((oldLastChats) => ({
        ...oldLastChats,
        [chat.userId]: chat.message,
      }));
      chatTimers.current.set(
        chat.userId,
        setTimeout(() => {
          setLastChats((oldLastChats) => {
            const newLastChats = { ...oldLastChats };
            delete newLastChats[chat.userId];
            return newLastChats;
          });
          chatTimers.current.delete(chat.userId);
        }, 5000),
      );
    },
    [streamerId],
  );

  useEffect(() => {
    const timers = chatTimers.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  useOverlaySSE(key, handleChat);

  return (
    <Box
      className={
        playbackData.status === 'playing' ? undefined : 'animation-reset'
      }
      css={css`
${style}
`}
      key={playbackData.revision}
      sx={{ overflow: 'hidden' }}
    >
      <div className={`root root-${key}`}>
        <div className="extras">
          <div className="extra extra-1" />
          <div className="extra extra-2" />
          <div className="extra extra-3" />
          <div className="extra extra-4" />
          <div className="extra extra-5" />
        </div>
        <div className="items">
          {data?.map((item) => (
            <div className="item" key={item.userId}>
              <div className="image" />
              <div className="text">
                <span className="rank" data-value={item.rank}>
                  {item.rank}
                </span>
                <span className="username" data-value={item.username}>
                  {item.username}
                </span>
                {viewCount ? (
                  <span className="chat-count" data-value={item.chatCount}>
                    {item.chatCount}
                  </span>
                ) : null}
                {viewLastChat ? (
                  <span
                    className="last-chat"
                    data-value={lastChats[item.userId] ?? ''}
                  >
                    {lastChats[item.userId]}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default RankChatOverlay;
