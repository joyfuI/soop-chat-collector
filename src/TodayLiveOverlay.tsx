import { css } from '@emotion/react';
import Box from '@mui/material/Box';
import type { CSSProperties } from 'react';

import { useGetChatTodayLiveQuery } from './hooks/useChatQuery';
import { useGetOverlayControlQuery } from './hooks/useOverlayQuery';
import useOverlaySSE from './hooks/useOverlaySSE';
import useStore from './hooks/useStore';

const TodayLiveOverlay = () => {
  const [streamerId] = useStore('streamerId');
  const [items] = useStore('todayLiveItems');
  const [style] = useStore('todayLiveStyle');

  const key = 'today-live';
  const { data } = useGetChatTodayLiveQuery(
    streamerId !== undefined ? { streamerId } : undefined,
  );
  const { data: playbackData } = useGetOverlayControlQuery(key);
  useOverlaySSE(key);

  const totalDuration = '0시간';

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
          {items?.includes('totalChat') ? (
            <div className="item item-total-chat">
              <div className="image" />
              <div className="text">
                <span className="title">총 채팅</span>
                <span
                  className="value"
                  data-value={data?.totalChat ?? 0}
                  style={
                    { '--data-value': data?.totalChat ?? 0 } as CSSProperties
                  }
                >
                  {data?.totalChat.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          ) : null}
          {items?.includes('chatUserCount') ? (
            <div className="item item-chat-user-count">
              <div className="image" />
              <div className="text">
                <span className="title">채팅 인원</span>
                <span
                  className="value"
                  data-value={data?.chatUserCount ?? 0}
                  style={
                    {
                      '--data-value': data?.chatUserCount ?? 0,
                    } as CSSProperties
                  }
                >
                  {data?.chatUserCount.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          ) : null}
          {items?.includes('totalDonation') ? (
            <div className="item item-total-donation">
              <div className="image" />
              <div className="text">
                <span className="title">총 별풍선</span>
                <span
                  className="value"
                  data-value={data?.totalDonation ?? 0}
                  style={
                    {
                      '--data-value': data?.totalDonation ?? 0,
                    } as CSSProperties
                  }
                >
                  {data?.totalDonation.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          ) : null}
          {items?.includes('donationUserCount') ? (
            <div className="item item-donation-user-count">
              <div className="image" />
              <div className="text">
                <span className="title">별풍선 인원</span>
                <span
                  className="value"
                  data-value={data?.donationUserCount ?? 0}
                  style={
                    {
                      '--data-value': data?.donationUserCount ?? 0,
                    } as CSSProperties
                  }
                >
                  {data?.donationUserCount.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          ) : null}
          {items?.includes('fanClubCount') ? (
            <div className="item item-fan-club-count">
              <div className="image" />
              <div className="text">
                <span className="title">팬가입</span>
                <span
                  className="value"
                  data-value={data?.fanClubCount ?? 0}
                  style={
                    { '--data-value': data?.fanClubCount ?? 0 } as CSSProperties
                  }
                >
                  {data?.fanClubCount.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          ) : null}
          {items?.includes('subscribeCount') ? (
            <div className="item item-subscribe-count">
              <div className="image" />
              <div className="text">
                <span className="title">구독</span>
                <span
                  className="value"
                  data-value={data?.subscribeCount ?? 0}
                  style={
                    {
                      '--data-value': data?.subscribeCount ?? 0,
                    } as CSSProperties
                  }
                >
                  {data?.subscribeCount.toLocaleString() ?? 0}
                </span>
              </div>
            </div>
          ) : null}
          {items?.includes('totalDuration') ? (
            <div className="item item-total-duration">
              <div className="image" />
              <div className="text">
                <span className="title">방송 시간</span>
                <span
                  className="value"
                  data-value={totalDuration}
                  style={{ '--data-value': totalDuration } as CSSProperties}
                >
                  {totalDuration}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Box>
  );
};

export default TodayLiveOverlay;
