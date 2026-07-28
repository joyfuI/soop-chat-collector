import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect } from 'react';

import FormLabel from './components/FormLabel';
import { useDeleteChatQuery } from './hooks/useChatQuery';
import {
  useDeleteSoopQuery,
  useGetSoopDetailQuery,
  useGetSoopQuery,
  usePostSoopQuery,
} from './hooks/useSoopQuery';
import useStore from './hooks/useStore';

const Collector = () => {
  const [streamerId, setStreamerId] = useStore('streamerId');
  const [watch, setWatch] = useStore('watch');

  const { data: isStarted } = useGetSoopQuery();
  const { data: detailData } = useGetSoopDetailQuery(
    watch ? streamerId : undefined,
  );
  const { mutateAsync: connectMutateAsync } = usePostSoopQuery();
  const { mutate: disconnectMutate } = useDeleteSoopQuery();
  const { mutate: clearMutate } = useDeleteChatQuery();

  const handleStartClick = useCallback(async () => {
    if (streamerId) {
      try {
        await connectMutateAsync(streamerId);
      } catch {
        alert('연결 실패!');
      }
    } else {
      alert('SOOP ID가 설정되지 않았습니다!');
    }
  }, [streamerId, connectMutateAsync]);

  const handleStopClick = useCallback(() => {
    disconnectMutate();
  }, [disconnectMutate]);

  useEffect(() => {
    if (watch) {
      // RESULT: 정상 1, 미방송 0, 구플 -14, 19금 -6, 비번방 1, 19비번방 -8
      if (detailData?.CHANNEL.RESULT === 1) {
        if (!isStarted) {
          handleStartClick();
        }
      } else if (detailData?.CHANNEL.RESULT === 0) {
        if (isStarted) {
          handleStopClick();
        }
      }
    }
  }, [
    watch,
    detailData?.CHANNEL.RESULT,
    isStarted,
    handleStartClick,
    handleStopClick,
  ]);

  const handleStreamerIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStreamerId(e.target.value);
  };

  const handleWatchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (streamerId || !checked) {
      setWatch(checked);
    } else {
      alert('SOOP ID가 설정되지 않았습니다!');
    }
  };

  const handleClearClick = () => {
    clearMutate();
  };

  return (
    <Stack spacing={2}>
      <FormLabel
        description="채팅을 연결할 스트리머의 SOOP ID를 입력하세요."
        label="SOOP ID"
      >
        <TextField
          defaultValue={streamerId}
          disabled={isStarted || watch}
          onChange={handleStreamerIdChange}
          variant="outlined"
        />
      </FormLabel>

      <FormLabel
        description={`제약사항) 비번방, 구플방, 19금방은 수집할 수 없습니다.\n방송 감지를 켜면 10초 간격으로 확인하여 자동으로 시작/중지합니다.`}
        label="채팅 수집"
      >
        {isStarted ? (
          <Button
            color="error"
            onClick={handleStopClick}
            size="large"
            variant="contained"
          >
            수집 중지
          </Button>
        ) : (
          <Button
            color="primary"
            onClick={handleStartClick}
            size="large"
            variant="contained"
          >
            수집 시작
          </Button>
        )}
        <FormControlLabel
          control={
            <Switch checked={watch ?? false} onChange={handleWatchChange} />
          }
          label="방송 감지"
          sx={{ marginLeft: 2 }}
        />
      </FormLabel>

      <FormLabel
        description="수집한 채팅 데이터를 다운로드 받을 수 있습니다."
        label="내보내기"
      >
        <Button color="info" href="/api/export/chat.csv" variant="contained">
          CSV
        </Button>
      </FormLabel>

      <FormLabel
        description="수집한 채팅은 종료 후에도 남아 있습니다. 초기화하지 않으면 누적되니 새 방송 시작 전 초기화를 눌러주세요."
        label="초기화"
      >
        <Stack direction="row" spacing={1}>
          <Button color="error" onClick={handleClearClick} variant="contained">
            수집 데이터 초기화
          </Button>
        </Stack>
      </FormLabel>
    </Stack>
  );
};

export default Collector;
