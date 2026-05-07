# ASCEND

AI-powered fitness tracking app — workout logging, AI coaching, real-time challenges, recovery tracking.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Sonnet%204-D97757?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)

## Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js 20, Express 5 |
| Real-time | socket.io 4 |
| AI | Anthropic Claude Sonnet 4 |
| Database | PostgreSQL 16 + pgvector |
| Auth | JWT + bcrypt |
| Frontend | React 18 + Vite 6 |
| Containers | Docker + docker-compose |

## Setup

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Bootstrap DB schema (run once)
node setup.js

# Start backend (port 3000)
node server.js

# Start frontend (port 5000)
cd frontend && npm run dev
```

**.env**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ascend
JWT_SECRET=your_secret
ANTHROPIC_API_KEY=sk-ant-...
```

## Docker

```bash
docker-compose up --build
```

Starts: `pgvector/pgvector:pg16` (db) + Node backend (3000) + Nginx frontend (80).

## API

All `/api/workouts`, `/api/chat`, `/api/challenges`, `/api/leaderboard`, `/api/recovery` routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/workouts` | List workouts |
| POST | `/api/workouts` | Log workout |
| PUT | `/api/workouts/:id` | Edit workout |
| DELETE | `/api/workouts/:id` | Delete workout |
| GET | `/api/workouts/search?q=` | Text search |
| POST | `/api/workouts/semantic-search` | tsvector ranked search |
| POST | `/api/workouts/voice` | NLP parse → log workout |
| POST | `/api/chat` | AI coaching (streaming SSE) |
| GET | `/api/recovery` | Muscle recovery scores |
| GET/POST | `/api/challenges` | List / create challenges |
| POST | `/api/challenges/:id/join` | Join challenge |
| GET | `/api/leaderboard/:id` | Challenge leaderboard |

**WebSocket events:** `join_challenge`, `leave_challenge` (client→server) · `leaderboard_update` (server→client)

## Project Structure

```
├── server.js        # Express + socket.io, workout CRUD, leaderboard emit
├── auth.js          # Signup / login
├── middleware.js    # JWT verification
├── chat.js          # Claude Sonnet 4 streaming SSE
├── voice.js         # NLP workout parsing via Claude
├── embeddings.js    # tsvector semantic search
├── challenges.js    # Challenge routes
├── leaderboard.js   # Leaderboard routes
├── recovery.js      # Recovery calculation
├── db.js            # pg Pool
├── setup.js         # DB schema bootstrap
├── Dockerfile
├── docker-compose.yml
└── frontend/
    ├── src/pages/   # Auth, Dashboard, WorkoutLogger, ChatPage,
    │                #   Challenges, LeaderboardPage, Progress
    ├── src/components/Layout.jsx
    ├── src/lib/api.js
    └── src/index.css
```

## Notes

- All workout queries filter by `user_id` at SQL layer
- socket.io rooms per challenge — leaderboard pushes on every workout POST
- pgvector `ivfflat` index on workouts; search falls back to ILIKE if no vector matches
- `setup.js` calls `pool.end()` — never `require()` it from `server.js`

---

Built by [Aryan Sajiv](https://github.com/aryansajiv19)
