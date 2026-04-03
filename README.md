# Skill Battle Arena

A real-time multiplayer trivia quiz battle game where players test their knowledge, earn skill ratings, collect coins, and climb the global leaderboard.

## Live Demo

🎮 [Play Now](https://skill-arena-master--idinamail7.replit.app)

## Features

- User registration and login with JWT authentication
- Quiz game with 8 categories and 3 difficulty levels
- Animated countdown timer with speed-based bonus points
- Skill rating and coins system after every match
- Global leaderboard with player rankings
- User profile pages with full game stats
- 48 questions across Science, Technology, History, Geography, Sports, Entertainment, Math, and General Knowledge

## Tech Stack

**Frontend**
- React + Vite
- TailwindCSS
- Framer Motion (animations)
- React Query (data fetching)
- Wouter (routing)

**Backend**
- Node.js + Express
- PostgreSQL
- Drizzle ORM
- JWT (jsonwebtoken + bcryptjs)

**Other**
- pnpm workspaces (monorepo)
- TypeScript
- OpenAPI + Orval (code generation)
- Zod (validation)

## Project Structure

```
skill-battle-arena/
├── artifacts/
│   ├── skill-battle-arena/     # React frontend
│   └── api-server/             # Express backend
├── lib/
│   ├── api-spec/               # OpenAPI specification
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Database schema (Drizzle ORM)
└── scripts/                    # Utility scripts
```

## Running Locally

### Prerequisites

Make sure you have these installed on your laptop:
- [Node.js](https://nodejs.org) (version 18 or higher)
- [pnpm](https://pnpm.io) — install with `npm install -g pnpm`
- [PostgreSQL](https://www.postgresql.org/download) — a running database

### Step 1 — Clone the repository

```bash
git clone https://github.com/Gurudinesh2723/skill-battle-arena.git
cd skill-battle-arena
```

### Step 2 — Install dependencies

```bash
pnpm install
```

### Step 3 — Set up environment variables

Create a `.env` file in the `artifacts/api-server/` folder:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/skillbattle
SESSION_SECRET=any-long-random-string-here
PORT=8080
```

Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials.

### Step 4 — Create the database

Open your PostgreSQL terminal and run:

```sql
CREATE DATABASE skillbattle;
```

### Step 5 — Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### Step 6 — Start the backend server

```bash
pnpm --filter @workspace/api-server run dev
```

### Step 7 — Start the frontend (open a new terminal)

```bash
cd artifacts/skill-battle-arena
PORT=3000 BASE_PATH=/ pnpm run dev
```

### Step 8 — Open the app

Go to `http://localhost:3000` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/questions | Get random questions |
| GET | /api/questions/categories | All categories |
| POST | /api/matches | Create new match |
| GET | /api/matches/:id | Get match with questions |
| POST | /api/matches/:id/submit | Submit an answer |
| POST | /api/matches/:id/finish | Finish match and update scores |
| GET | /api/leaderboard | Global rankings |
| GET | /api/leaderboard/summary | Stats summary |
| GET | /api/users/:id | User profile |
| GET | /api/users/:id/stats | User game stats |

## Screenshots

### Home Page
![Home](https://skill-arena-master--idinamail7.replit.app)

## Author

**Gurudinesh** — [GitHub](https://github.com/Gurudinesh2723)
