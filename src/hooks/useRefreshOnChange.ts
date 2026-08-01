import { useEffect, useRef } from 'react';

import type { OverlayKey } from '../../shared/types';
import { usePostOverlayRefreshQuery } from './useOverlayQuery';

const useRefreshOnChange = (key: OverlayKey, ...values: readonly unknown[]) => {
  const prevValues = useRef<readonly unknown[]>([]);
  const { mutate } = usePostOverlayRefreshQuery(key);

  useEffect(() => {
    if (values.includes(undefined)) {
      // undefined는 페칭 중이라 무시
      return;
    }
    if (
      prevValues.current.some(
        (value, index) => !Object.is(value, values[index]),
      )
    ) {
      mutate();
    }
    prevValues.current = values;
  }, [values, mutate]);
};

export default useRefreshOnChange;
