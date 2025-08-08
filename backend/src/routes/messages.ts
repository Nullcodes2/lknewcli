import { FastifyInstance } from 'fastify';
import { messages, Message } from '../db';

export default async function messageRoutes(app: FastifyInstance) {
  app.get('/:chatId', async (req) => {
    const { chatId } = req.params as { chatId: string };
    const userId = (req as any).userId as string;
    return messages.filter(m => m.chatId === chatId && m.userId === userId);
  });

  app.post('/', async (req, reply) => {
    const { chatId, text, fromClient } = req.body as { chatId: string; text: string; fromClient?: boolean };
    const userId = (req as any).userId as string;
    const msg: Message = {
      chatId,
      userId,
      text,
      fromClient: !!fromClient,
      timestamp: Date.now(),
    };
    messages.push(msg);
    (app as any).io.to(`chat:${chatId}`).emit('message', msg);
    reply.send(msg);
  });
}
