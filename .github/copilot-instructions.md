# Smart Canteen Ordering & Queue Management System — GitHub Copilot Configuration

## What This Project Is
A real-time web app where students place canteen orders, see live queue position and dynamic wait-time estimates, and kitchen staff manage orders through a dashboard — all synced via WebSockets, with transaction-safe inventory.

Stack: React + Vite + TypeScript (frontend), Node.js + Express + Socket.io + Prisma (backend), PostgreSQL via Neon, deployed on Koyeb (backend) + Cloudflare Pages (frontend)

## Key Documentation
- **DEPLOYMENT.md**: Full deployment guide with env vars and commands
- **docs/MRD.md**: Market Requirements Document
- **docs/TRD.md**: Technical Requirements Document

## Our Issue Workflow
Every work item is an **Issue** going through 5 phases:
`/start-issue` → `/discuss` + `/research` → `/plan` → `/execute` → `/verify`

## Where to Find Things
- **Backend code**: `backend/src/` (controllers, services, routes, middleware, lib)
- **Frontend code**: `frontend/src/` (pages, components, contexts, hooks, lib)
- **Prisma schema**: `backend/prisma/schema.prisma`
- **Issue docs**: `docs/issues/`
- **Templates**: `docs/templates/`

## For AI Agents
1. Before starting work, read `DEPLOYMENT.md` and `docs/TRD.md` to understand the architecture.
2. Read the Prisma schema before touching any data model.
3. Backend uses CommonJS modules, frontend uses ESM.
4. Socket.io events are emitted from `backend/src/lib/socket.ts`.
5. Frontend API client is at `frontend/src/lib/api.ts`.
6. Frontend Socket client is at `frontend/src/lib/socket.ts`.

## Conventions
- Backend: TypeScript with strict mode, CommonJS modules, Express middleware pattern
- Frontend: React 19 + TypeScript, Tailwind CSS v4, Vite bundler
- All env vars must be read from `process.env` (backend) or `import.meta.env` (frontend)
- Never hardcode URLs, secrets, or configuration values
- Transaction-safe operations use Prisma `$transaction` with raw SQL for atomic stock decrements

<!-- PRIMARY BRANCH CONFIG -->
<!-- Primary branch: main -->

<!-- GIT PROVIDER CONFIG -->
<!-- Git provider: github -->
