import Fastify from 'fastify';
import FastifySocketIO from 'fastify-socket.io';

import authRoutes from './routes/auth';
import botRoutes from './routes/bots';
import messageRoutes from './routes/messages';
import tagRoutes from './routes/tags';
import { sessions } from './db';

const app = Fastify({ logger: true });

app.register(FastifySocketIO);
// expose all API routes under the `/api` prefix to align with frontend requests
app.register(authRoutes, { prefix: '/api/auth' });

// simple auth middleware for subsequent routes
app.addHook('preHandler', (req, reply, done) => {
  const url = req.url.replace(/^\/api/, '');
  if (!url || url.startsWith('/auth')) return done();
  const auth = req.headers.authorization;
  if (!auth) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  const token = auth.replace('Bearer ', '');
  const userId = sessions[token];
  if (!userId) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  (req as any).userId = userId;
  done();
});

app.register(botRoutes, { prefix: '/api/bots' });
app.register(messageRoutes, { prefix: '/api/messages' });
app.register(tagRoutes, { prefix: '/api/tags' });

app.get('/api', async () => ({ status: 'ok' }));

// socket.io plugin is available only after the server is ready
app.ready(err => {
  if (err) throw err;
  (app as any).io.on('connection', (socket: any) => {
    socket.on('join', (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });
  });
});


app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' }).catch(err => {
  app.log.error(err);
  process.exit(1);
});

