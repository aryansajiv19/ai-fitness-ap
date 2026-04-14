# AI Fitness App

A workout tracking API with user authentication — the backend foundation for an AI-powered fitness coach. Built with Node.js, Express, and PostgreSQL.

> **Status:** MVP in progress. Core CRUD and auth are live; AI coaching features are next.

## Features

- JWT-based signup and login
- Per-user workout logging (exercise, sets, reps, weight)
- Full CRUD for workouts, scoped to the authenticated user
- PostgreSQL schema with automated setup

## Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | PostgreSQL (`pg`) |
| Auth | `jsonwebtoken` + `bcrypt` |
| Config | `dotenv` |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Setup

```bash
git clone https://github.com/aryansajiv19/ai-fitness-app.git
cd ai-fitness-app
npm install
```

Create a `.env` file in the project root:

```env
JWT_SECRET=your-long-random-secret
DATABASE_URL=postgres://user:password@localhost:5432/fitness
```

Initialize the database schema:

```bash
node setup.js
```

Start the server:

```bash
npm start
```

Server runs at `http://localhost:3000`.

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | `{ email, password }` | Create a new user |
| `POST` | `/api/auth/login` | `{ email, password }` | Returns `{ token, userId }` |

### Workouts

All workout routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/api/workouts` | — | List current user's workouts |
| `POST` | `/api/workouts` | `{ exercise, sets, reps, weight }` | Log a workout |
| `PUT` | `/api/workouts/:id` | `{ exercise, sets, reps, weight }` | Update a workout |
| `DELETE` | `/api/workouts/:id` | — | Delete a workout |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/server` | Health check |

## Project Structure

```
.
├── server.js       # Express app and workout routes
├── auth.js         # Signup / login routes
├── middleware.js   # JWT auth middleware
├── db.js           # Postgres connection pool
├── setup.js        # Schema bootstrap
└── package.json
```

## Roadmap

- [ ] AI-generated workout recommendations
- [ ] Progress analytics and personal records
- [ ] Frontend client
- [ ] Input validation and error handling
- [ ] Test suite
- [ ] Dockerized deployment

## License

ISC
