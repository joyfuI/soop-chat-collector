import { app } from 'electron';
import type { Schema } from 'electron-store';
import Store from 'electron-store';
import type { FastifyPluginAsync } from 'fastify';
import * as z from 'zod';

import type { StoreType } from '../shared/storeSchema';
import { storeSchema } from '../shared/storeSchema';
import type { DotPath, DotPathValue } from '../shared/types';

type StoreKey = DotPath<StoreType>;
type StoreValue = DotPathValue<StoreType, StoreKey>;

let store: Store<StoreType> | null = null;
const getStore = () => {
  if (store) {
    return store;
  }
  const jsonSchema = z.toJSONSchema(storeSchema);
  store = new Store<StoreType>({
    schema: jsonSchema.properties as Schema<StoreType>,
    name: app.getName(),
    cwd: process.env.PORTABLE_EXECUTABLE_DIR ?? process.env.APP_ROOT,
    clearInvalidConfig: true,
  });
  return store;
};

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.delete('/api/store', async () => {
    getStore().clear();
  });

  fastify.get<{ Params: { key: StoreKey } }>(
    '/api/store/:key',
    async (request) => {
      const { key } = request.params;
      return JSON.stringify(getStore().get(key));
    },
  );

  fastify.put<{ Params: { key: StoreKey }; Body: StoreValue }>(
    '/api/store/:key',
    async (request) => {
      const { key } = request.params;
      getStore().set(key, request.body);
    },
  );

  fastify.delete<{ Params: { key: StoreKey } }>(
    '/api/store/:key',
    async (request) => {
      const { key } = request.params;
      getStore().delete(key);
    },
  );
};

export default routes;
