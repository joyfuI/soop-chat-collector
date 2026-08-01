import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import type { ChangeEvent } from 'react';

import FormLabel from './components/FormLabel';
import {
  useGetOverlayControlQuery,
  usePostOverlayControlQuery,
} from './hooks/useOverlayQuery';
import useRefreshOnChange from './hooks/useRefreshOnChange';
import useStore from './hooks/useStore';
import RankChatOverlay from './RankChatOverlay';
import copyText from './utils/copyText';

const RankChat = () => {
  const [limit, setLimit] = useStore('rankChatLimit');
  const [viewCount, setViewCount] = useStore('rankChatViewCount');
  const [viewLastChat, setViewLastChat] = useStore('rankChatViewLastChat');
  const [style, setStyle] = useStore('rankChatStyle');

  const key = 'rank-chat';
  const { data } = useGetOverlayControlQuery(key);
  const { mutate } = usePostOverlayControlQuery(key);

  const url = `${location.origin}/#/${key}`;

  useRefreshOnChange(key, limit, viewCount, viewLastChat, style);

  const handleCopyClick = () => {
    copyText(url);
  };

  const handleLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(e.target.value, 10));
  };

  const handleViewCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setViewCount(e.target.checked);
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
        <FormLabel label="오버레이 URL">
          {url}
          <IconButton color="inherit" onClick={handleCopyClick}>
            <ContentCopyIcon />
          </IconButton>
        </FormLabel>

        <FormLabel label="옵션">
          <Stack direction="row" spacing={4}>
            <TextField
              defaultValue={limit}
              label="순위 개수"
              onChange={handleLimitChange}
              slotProps={{
                input: { inputProps: { min: 1, inputMode: 'numeric' } },
                inputLabel: { shrink: true },
              }}
              type="number"
              variant="outlined"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={viewCount ?? false}
                  onChange={handleViewCountChange}
                />
              }
              label="채팅 개수 보이기"
            />
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
            <RankChatOverlay />
          </Box>
        </FormLabel>
      </Stack>
    </Box>
  );
};

export default RankChat;
