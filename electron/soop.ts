import type { FastifyInstance } from 'fastify';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type {
  ChatResponse,
  DonationResponse,
  EmotionResponse,
  SoopChat,
  SubscribeResponse,
} from 'soop-extension';
import { SoopChatEvent, SoopClient } from 'soop-extension';
import * as z from 'zod';

import type { RankChatMessage } from '../shared/types';
import { broadcast } from './overlay';

const soopChatRef: { current: SoopChat | null } = { current: null };

type TypeResponse =
  | [type: SoopChatEvent.CHAT, response: ChatResponse]
  | [type: SoopChatEvent.EMOTICON, response: EmotionResponse]
  | [type: SoopChatEvent.TEXT_DONATION, response: DonationResponse]
  | [type: SoopChatEvent.VIDEO_DONATION, response: DonationResponse]
  | [type: SoopChatEvent.AD_BALLOON_DONATION, response: DonationResponse]
  | [type: SoopChatEvent.SUBSCRIBE, response: SubscribeResponse];

const client = new SoopClient();

const handleChat = (
  fastify: FastifyInstance,
  streamerId: string,
  ...args: TypeResponse
) => {
  const [type, response] = args;
  const { receivedTime, ...other } = response;
  let username: string;
  let userId: string;
  let value: string;
  switch (type) {
    case SoopChatEvent.CHAT:
      username = response.username;
      userId = response.userId;
      value = response.comment;
      break;

    case SoopChatEvent.EMOTICON:
      username = response.username;
      userId = response.userId;
      value = response.emoticonId;
      break;

    case SoopChatEvent.TEXT_DONATION:
    case SoopChatEvent.VIDEO_DONATION:
    case SoopChatEvent.AD_BALLOON_DONATION:
      username = response.fromUsername;
      userId = response.from;
      value = response.amount;
      break;

    case SoopChatEvent.SUBSCRIBE:
      username = response.fromUsername;
      userId = response.from;
      value = `${response.monthCount}|${response.tier}`;
      break;

    default:
      console.log(`[${receivedTime}|${type}] ${JSON.stringify(other)}`);
      return;
  }
  const normalizedUserId = userId.replace(/\(\d\)$/, '');

  console.log(`[${receivedTime}|${type}] ${username}(${userId}): ${value}`);
  fastify.sqlite.run(
    `
INSERT INTO chat (streamerId, type, receivedTime, username, userId, value)
VALUES (:streamerId, :type, :receivedTime, :username, :userId, :value);
`,
    {
      streamerId,
      type,
      receivedTime,
      username,
      userId: normalizedUserId,
      value,
    },
  );
  if (type === SoopChatEvent.CHAT) {
    broadcast('rank-chat', {
      event: 'chat',
      data: {
        streamerId,
        userId: normalizedUserId,
        message: value,
      } satisfies RankChatMessage,
    });
  }
  if (
    (type === SoopChatEvent.TEXT_DONATION ||
      type === SoopChatEvent.VIDEO_DONATION ||
      type === SoopChatEvent.AD_BALLOON_DONATION) &&
    parseInt(response.fanClubOrdinal, 10) !== 0
  ) {
    // 팬가입
    console.log(
      `[${receivedTime}|fanClub] ${username}(${userId}): ${response.fanClubOrdinal}`,
    );
    fastify.sqlite.run(
      `
INSERT INTO chat (streamerId, type, receivedTime, username, userId, value)
VALUES (:streamerId, :type, :receivedTime, :username, :userId, :value);
`,
      {
        streamerId,
        type: 'fanClub',
        receivedTime,
        username,
        userId: normalizedUserId,
        value: response.fanClubOrdinal,
      },
    );
  }
};

const routes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post<{ Body: { streamerId: string } }>(
    '/api/soop',
    async (request, reply) => {
      const { streamerId } = request.body;
      if (!streamerId) {
        return reply.code(400).send({ message: 'streamerId value is missing' });
      }
      try {
        const soopChat = client.chat({ streamerId });
        soopChatRef.current = soopChat;

        // 채팅 데이터
        soopChat.on(SoopChatEvent.CHAT, (response) =>
          handleChat(fastify, streamerId, SoopChatEvent.CHAT, response),
        );

        // 이모티콘 데이터
        soopChat.on(SoopChatEvent.EMOTICON, (response) =>
          handleChat(fastify, streamerId, SoopChatEvent.EMOTICON, response),
        );

        // 별풍선 데이터
        soopChat.on(SoopChatEvent.TEXT_DONATION, (response) =>
          handleChat(
            fastify,
            streamerId,
            SoopChatEvent.TEXT_DONATION,
            response,
          ),
        );

        // 영상풍선 데이터
        soopChat.on(SoopChatEvent.VIDEO_DONATION, (response) =>
          handleChat(
            fastify,
            streamerId,
            SoopChatEvent.VIDEO_DONATION,
            response,
          ),
        );

        // 애드벌룬 데이터
        soopChat.on(SoopChatEvent.AD_BALLOON_DONATION, (response) =>
          handleChat(
            fastify,
            streamerId,
            SoopChatEvent.AD_BALLOON_DONATION,
            response,
          ),
        );

        // 구독 데이터
        soopChat.on(SoopChatEvent.SUBSCRIBE, (response) =>
          handleChat(fastify, streamerId, SoopChatEvent.SUBSCRIBE, response),
        );

        // 연결 종료
        soopChat.on(SoopChatEvent.DISCONNECT, (response) => {
          console.log(
            `[${response.receivedTime}] ${response.streamerId}'s stream has ended`,
          );
          // 연결이 끊기면 재연결
          soopChatRef.current?.connect();
        });

        // Connect to chat
        await soopChat.connect();
      } catch {
        console.log('error soopChat');
        soopChatRef.current = null;
        return reply.code(500).send({ message: 'error soopChat' });
      }
    },
  );

  fastify.get('/api/soop', async () => {
    return !!soopChatRef.current;
  });

  fastify.delete('/api/soop', async () => {
    const soopChat = soopChatRef.current;
    soopChatRef.current = null;
    soopChat?.disconnect();
  });

  fastify.get(
    '/api/soop/station',
    { schema: { querystring: z.object({ streamerId: z.coerce.string() }) } },
    async (request) => {
      const { streamerId } = request.query;
      return await client.channel.station(streamerId);
    },
  );

  fastify.get(
    '/api/soop/detail',
    { schema: { querystring: z.object({ streamerId: z.coerce.string() }) } },
    async (request) => {
      const { streamerId } = request.query;
      return await client.live.detail(streamerId);
    },
  );
};

export default routes;
