import { useCallback, useRef } from 'react';

import type { StoreType } from '../../shared/storeSchema';
import { storeDefaults } from '../../shared/storeSchema';
import type { DotPath, DotPathValue } from '../../shared/types';
import {
  useDeleteStoreQuery,
  useGetStoreQuery,
  usePutStoreQuery,
} from './useStoreQuery';

type UseStoreReturn<T> = readonly [
  T,
  (newValue: T | ((oldValue: T) => T)) => void,
  () => void,
];

const getStoreDefault = <K extends DotPath<StoreType>>(
  key: K,
): DotPathValue<StoreType, K> => {
  return key
    .split('.')
    .reduce<unknown>(
      (value, part) => (value as Record<string, unknown>)[part],
      storeDefaults,
    ) as DotPathValue<StoreType, K>;
};

// key는 shared/storeSchema.ts에서 먼저 선언해둘 것
const useStore = <K extends DotPath<StoreType>>(
  key: K,
): UseStoreReturn<DotPathValue<StoreType, K>> => {
  const { data } = useGetStoreQuery(key);
  const { mutate: putMutate } = usePutStoreQuery(key);
  const { mutate: deleteMutate } = useDeleteStoreQuery(key);

  const storedValue = data ?? getStoreDefault(key);
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = useCallback(
    (
      newValue:
        | DotPathValue<StoreType, K>
        | ((
            oldValue: DotPathValue<StoreType, K>,
          ) => DotPathValue<StoreType, K>),
    ) => {
      const value =
        typeof newValue === 'function'
          ? (
              newValue as (
                oldValue: DotPathValue<StoreType, K> | undefined,
              ) => DotPathValue<StoreType, K>
            )(storedValueRef.current)
          : newValue;
      putMutate(value);
    },
    [putMutate],
  );

  const delValue = useCallback(() => {
    deleteMutate();
  }, [deleteMutate]);

  return [storedValue, setValue, delValue] as const;
};

export default useStore;
