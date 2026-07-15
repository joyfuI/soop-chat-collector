import path from 'node:path';
import fastifySSE from '@fastify/sse';
import fastifyStatic from '@fastify/static';
import { app } from 'electron';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import chatRoutes from './chat';
import exportRoutes from './export';
import fastifyNodeSqlite from './lib/fastifyNodeSqlite';
import overlayRoutes from './overlay';
import soopRoutes from './soop';
import storeRoutes from './store';

const createHttpServer = (rendererDist?: string) => {
  const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  if (rendererDist) {
    fastify.register(fastifyStatic, {
      root: app.isPackaged
        ? [rendererDist, app.getPath('appData')]
        : rendererDist,
    });
  }
  fastify.register(fastifySSE);

  fastify.register(storeRoutes);
  fastify.register(soopRoutes);
  fastify.register(chatRoutes);
  fastify.register(exportRoutes);
  fastify.register(overlayRoutes);

  fastify.register(fastifyNodeSqlite, {
    path: path.join(app.getPath('userData'), `${app.getName()}.db`),
    wal: true,
    allowBareNamedParameters: true,
    setup: (db) => {
      db.exec(`
CREATE TABLE IF NOT EXISTS chat (
  id INTEGER PRIMARY KEY,
  streamerId TEXT NOT NULL,
  type TEXT NOT NULL,
  receivedTime TEXT NOT NULL,
  username TEXT NOT NULL,
  userId TEXT NOT NULL,
  value TEXT NOT NULL
);
`);
      db.exec(`
CREATE INDEX IF NOT EXISTS idx_chat_rank_user_latest
ON chat (streamerId, userId, receivedTime DESC, id DESC)
WHERE type IN ('chat', 'emoticon');
`);
      db.exec(`
CREATE INDEX IF NOT EXISTS idx_donation_rank_user_latest
ON chat (streamerId, userId, receivedTime DESC, id DESC)
WHERE type IN ('textDonation', 'videoDonation', 'adBalloonDonation');
`);
    },
  });

  return fastify;
};

export default createHttpServer;
