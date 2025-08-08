import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { users, sessions, User } from '../db';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      reply.code(400).send({ error: 'Missing fields' });
      return;
    }
    if (users.find(u => u.email === email)) {
      reply.code(400).send({ error: 'User exists' });
      return;
    }
    const id = crypto.randomUUID();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user: User = { id, email, passwordHash };
    users.push(user);
    reply.send({ success: true });
  });

  app.post('/login', async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };
    const user = users.find(u => u.email === email);
    if (!user) {
      reply.code(401).send({ error: 'Invalid credentials' });
      return;
    }
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (passwordHash !== user.passwordHash) {
      reply.code(401).send({ error: 'Invalid credentials' });
      return;
    }
    const token = crypto.randomBytes(16).toString('hex');
    sessions[token] = user.id;
    reply.send({ token });
  });
}
