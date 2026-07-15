import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { type ChangeEvent, useEffect, useRef } from 'react';

import FormLabel from './components/FormLabel';
import {
  useGetOverlayControlQuery,
  usePostOverlayControlQuery,
  usePostOverlayRefreshQuery,
} from './hooks/useOverlayQuery';
import useStore from './hooks/useStore';
import RankDonationOverlay from './RankDonationOverlay';
import copyText from './utils/copyText';

const RankDonation = () => {
  const [limit, setLimit] = useStore('rankDonation.limit', 5);
  const [viewCount, setViewCount] = useStore('rankDonation.viewCount', false);
  const [style, setStyle] = useStore('rankDonation.style', '');
  const prevOptions = useRef({ limit, viewCount, style });

  const key = 'rank-donation';
  const { data } = useGetOverlayControlQuery(key);
  const { mutate } = usePostOverlayControlQuery(key);
  const { mutate: refreshMutate } = usePostOverlayRefreshQuery(key);

  const url = `${location.origin}/#/${key}`;

  useEffect(() => {
    const options = prevOptions.current;
    const changed =
      options.limit !== limit ||
      options.viewCount !== viewCount ||
      options.style !== style;

    prevOptions.current = { limit, viewCount, style };

    if (changed) {
      refreshMutate();
    }
  }, [limit, viewCount, style, refreshMutate]);

  const handleCopyClick = () => {
    copyText(url);
  };

  const handleLimitChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(e.target.value, 10));
  };

  const handleViewCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setViewCount(e.target.checked);
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
                  defaultChecked={viewCount}
                  onChange={handleViewCountChange}
                />
              }
              label="별풍선 개수 보이기"
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
            <RankDonationOverlay />
          </Box>
        </FormLabel>
      </Stack>
    </Box>
  );
};

export default RankDonation;
