# ISSUE-001: Production Deployment — Smart Canteen

## Phase 1: Requirements ✅ Complete

### What we're building
Deploy the Smart Canteen Ordering & Queue Management System to production with permanent live URLs:
- Backend on Koyeb (WebSocket-capable, persistent process)
- Frontend on Cloudflare Pages (static SPA)

### Acceptance Criteria
1. Backend accessible at a permanent Koyeb URL (e.g., `https://smart-canteen-api-xxxx.koyeb.app`)
2. Frontend accessible at a permanent Cloudflare Pages URL (e.g., `https://smart-canteen.pages.dev`)
3. Frontend can communicate with backend via REST API and Socket.io
4. CORS configured to allow the Cloudflare Pages origin
5. All environment variables documented and configurable
6. Placing an order on the frontend writes to the real Neon database
7. Socket.io updates push back to connected clients in real time

### Out of Scope
- Custom domain configuration
- CI/CD pipeline setup
- Monitoring/alerting setup
- Load testing

### Constraints
- Backend must be on Koyeb (NOT serverless/Vercel) for WebSocket support
- Frontend must be on Cloudflare Pages
- Database is already on Neon (existing project, already migrated + seeded)
- Must use Dockerfile for Koyeb deployment

---

## Phase 2: Research ✅ Complete

### Files to modify
- `backend/Dockerfile` — already created, needs verification
- `backend/.dockerignore` — already created
- `frontend/src/components/Layout.tsx` — unused imports fixed

### Existing patterns to follow
- Backend: Express + Socket.io on single HTTP server (`backend/src/index.ts`)
- Frontend: Vite + React + Tailwind CSS v4 (`frontend/vite.config.ts`)
- Env vars: `process.env` (backend), `import.meta.env` (frontend)

### Verified configurations
- `PORT` read from `process.env.PORT` with fallback `3000` ✅
- `CLIENT_ORIGIN` read from `process.env.CLIENT_ORIGIN` ✅
- `VITE_API_URL` read from `import.meta.env.VITE_API_URL` ✅
- `VITE_SOCKET_URL` read from `import.meta.env.VITE_SOCKET_URL` ✅
- CORS uses `CLIENT_ORIGIN`, not `"*"` ✅
- Dockerfile uses multi-stage build with `node:20-slim` ✅

### Risks identified
- Neon database may take a few seconds to wake from scale-to-zero on first connection
- Koyeb free tier (Nano) may have cold start delays
- Socket.io requires persistent process — cannot use serverless

---

## Phase 3: Plan ✅ Complete

### Task 1: Backend Deployment (Koyeb)
**Agent**: Backend Deploy Agent
**Action**: Create Koyeb app configuration
**Output**: Build command, run command, port, env vars

### Task 2: Frontend Deployment (Cloudflare Pages)
**Agent**: Frontend Deploy Agent
**Action**: Create Cloudflare Pages configuration
**Output**: Build command, output directory, env vars

### Task 3: Configuration Verification
**Agent**: Verify Deploy Agent
**Action**: Verify all config is consistent and complete
**Output**: Verification report with checkmarks

### Task 4: Integration Report
**Agent**: Deployment Orchestrator (head)
**Action**: Combine all agent outputs into deployment checklist
**Output**: Step-by-step deployment guide with exact commands

---

## Phase 4: Execution
[To be filled after agent execution]

## Phase 5: Verification
[To be filled after deployment verification]
