import { css } from '@emotion/react';
import Box from '@mui/material/Box';
import type { CSSProperties } from 'react';

import { useGetChatRankChatQuery } from './hooks/useChatQuery';
import useLastChats from './hooks/useLastChats';
import { useGetOverlayControlQuery } from './hooks/useOverlayQuery';
import useOverlaySSE from './hooks/useOverlaySSE';
import useStore from './hooks/useStore';

const RankChatOverlay = () => {
  const [streamerId] = useStore('streamerId');
  const [limit] = useStore('rankChatLimit');
  const [viewCount] = useStore('rankChatViewCount');
  const [viewLastChat] = useStore('rankChatViewLastChat');
  const [style] = useStore('rankChatStyle');

  const key = 'rank-chat';
  const { data } = useGetChatRankChatQuery(
    streamerId !== undefined && limit !== undefined
      ? { streamerId, limit }
      : undefined,
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
            <div className="item" key={item.userId}>
              <div className="image" />
              <div className="text">
                <span
                  className="rank"
                  data-value={item.rank}
                  style={{ '--data-value': item.rank } as CSSProperties}
                >
                  {item.rank}
                </span>
                <span
                  className="username"
                  data-value={item.username}
                  style={{ '--data-value': item.username } as CSSProperties}
                >
                  {item.username}
                </span>
                {viewCount ? (
                  <span
                    className="chat-count"
                    data-value={item.chatCount}
                    style={{ '--data-value': item.chatCount } as CSSProperties}
                  >
                    {item.chatCount}
                  </span>
                ) : null}
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

export default RankChatOverlay;
