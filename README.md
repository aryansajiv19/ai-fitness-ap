# ASCEND

> Your AI-powered training coach. Log workouts, get personalized coaching, compete in real-time challenges, and track your recovery — all in one place.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Sonnet%204-D97757?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-ff6500?style=flat-square)

---

## What is ASCEND?

ASCEND is a full-stack AI fitness tracking app that turns your workout history into intelligent coaching. Log lifts manually or by describing them in plain English, compete in real-time challenges, and get streaming AI advice that actually references your data — not generic tips.

Built with a dark editorial design: black background, orange accent (`#ff6500`), DM Sans headings, JetBrains Mono labels, ambient glow effects.

---

## Features

### Workout Logging
- **Manual entry** — exercise, sets, reps, weight, muscle group chip selector
- **Voice / Natural language** — describe your workout in plain English and Claude Sonnet 4 parses it into structured data automatically
- **Full-text search** — debounced live search using PostgreSQL `tsvector` ranked results with ILIKE fallback

### AI Coaching
- Streaming chat powered by **Claude Sonnet 4**
- Context-aware — the AI sees your last 20 workouts and current muscle recovery scores before every response
- Server-Sent Events (SSE) streaming with live token rendering

### Recovery Tracker
- Fatigue model per muscle group over a rolling 7-day window
- Volume-weighted recovery score (0–100) for each muscle group: chest, back, shoulders, biceps, triceps, legs, core
- Composite readiness score on the dashboard

### Challenges & Leaderboard
- Create and join fitness challenges with a target muscle group, type, and end date
- **Real-time leaderboard** via socket.io WebSockets — updates live the moment any participant logs a workout
- Progress bars, avatar stacks, and live activity indicators per challenge

### Progress Tracking
- Animated SVG line chart per exercise over time
- Automatic **PR detection** — flags new personal records as they're set
- PR timeline with date and weight for every record

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend runtime | Node.js 20 |
| Backend framework | Express 5 |
| Real-time | socket.io 4 |
| AI | Anthropic Claude Sonnet 4 |
| Database | PostgreSQL 16 + pgvector |
| Auth | JWT + bcrypt |
| Frontend | React 18 + Vite 6 |
| Styling | CSS custom properties |
| Fonts | DM Sans, JetBrains Mono |
| Containers | Docker + docker-compose |

---

## Project Structure

```
ascend/
├── server.js           # Express + socket.io entrypoint, workout CRUD, real-time leaderboard
├── auth.js             # POST /api/auth/signup  and  /api/auth/login
├── middleware.js       # JWT verification middleware
├── chat.js             # POST /api/chat — Claude Sonnet 4 streaming SSE
├── voice.js            # POST /api/workouts/voice — NLP workout parsing via Claude
├── embeddings.js       # POST /api/workouts/semantic-search — tsvector ranked search
├── challenges.js       # Challenge CRUD routes
├── leaderboard.js      # Leaderboard data routes
├── recovery.js         # Muscle recovery calculation routes
├── db.js               # PostgreSQL pool (DATABASE_URL)
├── setup.js            # Idempotent DB schema bootstrap — run once after clone
├── Dockerfile          # Node.js 20 Alpine backend image
├── docker-compose.yml  # Full stack: pgvector db + app + nginx frontend
├── .dockerignore
└── frontend/
    ├── Dockerfile          # Multi-stage Vite build → nginx serve
    ├── nginx.conf          # SPA fallback + /api and /socket.io reverse proxy
    └── src/
        ├── pages/
        │   ├── Auth.jsx            # Sign in / Create account
        │   ├── Dashboard.jsx       # Stats, recent workouts, recovery overview
        │   ├── WorkoutLogger.jsx   # Manual + voice logging + search
        │   ├── ChatPage.jsx        # AI coaching chat
        │   ├── Challenges.jsx      # Challenge browser + creator
        │   ├── LeaderboardPage.jsx # Real-time leaderboard via WebSocket
        │   └── Progress.jsx        # SVG charts + PR detection
        ├── components/
        │   └── Layout.jsx          # Sidebar nav, cursor glow, ambient effects
        ├── lib/
        │   └── api.js              # Typed fetch wrapper + SSE chat stream helper
        └── index.css               # Full design system (CSS vars, animations)
```

---

## API Reference

### Auth
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/signup` | `{ email, password }` | `{ userId }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, userId }` |

### Workouts — requires `Authorization: Bearer <token>`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | All workouts for current user |
| POST | `/api/workouts` | Log a workout |
| PUT | `/api/workouts/:id` | Edit a workout |
| DELETE | `/api/workouts/:id` | Delete a workout |
| GET | `/api/workouts/search?q=` | ILIKE text search |
| POST | `/api/workouts/semantic-search` | tsvector ranked search |
| POST | `/api/workouts/voice` | Parse natural language → log workout |

### Other — requires JWT
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | AI coaching message (streaming SSE) |
| GET | `/api/recovery` | Muscle recovery scores |
| GET | `/api/challenges` | List all challenges |
| POST | `/api/challenges` | Create a challenge |
| POST | `/api/challenges/:id/join` | Join a challenge |
| GET | `/api/leaderboard/:id` | Challenge leaderboard |

### WebSocket Events (socket.io)
| Event | Direction | Description |
|-------|-----------|-------------|
| `join_challenge` | Client → Server | Subscribe to a challenge room |
| `leave_challenge` | Client → Server | Unsubscribe from a challenge room |
| `leaderboard_update` | Server → Client | Live leaderboard push on new workout |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16 with the pgvector extension
- An [Anthropic API key](https://console.anthropic.com/)

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ascend
JWT_SECRET=your_jwt_secret_here
ANTHROPIC_API_KEY=sk-ant-...
```

### Running Locally

```bash
# 1. Install backend dependencies
npm install

# 2. Install and build frontend
cd frontend && npm install && cd ..

# 3. Bootstrap the database schema (run once)
node setup.js

# 4. Start the backend on port 3000
node server.js

# 5. In a separate terminal — start the Vite dev server on port 5000
cd frontend && npm run dev
```

Open [http://localhost:5000](http://localhost:5000). Vite proxies `/api` and `/socket.io` to the backend automatically — no CORS configuration needed.

### Docker (Full Stack)

```bash
docker-compose up --build
```

This starts three services:
- **db** — `pgvector/pgvector:pg16` on port 5432 (pgvector pre-installed)
- **app** — Node.js backend on port 3000
- **frontend** — Nginx serving the built React app on port 80

---

## Database Schema

```sql
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  email        VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workouts (
  id           SERIAL PRIMARY KEY,
  exercise     VARCHAR(100),
  sets         INTEGER,
  reps         INTEGER,
  weight       DECIMAL,
  muscle_group VARCHAR(50),
  user_id      INTEGER REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW(),
  embedding    vector(1536)   -- pgvector column for semantic search
);

CREATE TABLE challenges (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100),
  description    TEXT,
  challenge_type VARCHAR(50),
  target_muscle  VARCHAR(50),
  target_value   DECIMAL,
  start_date     TIMESTAMP DEFAULT NOW(),
  end_date       TIMESTAMP,
  created_by     INTEGER REFERENCES users(id)
);

CREATE TABLE challenge_participants (
  id           SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES challenges(id),
  user_id      INTEGER REFERENCES users(id),
  score        DECIMAL DEFAULT 0,
  joined_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);
```

---

## Architecture Notes

- **Stateless JWT auth** — no session store, horizontally scalable. Middleware attaches `req.userId` so route handlers stay thin.
- **User-scoped queries everywhere** — all workout routes filter by `user_id` at the SQL layer. No application-level authorization to forget.
- **Parameterized queries only** — every `pool.query` uses positional parameters. Zero string interpolation into SQL.
- **socket.io rooms** per challenge (`challenge:<id>`) — the leaderboard is pushed to all room members the moment a participant logs a workout.
- **Claude Sonnet 4** for both streaming AI chat and voice NLP parsing — Anthropic only.
- **pgvector** enabled with `ivfflat` index; semantic search falls back to PostgreSQL `tsvector` full-text ranking with ILIKE as a final fallback.
- **Idempotent schema bootstrap** — `setup.js` uses `IF NOT EXISTS` everywhere, safe to re-run on any environment.

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#000000` |
| Foreground | `#f5f5f3` |
| Accent | `#ff6500` |
| Heading font | DM Sans |
| Mono font | JetBrains Mono |
| Page title size | 64px |

Effects: ambient orange glow blobs, film grain overlay, cursor glow, animated letter-drop logo, page entrance blur + slide-up transitions.

---

## License

MIT — built by [Aryan Sajiv](https://github.com/aryansajiv19).
