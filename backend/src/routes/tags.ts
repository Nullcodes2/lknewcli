import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { tags, contactTags, Tag } from '../db';

export default async function tagRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const userId = (req as any).userId as string;
    return tags.filter(t => t.ownerId === userId);
  });

  app.post('/', async (req, reply) => {
    const { name, color } = req.body as { name: string; color: string };
    const userId = (req as any).userId as string;
    const tag: Tag = { id: crypto.randomUUID(), name, color, ownerId: userId };
    tags.push(tag);
    reply.send(tag);
  });

  app.post('/assign', async (req, reply) => {
    const { chatId, tagId } = req.body as { chatId: string; tagId: string };
    const userId = (req as any).userId as string;
    const tag = tags.find(t => t.id === tagId && t.ownerId === userId);
    if (!tag) {
      reply.code(404).send({ error: 'Tag not found' });
      return;
    }
    const key = `${userId}:${chatId}`;
    if (!contactTags[key]) contactTags[key] = [];
    if (!contactTags[key].includes(tagId)) contactTags[key].push(tagId);
    reply.send({ success: true });
  });

  app.get('/assign/:chatId', async (req) => {
    const { chatId } = req.params as { chatId: string };
    const userId = (req as any).userId as string;
    const key = `${userId}:${chatId}`;
    return (contactTags[key] || []).map(tid => tags.find(t => t.id === tid));
  });
}
