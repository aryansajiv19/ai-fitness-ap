Create a professional README.md for this project at the root of the repo. The app is called ASCEND — an AI-powered fitness coaching platform.
Include these sections in this order:
1. Hero section

Project name as the main heading
One-line tagline: "AI-powered fitness coaching with per-muscle recovery scoring, voice logging, and real-time social challenges"
Badges row: Node.js version, PostgreSQL version, License (MIT)
A clean banner image or screenshot of the dashboard (use a placeholder for now, I'll add the real image later)

2. Features
Bullet list, each one short and concrete:

Per-muscle-group recovery scoring (calculated live from training history)
AI training coach using Claude with semantic search across user's workouts
Voice-powered workout logging via Whisper transcription
Real-time social challenges and leaderboards via WebSockets
JWT authentication with bcrypt password hashing
Containerized deployment with Docker

3. Tech Stack
Group them clearly:

Backend: Node.js, Express, PostgreSQL, pgvector
Frontend: React 18, Vite, TailwindCSS
AI: Anthropic Claude API, OpenAI Embeddings, Whisper
Realtime: Socket.io
Auth: JWT, bcrypt
Deployment: Docker, Docker Compose

4. Architecture
A simple ASCII diagram or markdown table showing how the React frontend talks to the Express backend, which talks to PostgreSQL with pgvector and the Anthropic/OpenAI APIs.
5. Getting Started
Subsections:

Prerequisites (Node 20+, PostgreSQL 16+, Docker optional)
Environment variables needed (list them with example values, point to .env.example)
Local setup steps (clone, install, run setup.js, npm run dev)
Docker setup (single docker-compose up command)

6. API Reference
Brief table listing the main endpoints with method, path, auth required, and description. Group by Auth, Workouts, Recovery, Challenges, Leaderboard, AI.
7. Project Structure
A tree showing the main folders and what each contains. Just the top 2 levels.
8. Roadmap
Short list of what's done and what's planned next.
9. License
MIT.
Style requirements:

Use proper markdown headings, code blocks with language hints, tables where useful
Keep it scannable — short paragraphs, lots of whitespace
No marketing fluff, no emojis except in feature bullets if appropriate
Use the actual project's data (real endpoints, real env vars, real folder names)
Reference inspiration: the README quality of projects like Supabase, Cal.com, Plane, Trigger.dev

Also create:

A .env.example file at the root with all required env vars and dummy values
A LICENSE file with MIT license text

Verify all paths, commands, and endpoint names match the actual codebase. Don't invent features that don't exist.