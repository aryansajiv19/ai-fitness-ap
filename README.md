# AI Fitness App

A workout tracking backend designed as the foundation for an AI-powered training coach. Users log lifts, the system learns their patterns, and an LLM layer (in progress) generates adaptive programming based on history, fatigue, and goals.

**Stack:** Node.js · Express 5 · PostgreSQL · JWT · bcrypt

---

## Why this project

Most fitness apps are glorified spreadsheets. This one is built around a simple thesis: **your training history is structured data, and an LLM with the right context can out-coach a generic program**. The backend is designed from day one to feed that context cleanly — every workout is user-scoped, timestamped, and queryable.

## Design decisions

- **Stateless JWT auth.** No session store, horizontally scalable out of the box. Middleware attaches `req.userId` so route handlers stay thin.
- **User-scoped queries everywhere.** Workout routes filter by `user_id` at the SQL layer — no application-level authorization to forget.
- **Parameterized queries only.** Every `pool.query` uses positional params. Zero string interpolation into SQL.
- **Idempotent schema bootstrap.** `setup.js` uses `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` so it's safe to re-run on any environment.
- **Secrets out of source.** `JWT_SECRET` lives in env, `.env` is gitignored, committed history is clean.

## API

```
POST   /api/auth/signup      { email, password }              → { userId }
POST   /api/auth/login       { email, password }              → { token, userId }

GET    /api/workouts                                          → [workouts]
POST   /api/workouts         { exercise, sets, reps, weight } → workout
PUT    /api/workouts/:id     { exercise, sets, reps, weight } → workout
DELETE /api/workouts/:id                                      → workout
```

All `/api/workouts` routes require `Authorization: Bearer <token>`.

## Architecture

```
  Client
    │  Bearer JWT
    ▼
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Express    │────▶│  auth        │────▶│  Postgres  │
│  router     │     │  middleware  │     │  (user-    │
│             │     │  (verifies   │     │  scoped)   │
│             │     │   JWT)       │     │            │
└─────────────┘     └──────────────┘     └────────────┘
```

Single-process Express app, connection-pooled Postgres client, JWT verified per request. Designed to scale horizontally behind a load balancer without sticky sessions.

## Roadmap

- **LLM coaching layer** — feed workout history into Claude to generate next-session recommendations
- **Progressive overload detection** — flag plateaus and suggest deload weeks
- **Fatigue modeling** — weight recent volume to avoid overtraining
- **Client app** — React Native frontend
- **Observability** — structured logs, request tracing, p99 latency tracking

---

Built by [Aryan Sajiv](https://github.com/aryansajiv19).
