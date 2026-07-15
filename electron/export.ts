import { Readable } from 'node:stream';
import { stringify } from 'csv-stringify';
import type { FastifyPluginAsync } from 'fastify';

type ExportRow = {
  streamerId: string;
  type: string;
  receivedTime: string;
  username: string;
  userId: string;
  value: string;
};

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/export/chat.csv', async (_request, reply) => {
    const statement = fastify.sqlite.prepare(`
SELECT streamerId, type, receivedTime, username, userId, value
FROM chat
ORDER BY id
`);
    const rows = statement.iterate() as IterableIterator<ExportRow>;

    const csvStream = stringify({
      bom: true,
      header: true,
      columns: [
        'streamerId',
        'type',
        'receivedTime',
        'username',
        'userId',
        'value',
      ],
      record_delimiter: 'windows',
    });

    const filename = `chat-${new Date()
      .toISOString()
      .replace(/\.\d{3}Z$/, '')
      .replaceAll(':', '-')}.csv`;

    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);

    return reply.send(
      Readable.from(rows, { objectMode: true }).pipe(csvStream),
    );
  });
};

export default routes;
