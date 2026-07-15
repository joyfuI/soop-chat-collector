import { createHashRouter } from 'react-router';

import App from './App';
import RankChatOverlay from './RankChatOverlay';
import RankDonationOverlay from './RankDonationOverlay';

export const createAppRouter = () =>
  createHashRouter([
    { path: '/', Component: App },
    { path: '/rank-chat', Component: RankChatOverlay },
    { path: '/rank-donation', Component: RankDonationOverlay },
  ]);
