import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { bots, Bot } from '../db';

export default async function botRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const userId = (req as any).userId as string;
    return bots.filter(b => b.ownerId === userId);
  });

  app.post('/', async (req, reply) => {
    const { token } = req.body as { token: string };
    const userId = (req as any).userId as string;
    const bot: Bot = { id: crypto.randomUUID(), token, ownerId: userId };
    bots.push(bot);
    // TODO: configure webhook
    reply.send(bot);
  });
}
