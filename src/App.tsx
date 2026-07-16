import Container from '@mui/material/Container';
import type { SyntheticEvent } from 'react';

import Collector from './Collector';
import Navigation from './components/Navigation';
import useStore from './hooks/useStore';
import RankChat from './RankChat';
import RankDonation from './RankDonation';

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
      </Navigation>
    </Container>
  );
};

export default App;
