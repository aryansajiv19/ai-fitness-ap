# ASCEND

A full-stack AI-powered fitness tracking app — users log workouts, get AI coaching, compete in real-time challenges, and track muscle recovery.

## Run & Operate

- **Backend**: `node server.js` (port 3000, console workflow)
- **Frontend**: `cd frontend && npm run dev` (port 5000, webview workflow)
- **Schema bootstrap**: `node setup.js` (idempotent — run after schema changes)
- **Required env vars**: `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`

## Stack

- **Backend**: Node.js 20, Express 5, socket.io, @anthropic-ai/sdk
- **Frontend**: React 18, Vite, CSS custom properties (no Tailwind)
- **Fonts**: DM Sans (headings/body), JetBrains Mono (labels/monospace) via Google Fonts
- **DB**: PostgreSQL + pgvector extension (vector(1536) column on workouts, ivfflat index)
- **Auth**: JWT + bcrypt
- **Docker**: Dockerfile (backend), frontend/Dockerfile (nginx), docker-compose.yml (app + pgvector/pgvector:pg16 + frontend)

## Where things live

- `server.js` — Express + socket.io entrypoint, workout CRUD, real-time leaderboard emit
- `auth.js` — signup/login
- `middleware.js` — JWT verification
- `chat.js` — POST /api/chat (Claude Sonnet 4, streaming SSE)
- `voice.js` — POST /api/workouts/voice (Claude NLP parsing → structured workout)
- `embeddings.js` — POST /api/workouts/semantic-search (PostgreSQL full-text tsvector search)
- `challenges.js`, `leaderboard.js`, `recovery.js` — feature routes
- `db.js` — pg Pool using DATABASE_URL
- `setup.js` — idempotent schema bootstrap (pgvector extension + embedding column)
- `Dockerfile` — Node.js 20 backend container
- `frontend/Dockerfile` — Nginx multi-stage build for React frontend
- `frontend/nginx.conf` — SPA fallback + /api and /socket.io proxy to backend
- `docker-compose.yml` — full stack: db (pgvector/pgvector:pg16), app, frontend
- `.dockerignore`
- `frontend/` — Vite React app
  - `src/pages/` — Auth, Dashboard, WorkoutLogger, ChatPage, Challenges, LeaderboardPage, Progress
  - `src/components/Layout.jsx` — sidebar nav with cursor glow + ambient effects
  - `src/lib/api.js` — typed fetch wrapper + chatStream SSE helper + semanticSearch
  - `src/index.css` — full design system (CSS vars, animations, all component classes)

## Architecture decisions

- Stateless JWT auth — horizontally scalable, no session store
- socket.io rooms per challenge (`challenge:<id>`) — real-time leaderboard push on workout POST
- Claude Sonnet 4 for both AI chat (streaming SSE) and voice NLP parsing — Anthropic only, no OpenAI
- pgvector extension enabled; semantic search uses PostgreSQL tsvector full-text ranking (ILIKE fallback)
- All workout queries filter by user_id at SQL layer
- Vite proxy `/api` and `/socket.io` to localhost:3000 — no CORS config needed in dev
- Docker compose uses `pgvector/pgvector:pg16` image so the extension is available out of the box

## Product

- Signup/login with JWT (token in localStorage as `'token'`, user meta as `'ascend_user'`)
- Log workouts manually (exercise + sets/reps/weight + muscle chip selector) or via natural language
- Workout search bar with debounced full-text search (tsvector ranked, ILIKE fallback)
- Recovery tracker (fatigue model per muscle group, 7-day window)
- AI coaching chat with Claude (streaming SSE, bold markdown → `<em>` highlight)
- Challenges: create, join, progress bars, avatar stacks, live leaderboard (WebSocket real-time)
- Progress: animated SVG line chart, PR detection, PR timeline

## User preferences

- Design from Claude Design HTML: black bg (#000), DM Sans + JetBrains Mono, orange accent (#ff6500)
- Dark editorial aesthetic: 64px page titles, numbered monospace nav, animated logo letter-drop
- Ambient orange glow blobs, film grain overlay, cursor glow
- Anthropic only (no OpenAI)

## Gotchas

- `setup.js` calls `pool.end()` — never require() it from server.js
- Frontend on port 5000 (webview), backend on port 3000 (console)
- socket.io path proxied through Vite: `/socket.io` → `localhost:3000`
- Auth stores user in `'ascend_user'` JSON key; JWT in `'token'`
- pgvector ivfflat index requires at least 1 row to be useful — empty DB is fine
- React Router v6 future flag warnings are cosmetic

## Pointers

- Docker compose db uses `pgvector/pgvector:pg16` (pgvector pre-installed)
- frontend/nginx.conf handles SPA routing + reverse proxy to backend container named `app`
