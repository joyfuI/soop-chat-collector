import { createHashRouter } from 'react-router';

import App from './App';
import NewFanClubOverlay from './NewFanClubOverlay';
import RankChatOverlay from './RankChatOverlay';
import RankDonationOverlay from './RankDonationOverlay';
import SubscribeOverlay from './SubscribeOverlay';
import TodayLiveOverlay from './TodayLiveOverlay';

export const createAppRouter = () =>
  createHashRouter([
    { path: '/', Component: App },
    { path: '/rank-chat', Component: RankChatOverlay },
    { path: '/rank-donation', Component: RankDonationOverlay },
    { path: '/new-fan-club', Component: NewFanClubOverlay },
    { path: '/subscribe', Component: SubscribeOverlay },
    { path: '/today-live', Component: TodayLiveOverlay },
  ]);
