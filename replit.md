# ASCEND

A full-stack AI-powered fitness tracking app — users log workouts, get AI coaching, compete in real-time challenges, and track muscle recovery.

## Run & Operate

- **Backend**: `node server.js` (port 3000, console workflow)
- **Frontend**: `cd frontend && npm run dev` (port 5000, webview workflow)
- **Schema bootstrap**: `node setup.js` (idempotent)
- **Required env vars**: `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`

## Stack

- **Backend**: Node.js 20, Express 5, socket.io, @anthropic-ai/sdk
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, socket.io-client, React Router v6
- **DB**: PostgreSQL via `pg` (Replit managed)
- **Auth**: JWT + bcrypt

## Where things live

- `server.js` — Express + socket.io entrypoint, workout CRUD, real-time leaderboard emit
- `auth.js` — signup/login
- `middleware.js` — JWT verification
- `chat.js` — POST /api/chat (Claude Sonnet 4, streaming SSE)
- `voice.js` — POST /api/workouts/voice (Claude NLP parsing → structured workout)
- `challenges.js`, `leaderboard.js`, `recovery.js` — feature routes
- `db.js` — pg Pool using DATABASE_URL
- `setup.js` — idempotent schema bootstrap
- `frontend/` — Vite React app
  - `src/pages/` — Auth, Dashboard, WorkoutLogger, ChatPage, Challenges, LeaderboardPage
  - `src/components/Layout.jsx` — sidebar nav
  - `src/lib/api.js` — typed fetch wrapper + chatStream SSE helper

## Architecture decisions

- Stateless JWT auth — horizontally scalable, no session store
- socket.io rooms per challenge (`challenge:<id>`) — real-time leaderboard push on workout POST
- Claude Sonnet 4 for both AI chat (streaming SSE) and voice NLP parsing
- All workout queries filter by user_id at SQL layer
- Vite proxy `/api` and `/socket.io` to localhost:3000 — no CORS config needed in dev
- Text search via PostgreSQL ILIKE (no pgvector needed for MVP)

## Product

- Signup/login with JWT
- Log workouts manually or via natural language ("bench 3x10 at 80kg")
- Recovery tracker (fatigue model per muscle group, 7-day window)
- AI coaching chat with Claude (streaming, uses workout history as context)
- Challenges: create, join, view live leaderboard (WebSocket real-time updates)

## User preferences

- Anthropic only (no OpenAI) — MVP simplicity
- Dark theme, lime accent (#c8ff2e)

## Gotchas

- `setup.js` calls `pool.end()` — never require() it from server.js
- Frontend on port 5000 (webview), backend on port 3000 (console)
- socket.io path proxied through Vite: `/socket.io` → `localhost:3000`

## Pointers

- React Router v6 future flag warnings are cosmetic — no breaking behavior
