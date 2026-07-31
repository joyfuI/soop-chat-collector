import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import type { ChangeEvent } from 'react';
import { useEffect, useRef } from 'react';

import FormLabel from './components/FormLabel';
import {
  useGetOverlayControlQuery,
  usePostOverlayControlQuery,
  usePostOverlayRefreshQuery,
} from './hooks/useOverlayQuery';
import useStore from './hooks/useStore';
import SubscribeOverlay from './SubscribeOverlay';
import copyText from './utils/copyText';

const Subscribe = () => {
  const [viewLastChat, setViewLastChat] = useStore('subscribeViewLastChat');
  const [style, setStyle] = useStore('subscribeStyle');
  const prevOptions = useRef({ viewLastChat, style });

  const key = 'subscribe';
  const { data } = useGetOverlayControlQuery(key);
  const { mutate } = usePostOverlayControlQuery(key);
  const { mutate: refreshMutate } = usePostOverlayRefreshQuery(key);

  const url = `${location.origin}/#/${key}`;

  useEffect(() => {
    const options = prevOptions.current;
    const changed =
      options.viewLastChat !== viewLastChat || options.style !== style;

    prevOptions.current = { viewLastChat, style };

    if (changed) {
      refreshMutate();
    }
  }, [viewLastChat, style, refreshMutate]);

  const handleCopyClick = () => {
    copyText(url);
  };

  const handleViewLastChatChange = (e: ChangeEvent<HTMLInputElement>) => {
    setViewLastChat(e.target.checked);
  };

  const handleStyleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStyle(e.target.value);
  };

  const handlePlayClick = () => {
    mutate('play');
  };

  const handleStopClick = () => {
    mutate('stop');
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack spacing={2}>
        <Alert severity="info">신규 구독, 연속 구독 구분없이 집계됩니다.</Alert>

        <FormLabel label="오버레이 URL">
          {url}
          <IconButton color="inherit" onClick={handleCopyClick}>
            <ContentCopyIcon />
          </IconButton>
        </FormLabel>

        <FormLabel label="옵션">
          <Stack direction="row" spacing={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={viewLastChat ?? false}
                  onChange={handleViewLastChatChange}
                />
              }
              label="마지막 채팅 보이기"
            />
          </Stack>
        </FormLabel>

        <FormLabel label="커스텀 CSS">
          <TextField
            defaultValue={style}
            fullWidth
            maxRows={10}
            minRows={4}
            multiline
            onChange={handleStyleChange}
            variant="outlined"
          />
        </FormLabel>

        <FormLabel label="재생/정지">
          {data.status === 'playing' ? (
            <Button
              color="error"
              onClick={handleStopClick}
              size="large"
              variant="contained"
            >
              정지
            </Button>
          ) : (
            <Button
              color="primary"
              onClick={handlePlayClick}
              size="large"
              variant="contained"
            >
              재생
            </Button>
          )}
        </FormLabel>

        <FormLabel label="미리보기">
          <Box
            sx={{
              width: '100%',
              height: 'fit-content',
              marginBottom: '32px',
              alignSelf: 'center',
              overflowX: 'auto',
            }}
          >
            <SubscribeOverlay />
          </Box>
        </FormLabel>
      </Stack>
    </Box>
  );
};

export default Subscribe;
