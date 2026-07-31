import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ko } from 'date-fns/locale/ko';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';

import { createAppRouter } from './router';
import theme from './theme';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});
const router = createAppRouter();

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider noSsr storageManager={null} theme={theme}>
        <LocalizationProvider adapterLocale={ko} dateAdapter={AdapterDateFns}>
          <QueryClientProvider client={queryClient}>
            <CssBaseline />
            <RouterProvider router={router} />
            {!location.hash ? <ReactQueryDevtools /> : null}
          </QueryClientProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
