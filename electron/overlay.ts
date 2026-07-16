import type { SSEMessage, SSEReplyInterface } from '@fastify/sse';
import type { FastifyPluginAsync } from 'fastify';

import type {
  OverlayKey,
  PostOverlayControlBody,
  PostOverlayControlResponse,
} from '../shared/types';

type ClientsType = Record<OverlayKey, Set<SSEReplyInterface>>;
type PlaybackType = Record<OverlayKey, PostOverlayControlResponse>;

const clients: ClientsType = {
  'rank-chat': new Set<SSEReplyInterface>(),
  'rank-donation': new Set<SSEReplyInterface>(),
};
const playback: PlaybackType = {
  'rank-chat': { revision: 0, status: 'stopped' },
  'rank-donation': { revision: 0, status: 'stopped' },
};

const toSSEMessage = (state: PostOverlayControlResponse): SSEMessage => ({
  id: state.revision.toString(),
  event: 'playback',
  data: state,
});

const broadcast = async (key: OverlayKey, message: SSEMessage) => {
  await Promise.all(
    [...clients[key]].map(async (client) => {
      if (!client.isConnected) {
        clients[key].delete(client);
        return;
      }

      try {
        await client.send(message);
      } catch {
        clients[key].delete(client);
      }
    }),
  );
};

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Params: { key: OverlayKey }; Body: PostOverlayControlBody }>(
    '/api/overlay/:key/control',
    async (request) => {
      const { key } = request.params;
      const { action } = request.body;

      playback[key] = {
        revision: playback[key].revision + 1,
        status: action === 'play' ? 'playing' : 'stopped',
      };

      await broadcast(key, toSSEMessage(playback[key]));
      return playback[key];
    },
  );

  fastify.post<{ Params: { key: OverlayKey } }>(
    '/api/overlay/:key/refresh',
    async (request) => {
      const { key } = request.params;

      await broadcast(key, { event: 'refresh', data: null });
    },
  );

  fastify.get<{ Params: { key: OverlayKey } }>(
    '/api/overlay/:key/events',
    { sse: 'only' },
    async (request, reply) => {
      const { key } = request.params;
      const client = reply.sse;

      client.keepAlive();

      clients[key].add(client);
      client.onClose(() => {
        clients[key].delete(client);
      });

      await client.send(toSSEMessage(playback[key])); // 현재 상태 즉시 전달
    },
  );
};

export default routes;
