import { useEffect, useRef, useState } from 'react';

import type { RankChatMessage } from '../../shared/types';

const useLastChats = (streamerId?: string, userIds: readonly string[] = []) => {
  const [lastChats, setLastChats] = useState<Record<string, string>>({});
  const chatTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const rankUserIds = new Set(userIds);

  const handleChat = (chat: RankChatMessage) => {
    if (chat.streamerId !== streamerId || !rankUserIds.has(chat.userId)) {
      return;
    }

    const previousTimer = chatTimers.current.get(chat.userId);
    if (previousTimer) {
      clearTimeout(previousTimer);
    }

    setLastChats((oldLastChats) => ({
      ...oldLastChats,
      [chat.userId]: chat.message,
    }));
    chatTimers.current.set(
      chat.userId,
      setTimeout(() => {
        setLastChats((oldLastChats) => {
          const newLastChats = { ...oldLastChats };
          delete newLastChats[chat.userId];
          return newLastChats;
        });
        chatTimers.current.delete(chat.userId);
      }, 5000),
    );
  };

  useEffect(() => {
    const timers = chatTimers.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  return { lastChats, handleChat };
};

export default useLastChats;
