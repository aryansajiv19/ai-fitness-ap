# ASCEND

A workout tracking REST API backend — users log lifts, track recovery, and compete in challenges. Built as the foundation for an AI-powered training coach.

## Run & Operate

- **Start**: `node server.js` (runs on port 3000)
- **Schema bootstrap**: `node setup.js` (idempotent, safe to re-run)
- **Required env vars**: `DATABASE_URL` (auto-set by Replit DB), `JWT_SECRET` (set in secrets)

## Stack

- Node.js 20, Express 5
- PostgreSQL via `pg` (Replit managed DB)
- JWT (`jsonwebtoken`) for stateless auth
- `bcrypt` for password hashing
- `dotenv` for local env loading

## Where things live

- `server.js` — Express app entrypoint, workout CRUD routes
- `auth.js` — signup/login routes
- `middleware.js` — JWT verification middleware
- `challenges.js` — challenge creation and join routes
- `leaderboard.js` — per-challenge leaderboard query
- `recovery.js` — muscle recovery percentage calculation
- `db.js` — pg Pool (uses `DATABASE_URL`)
- `setup.js` — idempotent schema bootstrap

## Architecture decisions

- Stateless JWT auth — no session store, horizontally scalable
- All workout queries filter by `user_id` at SQL layer — no app-level authz bugs
- Parameterized queries only — zero string interpolation into SQL
- `DATABASE_URL` from Replit-managed PostgreSQL (replaces original hardcoded local credentials)

## Product

- User signup/login with hashed passwords and JWT tokens
- Log, update, delete, and list workouts (exercise, sets, reps, weight, muscle group)
- Muscle recovery tracker (fatigue model over last 7 days)
- Create and join fitness challenges; leaderboard ranked by volume/weight

## Gotchas

- `JWT_SECRET` must be set — auth will fail without it (set in shared env vars)
- `setup.js` ends the pool — don't `require()` it from server.js; run it standalone
