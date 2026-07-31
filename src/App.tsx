import Container from '@mui/material/Container';
import type { SyntheticEvent } from 'react';

import Collector from './Collector';
import Navigation from './components/Navigation';
import useStore from './hooks/useStore';
import NewFanClub from './NewFanClub';
import RankChat from './RankChat';
import RankDonation from './RankDonation';
import Subscribe from './Subscribe';
import TodayLive from './TodayLive';

const App = () => {
  const [tab, setTab] = useStore('tab');

  const handleChange = (_e: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Container component="main" sx={{ p: 2 }}>
      <Navigation onChange={handleChange} value={tab}>
        <Collector />
        <RankChat />
        <RankDonation />
        <NewFanClub />
        <Subscribe />
        <TodayLive />
      </Navigation>
    </Container>
  );
};

export default App;
