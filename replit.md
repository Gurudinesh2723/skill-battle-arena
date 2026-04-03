# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Project: Skill Battle Arena

A real-time multiplayer trivia quiz battle game. Players compete in knowledge battles, earn skill ratings, collect coins, and climb the global leaderboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS + framer-motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Build**: esbuild (CJS bundle)

## Artifacts

- `artifacts/skill-battle-arena` — React frontend web app (port via $PORT, preview at `/`)
- `artifacts/api-server` — Express API server (port 8080, preview at `/api`)

## Features Implemented

- User auth: register/login/logout with JWT tokens
- Dashboard with player stats, recent matches, coins, skill rating
- Quiz game: category selection, animated countdown timer, score tracking
- Answer submission with correct/wrong feedback + points calculation
- Match results with rating change and coins earned
- Global leaderboard with player rankings
- User profile pages with stats
- 48 questions across 8 categories: Science, Technology, History, Geography, Sports, Entertainment, Math, General Knowledge

## Database Tables

- `users` — player accounts (username, email, passwordHash, totalScore, skillRating, coins)
- `questions` — quiz questions with 4 options, correct answer index, category, difficulty, timeLimit
- `matches` — game sessions (userId, category, status, score, questionIds)
- `answers` — individual answer records per match/question

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Endpoints

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login
- `GET /api/auth/me` — get current user
- `GET /api/questions` — get random questions (with category filter)
- `GET /api/questions/categories` — all categories
- `POST /api/matches` — create new match
- `GET /api/matches/:id` — get match with questions
- `POST /api/matches/:id/submit` — submit an answer
- `POST /api/matches/:id/finish` — finish match & update scores
- `GET /api/leaderboard` — global rankings
- `GET /api/leaderboard/summary` — stats summary
- `GET /api/users/:id` — user profile
- `GET /api/users/:id/stats` — user game stats

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
