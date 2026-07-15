import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type {
  ChatResponse,
  DonationResponse,
  EmotionResponse,
  SoopChat,
} from 'soop-extension';
import { SoopChatEvent, SoopClient } from 'soop-extension';

const soopChatRef: { current: SoopChat | null } = { current: null };

type TypeResponse =
  | [type: SoopChatEvent.CHAT, response: ChatResponse]
  | [type: SoopChatEvent.EMOTICON, response: EmotionResponse]
  | [type: SoopChatEvent.TEXT_DONATION, response: DonationResponse]
  | [type: SoopChatEvent.VIDEO_DONATION, response: DonationResponse]
  | [type: SoopChatEvent.AD_BALLOON_DONATION, response: DonationResponse];

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

    default:
      console.log(`[${receivedTime}|${type}] ${JSON.stringify(other)}`);
      return;
  }

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
      userId: userId.replace(/\(\d\)$/, ''),
      value,
    },
  );
};

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: { streamerId: string } }>(
    '/api/soop',
    async (request, reply) => {
      const { streamerId } = request.body;
      if (!streamerId) {
        return reply.code(400).send({ message: 'streamerId value is missing' });
      }
      try {
        const client = new SoopClient();
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
};

export default routes;
