import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { parse } from 'date-fns';
import type { ChangeEvent } from 'react';
import { useEffect, useRef } from 'react';

import FormLabel from './components/FormLabel';
import {
  useGetOverlayControlQuery,
  usePostOverlayControlQuery,
  usePostOverlayRefreshQuery,
} from './hooks/useOverlayQuery';
import { useGetSoopQuery, useGetSoopStationQuery } from './hooks/useSoopQuery';
import useStore from './hooks/useStore';
import TodayLiveOverlay from './TodayLiveOverlay';
import copyText from './utils/copyText';

const TodayLive = () => {
  const [streamerId] = useStore('streamerId');
  const [items, setItems] = useStore('todayLiveItems');
  const [startType, setStartType] = useStore('todayLiveStartType');
  const [startTime, setStartTime] = useStore('todayLiveStartTime');
  const [style, setStyle] = useStore('todayLiveStyle');
  const prevOptions = useRef({ items, startTime, style });

  const key = 'today-live';
  const { data } = useGetOverlayControlQuery(key);
  const { mutate } = usePostOverlayControlQuery(key);
  const { mutate: refreshMutate } = usePostOverlayRefreshQuery(key);
  const { data: stationData, refetch: refetchStation } =
    useGetSoopStationQuery(streamerId);
  const { data: soopChatData } = useGetSoopQuery();

  const url = `${location.origin}/#/${key}`;

  useEffect(() => {
    const options = prevOptions.current;
    const changed =
      options.items !== items ||
      options.startTime !== startTime ||
      options.style !== style;

    prevOptions.current = { items, startTime, style };

    if (changed) {
      refreshMutate();
    }
  }, [items, startTime, style, refreshMutate]);

  useEffect(() => {
    if (startType === 'broadStart' && stationData?.station.broad_start) {
      setStartTime(
        parse(
          stationData.station.broad_start,
          'yyyy-MM-dd HH:mm:ss',
          new Date(),
        ).getTime(),
      );
    }
  }, [startType, stationData?.station.broad_start, setStartTime]);

  useEffect(() => {
    if (startType === 'startedAt' && soopChatData?.startedAt) {
      setStartTime(soopChatData?.startedAt);
    }
  }, [startType, soopChatData?.startedAt, setStartTime]);

  const handleCopyClick = () => {
    copyText(url);
  };

  const handleItemsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItems((prevItems) => {
      const set = new Set(prevItems);
      if (e.target.checked) {
        set.add(e.target.name);
      } else {
        set.delete(e.target.name);
      }
      return [...set];
    });
  };

  const handleStartTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === 'broadStart' && streamerId) {
      refetchStation();
    }
    setStartType(value);
  };

  const handleStartTimeChange = (value: Date | null) => {
    if (value) {
      setStartTime(value.getTime());
    }
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
        <Alert severity="info">
          도전미션, 대결미션은 (아마도) 집계되지 않습니다.
        </Alert>

        <FormLabel label="오버레이 URL">
          {url}
          <IconButton color="inherit" onClick={handleCopyClick}>
            <ContentCopyIcon />
          </IconButton>
        </FormLabel>

        <FormLabel label="보일 항목">
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={items?.includes('totalChat') ?? false}
                  name="totalChat"
                  onChange={handleItemsChange}
                />
              }
              label="총 채팅"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={items?.includes('chatUserCount') ?? false}
                  name="chatUserCount"
                  onChange={handleItemsChange}
                />
              }
              label="채팅 인원"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={items?.includes('totalDonation') ?? false}
                  name="totalDonation"
                  onChange={handleItemsChange}
                />
              }
              label="총 별풍선"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={items?.includes('donationUserCount') ?? false}
                  name="donationUserCount"
                  onChange={handleItemsChange}
                />
              }
              label="별풍선 인원"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={items?.includes('fanClubCount') ?? false}
                  name="fanClubCount"
                  onChange={handleItemsChange}
                />
              }
              label="팬가입"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={items?.includes('subscribeCount') ?? false}
                  name="subscribeCount"
                  onChange={handleItemsChange}
                />
              }
              label="구독"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={items?.includes('totalDuration') ?? false}
                  name="totalDuration"
                  onChange={handleItemsChange}
                />
              }
              label="방송 시간"
            />
          </FormGroup>
        </FormLabel>

        <FormLabel label="방송 시간 기준">
          <RadioGroup
            name="broad-start"
            onChange={handleStartTypeChange}
            row
            sx={{ display: 'inline-flex', verticalAlign: 'middle' }}
            value={startType ?? ''}
          >
            <FormControlLabel
              control={<Radio />}
              label="방송국 방송 시작 시간"
              value="broadStart"
            />
            <FormControlLabel
              control={<Radio />}
              label="수집 시작 시간"
              value="startedAt"
            />
            <FormControlLabel
              control={<Radio />}
              label="직접 입력"
              value="custom"
            />
          </RadioGroup>
          <DateTimePicker
            disabled={startType !== 'custom'}
            onChange={handleStartTimeChange}
            sx={{ verticalAlign: 'middle' }}
            value={startTime ? new Date(startTime) : null}
          />
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
            <TodayLiveOverlay />
          </Box>
        </FormLabel>
      </Stack>
    </Box>
  );
};

export default TodayLive;
