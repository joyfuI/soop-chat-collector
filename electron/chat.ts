import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import * as z from 'zod';

const routes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    '/api/chat/rank-chat',
    {
      schema: {
        querystring: z.object({
          streamerId: z.coerce.string(),
          limit: z.coerce.number().int().min(1).default(50),
        }),
      },
    },
    async (request) => {
      const { streamerId, limit } = request.query;
      return fastify.sqlite.all<Record<string, string>>(
        `
WITH aggregated AS (
  SELECT c.userId, (
    SELECT c2.username
    FROM chat AS c2
    WHERE c2.streamerId = :streamerId AND c2.userId = c.userId AND c2.type IN ('chat', 'emoticon')
    ORDER BY c2.receivedTime DESC, c2.id DESC
    LIMIT 1
  ) AS username, COUNT(*) AS chatCount
  FROM chat AS c
  WHERE c.streamerId = :streamerId AND c.type IN ('chat', 'emoticon')
  GROUP BY c.userId
)
SELECT RANK() OVER (
  ORDER BY chatCount DESC
) AS rank, userId, username, chatCount
FROM aggregated
ORDER BY chatCount DESC, userId
LIMIT :limit;
`,
        { streamerId, limit },
      );
    },
  );

  fastify.get(
    '/api/chat/rank-donation',
    {
      schema: {
        querystring: z.object({
          streamerId: z.coerce.string(),
          limit: z.coerce.number().int().min(1).default(5),
        }),
      },
    },
    async (request) => {
      const { streamerId, limit } = request.query;
      return fastify.sqlite.all<Record<string, string>>(
        `
WITH aggregated AS (
  SELECT c.userId, (
    SELECT c2.username
    FROM chat AS c2
    WHERE c2.streamerId = :streamerId AND c2.userId = c.userId AND c2.type IN ('textDonation', 'videoDonation', 'adBalloonDonation')
    ORDER BY c2.receivedTime DESC, c2.id DESC
    LIMIT 1
  ) AS username, SUM(CAST(c.value AS INTEGER)) AS totalDonation
  FROM chat AS c
  WHERE c.streamerId = :streamerId AND c.type IN ('textDonation', 'videoDonation', 'adBalloonDonation')
  GROUP BY c.userId
)
SELECT RANK() OVER (
  ORDER BY totalDonation DESC
) AS rank, userId, username, totalDonation
FROM aggregated
ORDER BY totalDonation DESC, userId
LIMIT :limit;
`,
        { streamerId, limit },
      );
    },
  );

  fastify.get(
    '/api/chat/new-fan-club',
    { schema: { querystring: z.object({ streamerId: z.coerce.string() }) } },
    async (request) => {
      const { streamerId } = request.query;
      return fastify.sqlite.all<Record<string, string>>(
        `
SELECT receivedTime, userId, username, CAST(value AS INTEGER) AS fanClubOrdinal
FROM chat
WHERE streamerId = :streamerId AND type = 'fanClub'
ORDER BY receivedTime, id;
`,
        { streamerId },
      );
    },
  );

  fastify.get(
    '/api/chat/subscribe',
    { schema: { querystring: z.object({ streamerId: z.coerce.string() }) } },
    async (request) => {
      const { streamerId } = request.query;
      return fastify.sqlite.all<Record<string, string>>(
        `
SELECT receivedTime, userId, username, CAST(substr(value, instr(value, '|') + 1) AS INTEGER) AS tier
FROM chat
WHERE streamerId = :streamerId AND type = 'subscribe'
ORDER BY receivedTime, id;
`,
        { streamerId },
      );
    },
  );

  fastify.get(
    '/api/chat/today-live',
    { schema: { querystring: z.object({ streamerId: z.coerce.string() }) } },
    async (request) => {
      const { streamerId } = request.query;
      return fastify.sqlite.get<Record<string, string>>(
        `
SELECT
  COUNT(CASE WHEN type IN ('chat', 'emoticon') THEN 1 END) AS totalChat,
  COUNT(DISTINCT CASE WHEN type IN ('chat', 'emoticon') THEN userId END) AS chatUserCount,
  SUM(CASE WHEN type IN ('textDonation', 'videoDonation', 'adBalloonDonation') THEN CAST(value AS INTEGER) ELSE 0 END) AS totalDonation,
  COUNT(DISTINCT CASE WHEN type IN ('textDonation', 'videoDonation', 'adBalloonDonation') THEN userId END) AS donationUserCount,
  COUNT(CASE WHEN type = 'fanClub' THEN 1 END) AS fanClubCount,
  COUNT(CASE WHEN type = 'subscribe' THEN 1 END) AS subscribeCount
FROM chat
WHERE streamerId = :streamerId;
`,
        { streamerId },
      );
    },
  );

  fastify.delete('/api/chat', async () => {
    fastify.sqlite.run('DELETE FROM chat;');
  });
};

export default routes;
