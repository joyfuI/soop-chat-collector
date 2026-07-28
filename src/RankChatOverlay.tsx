import { css } from '@emotion/react';
import Box from '@mui/material/Box';

import { useGetChatRankChatQuery } from './hooks/useChatQuery';
import { useGetOverlayControlQuery } from './hooks/useOverlayQuery';
import useOverlaySSE from './hooks/useOverlaySSE';
import useStore from './hooks/useStore';

const RankChatOverlay = () => {
  const [streamerId] = useStore('streamerId');
  const [limit] = useStore('rankChat.limit');
  const [viewCount] = useStore('rankChat.viewCount');
  const [style] = useStore('rankChat.style');

  const key = 'rank-chat';
  const { data } = useGetChatRankChatQuery(
    streamerId !== undefined && limit !== undefined
      ? { streamerId, limit }
      : undefined,
  );
  const { data: playbackData } = useGetOverlayControlQuery(key);
  useOverlaySSE(key);

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
              </div>
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default RankChatOverlay;
