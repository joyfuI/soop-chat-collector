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
  const { data } = useGetChatRankChatQuery({ streamerId, limit });
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
      <div className="root">
        {data?.map((item) => (
          <div className="item" key={item.userId}>
            <div className="image" />
            <div className="text">
              <span className="rank">{item.rank}</span>
              <span className="username">{item.username}</span>
              {viewCount ? (
                <span className="chat-count">{item.chatCount}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default RankChatOverlay;
