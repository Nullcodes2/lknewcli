# Bot Inbox

Simple Telegram bot inbox platform with Node.js backend and React frontend.

## Backend
- Fastify server with in-memory storage.
- Email registration and login issuing bearer tokens.
- Bot management for storing Telegram bot tokens.
- Message API with real-time updates via Socket.IO.
- Tag creation and assignment to chats.

## Frontend
- Vite + React + TypeScript.
- Basic UI for login, bot management, chats and tags.

## Development
```
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

## Deploying on Vercel

This repo includes a `vercel.json` configuration for a monorepo setup:

- `frontend` is built as a static site.
- `backend` is exposed under `/api` as a serverless function with Socket.IO support.

For local development, set `VITE_API_BASE=http://localhost:3000` in `frontend/.env` so the UI can reach the dev backend. In production on Vercel no configuration is required since the frontend will call the `/api` routes directly.

Deploy by running:

```
vercel --prod
```
