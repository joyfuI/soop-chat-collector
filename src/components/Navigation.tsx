import ChatIcon from '@mui/icons-material/Chat';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import StarsIcon from '@mui/icons-material/Stars';
import SummarizeIcon from '@mui/icons-material/Summarize';
import type { BottomNavigationProps } from '@mui/material/BottomNavigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import type { ReactNode } from 'react';
import { Children } from 'react';

export type NavigationProps = {
  children?: ReactNode;
  value?: BottomNavigationProps['value'];
  onChange?: BottomNavigationProps['onChange'];
};

const Navigation = ({ children, value, onChange }: NavigationProps) => {
  return (
    <>
      <Box sx={{ pb: 7 }}>
        {Children.map(children, (child, index) =>
          value === index ? child : null,
        )}
      </Box>

      <Paper
        elevation={3}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigation onChange={onChange} showLabels value={value}>
          <BottomNavigationAction icon={<LibraryBooksIcon />} label="수집" />
          <BottomNavigationAction icon={<ChatIcon />} label="채팅 순위" />
          <BottomNavigationAction icon={<StarsIcon />} label="별풍선 순위" />
          <BottomNavigationAction icon={<PersonAddAlt1Icon />} label="팬가입" />
          <BottomNavigationAction icon={<GroupAddIcon />} label="구독" />
          <BottomNavigationAction icon={<SummarizeIcon />} label="방송 요약" />
        </BottomNavigation>
      </Paper>
    </>
  );
};

export default Navigation;
