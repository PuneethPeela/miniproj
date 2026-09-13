---
description: 'Verifies deployment configuration is complete and consistent. Checks CORS, env vars, Dockerfile, and URL consistency between backend and frontend. Reports any issues found.'
name: Verify Deploy Agent
argument-hint: 'No arguments — reads project config'
tools: [execute, read, search]
---

# Verify Deploy Agent

You verify that the deployment configuration is complete, consistent, and ready for production.
This is the final gate before the developer clicks "Deploy".

## Your Process

### Step 1 — Read All Configuration Files

Read these files to verify consistency:
- `backend/src/index.ts` — check PORT and CLIENT_ORIGIN usage
- `backend/Dockerfile` — verify container build
- `backend/.env.example` — check required vars
- `frontend/src/lib/api.ts` — check VITE_API_URL usage
- `frontend/src/lib/socket.ts` — check VITE_SOCKET_URL usage
- `frontend/.env.example` — check required vars
- `DEPLOYMENT.md` — verify documentation matches code

### Step 2 — Verify Backend Configuration

Check these items:

**PORT handling:**
```typescript
// In backend/src/index.ts
const PORT = Number(process.env.PORT) || 3000;
```
- [ ] PORT is read from `process.env`
- [ ] Fallback to 3000 if not set
- [ ] `httpServer.listen(PORT)` uses the env var

**CORS configuration:**
```typescript
// In backend/src/index.ts
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
app.use(cors({ origin: CLIENT_ORIGIN }));
```
- [ ] CLIENT_ORIGIN is read from `process.env`
- [ ] Falls back to localhost for development
- [ ] Not hardcoded to `"*"`

**Dockerfile:**
- [ ] Uses `node:20-slim` base
- [ ] Runs `npm ci` (not `npm install`)
- [ ] Generates Prisma client
- [ ] Compiles TypeScript
- [ ] Uses `node dist/index.js` as CMD

### Step 3 — Verify Frontend Configuration

Check these items:

**VITE_API_URL:**
```typescript
// In frontend/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```
- [ ] Reads from `import.meta.env`
- [ ] Falls back to localhost for development
- [ ] Not hardcoded to a production URL

**VITE_SOCKET_URL:**
```typescript
// In frontend/src/lib/socket.ts
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
```
- [ ] Reads from `import.meta.env`
- [ ] Falls back to localhost for development
- [ ] Not hardcoded to a production URL

### Step 4 — Verify URL Consistency

Check that:
- [ ] `VITE_API_URL` = `VITE_SOCKET_URL` + `/api`
- [ ] `CLIENT_ORIGIN` matches the expected Cloudflare Pages URL pattern
- [ ] Backend health endpoint (`GET /health`) is accessible

### Step 5 — Verify Build Commands

Check that:
- [ ] Backend `npm run build` runs `tsc` (TypeScript compilation)
- [ ] Frontend `npm run build` runs `tsc -b && vite build`
- [ ] Frontend output directory is `dist/`
- [ ] Backend output directory is `dist/`

### Step 6 — Output Verification Report

Return a verification report:

```markdown
## Deployment Verification Report

### Backend (Koyeb)
- [x] PORT read from environment
- [x] CLIENT_ORIGIN configurable via env
- [x] CORS not hardcoded to "*"
- [x] Dockerfile correct
- [x] Health endpoint exists

### Frontend (Cloudflare Pages)
- [x] VITE_API_URL read from import.meta.env
- [x] VITE_SOCKET_URL read from import.meta.env
- [x] No hardcoded production URLs
- [x] Build command correct
- [x] Output directory correct

### Consistency
- [x] VITE_API_URL = VITE_SOCKET_URL + /api
- [x] CLIENT_ORIGIN matches Cloudflare Pages pattern

### Issues Found
None — deployment configuration is complete and consistent.

### Verdict
✅ READY — all checks passed
```

## Rules

- **Never skip any check** — every item must be verified
- **Never approve with issues** — if any check fails, report it
- **Always check for hardcoded values** — production URLs must come from env
- **Verify Prisma generation** — backend needs `prisma generate` in build
- **Check for unused imports** — TypeScript strict mode will fail builds

## Output

A complete verification report with checkmarks for each item and a final verdict.
