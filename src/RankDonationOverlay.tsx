import { css } from '@emotion/react';
import Box from '@mui/material/Box';

import { useGetChatRankDonationQuery } from './hooks/useChatQuery';
import { useGetOverlayControlQuery } from './hooks/useOverlayQuery';
import useOverlaySSE from './hooks/useOverlaySSE';
import useStore from './hooks/useStore';

const RankDonationOverlay = () => {
  const [streamerId] = useStore('streamerId');
  const [limit] = useStore('rankDonation.limit');
  const [viewCount] = useStore('rankDonation.viewCount');
  const [style] = useStore('rankDonation.style');

  const key = 'rank-donation';
  const { data } = useGetChatRankDonationQuery(
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
      <div className="root">
        <div className="extras">
          <div className="extra-1" />
          <div className="extra-2" />
          <div className="extra-3" />
          <div className="extra-4" />
          <div className="extra-5" />
        </div>
        <div className="items">
          {data?.map((item) => (
            <div className="item" key={item.userId}>
              <div className="image" />
              <div className="text">
                <span className="rank">{item.rank}</span>
                <span className="username">{item.username}</span>
                {viewCount ? (
                  <span className="total-donation">{item.totalDonation}</span>
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
