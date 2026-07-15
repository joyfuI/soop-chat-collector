import ChatIcon from '@mui/icons-material/Chat';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import StarsIcon from '@mui/icons-material/Stars';
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
        {Children.map(children, (child, index) => (
          <div hidden={value !== index} role="tabpanel">
            {child}
          </div>
        ))}
      </Box>

      <Paper
        elevation={3}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigation onChange={onChange} showLabels value={value}>
          <BottomNavigationAction icon={<LibraryBooksIcon />} label="수집" />
          <BottomNavigationAction icon={<ChatIcon />} label="채팅 순위" />
          <BottomNavigationAction icon={<StarsIcon />} label="별풍선 순위" />
        </BottomNavigation>
      </Paper>
    </>
  );
};

export default Navigation;
