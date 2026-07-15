import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { ChangeEvent } from 'react';

import FormLabel from './components/FormLabel';
import { useDeleteChatQuery } from './hooks/useChatQuery';
import {
  useDeleteSoopQuery,
  useGetSoopQuery,
  usePostSoopQuery,
} from './hooks/useSoopQuery';
import useStore from './hooks/useStore';

const Collector = () => {
  const [streamerId, setStreamerId] = useStore('streamerId', '');

  const { data: isStarted } = useGetSoopQuery();
  const { mutateAsync: connectMutateAsync } = usePostSoopQuery();
  const { mutate: disconnectMutate } = useDeleteSoopQuery();
  const { mutate: clearMutate } = useDeleteChatQuery();

  const handleStreamerIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStreamerId(e.target.value);
  };

  const handleStartClick = async () => {
    try {
      await connectMutateAsync(streamerId);
    } catch {
      alert('연결 실패!');
    }
  };

  const handleStopClick = () => {
    disconnectMutate();
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
          disabled={isStarted}
          onChange={handleStreamerIdChange}
          variant="outlined"
        />
      </FormLabel>

      <FormLabel
        description="제약사항) 비번방, 구플방, 19금방은 수집할 수 없습니다."
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
        description="수집한 채팅은 종료 후에도 남아있습니다. 데이터를 지우고 싶으면 초기화 버튼을 누르세요."
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
