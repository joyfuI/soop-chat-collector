import { css } from '@emotion/react';
import Box from '@mui/material/Box';
import type { CSSProperties } from 'react';

import { useGetChatSubscribeQuery } from './hooks/useChatQuery';
import useLastChats from './hooks/useLastChats';
import { useGetOverlayControlQuery } from './hooks/useOverlayQuery';
import useOverlaySSE from './hooks/useOverlaySSE';
import useStore from './hooks/useStore';

const SubscribeOverlay = () => {
  const [streamerId] = useStore('streamerId');
  const [viewLastChat] = useStore('subscribeViewLastChat');
  const [style] = useStore('subscribeStyle');

  const key = 'subscribe';
  const { data } = useGetChatSubscribeQuery(
    streamerId !== undefined ? { streamerId } : undefined,
  );
  const { data: playbackData } = useGetOverlayControlQuery(key);
  const { lastChats, handleChat } = useLastChats(
    streamerId,
    data?.map((item) => item.userId),
  );
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
        <div
          className="items"
          data-count={data?.length ?? 0}
          style={{ '--data-count': data?.length ?? 0 } as CSSProperties}
        >
          {data?.map((item) => (
            <div
              className="item"
              data-tier={item.tier}
              key={item.userId}
              style={{ '--data-tier': item.tier } as CSSProperties}
            >
              <div className="image" />
              <div className="text">
                <span
                  className="username"
                  data-value={item.username}
                  style={{ '--data-value': item.username } as CSSProperties}
                >
                  {item.username}
                </span>
                {viewLastChat ? (
                  <span
                    className="last-chat"
                    data-value={lastChats[item.userId] ?? ''}
                    style={
                      {
                        '--data-value': lastChats[item.userId] ?? '',
                      } as CSSProperties
                    }
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

export default SubscribeOverlay;
