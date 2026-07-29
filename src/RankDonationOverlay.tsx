import { css } from '@emotion/react';
import Box from '@mui/material/Box';

import { useGetChatRankDonationQuery } from './hooks/useChatQuery';
import useLastChats from './hooks/useLastChats';
import { useGetOverlayControlQuery } from './hooks/useOverlayQuery';
import useOverlaySSE from './hooks/useOverlaySSE';
import useStore from './hooks/useStore';

const RankDonationOverlay = () => {
  const [streamerId] = useStore('streamerId');
  const [limit] = useStore('rankDonationLimit');
  const [viewCount] = useStore('rankDonationViewCount');
  const [viewLastChat] = useStore('rankDonationViewLastChat');
  const [style] = useStore('rankDonationStyle');

  const key = 'rank-donation';
  const { data } = useGetChatRankDonationQuery(
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
                  <span
                    className="total-donation"
                    data-value={item.totalDonation}
                  >
                    {item.totalDonation}
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

export default RankDonationOverlay;
