# Deployment Guide

## Production URLs

| Service | URL | Platform |
|---------|-----|----------|
| **Frontend** | https://smart-canteen.peelapuneeth.workers.dev | Cloudflare Workers |
| **Backend API** | https://miniproj-m2b6.onrender.com/api | Render.com |
| **Database** | Neon PostgreSQL (smart-canteen project) | neon.tech |

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| student@college.edu | password | STUDENT |
| kitchen@college.edu | password | KITCHEN_STAFF |

---

## Prerequisites

1. **Neon PostgreSQL** — https://neon.tech (free tier available)
2. **Render.com** — https://render.com (free tier available)
3. **Cloudflare** — https://dash.cloudflare.com (free tier available)
4. **GitHub account** — https://github.com

---

## Step 1: Set Up Neon Database

1. Create a free account at https://neon.tech
2. Create a new project called `smart-canteen`
3. Copy the connection string:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
4. Keep this string safe — you'll need it for the backend.

---

## Step 2: Run Database Migrations Locally

```bash
cd backend

# Create your .env file
cp .env.example .env
# Edit .env and set DATABASE_URL to your Neon connection string

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migration (creates all tables)
npx prisma migrate dev --name init

# Seed database with demo data
npm run prisma:seed
```

Demo accounts created by seed:
| Email | Password | Role |
|-------|----------|------|
| student@college.edu | password | STUDENT |
| kitchen@college.edu | password | KITCHEN_STAFF |

---

## Step 3: Deploy Backend to Render.com

1. Create a free account at https://render.com
2. Click **New** → **Web Service**
3. Connect GitHub and select `PuneethPeela/miniproj`
4. Configure:
   - **Name**: `miniproj`
   - **Runtime**: Node
   - **Root Directory**: `backend`
   - **Branch**: main
   - **Region**: Oregon (US West)
   - **Instance**: Free ($0/month)
5. Set **Build Command**:
   ```
   npm install --include=dev && npx prisma generate && npm run build
   ```
6. Set **Start Command**:
   ```
   node dist/index.js
   ```
7. Add **Environment Variables**:
   ```
   PORT=3000
   DATABASE_URL=<your-neon-connection-string>
   CLIENT_ORIGIN=https://smart-canteen.peelapuneeth.workers.dev
   JWT_SECRET=smart-canteen-secret-2026
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```
8. Click **Create Web Service**

---

## Step 4: Deploy Frontend to Cloudflare

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Create `wrangler.jsonc` in project root:
   ```json
   {
     "name": "smart-canteen",
     "compatibility_date": "2026-09-11",
     "assets": {
       "directory": "./frontend/dist",
       "not_found_handling": "single-page-application"
     }
   }
   ```

3. Build and deploy:
   ```bash
   cd frontend
   VITE_API_URL=https://miniproj-m2b6.onrender.com/api \
   VITE_SOCKET_URL=https://miniproj-m2b6.onrender.com \
   npm run build
   cd ..
   wrangler deploy
   ```

---

## Environment Variables Reference

### Backend (Render.com)
| Variable | Description | Value |
|----------|-------------|-------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Neon PostgreSQL URL | `postgresql://...` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `https://smart-canteen.peelapuneeth.workers.dev` |
| `JWT_SECRET` | Secret for JWT signing | `smart-canteen-secret-2026` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |

### Frontend (Cloudflare)
| Variable | Description | Value |
|----------|-------------|-------|
| `VITE_API_URL` | Backend API base URL | `https://miniproj-m2b6.onrender.com/api` |
| `VITE_SOCKET_URL` | WebSocket server URL | `https://miniproj-m2b6.onrender.com` |

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env   # Set DATABASE_URL to your Neon string
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 | Backend: http://localhost:3000

---

## Features Included

### Student
- Register / Login with JWT authentication
- Browse menu with search and category filter
- Add items to cart and place orders
- Track order status in real-time (PENDING → CONFIRMED → PREPARING → READY → PICKED_UP)
- Pick up orders when ready
- Cancel pending orders
- View queue status and estimated wait time

### Kitchen Staff
- View active orders with real-time updates
- Advance order status (PENDING → CONFIRMED → PREPARING → READY)
- Manage menu items (Add / Edit / Delete / Toggle availability)
- View queue analytics

### Manager
- Full kitchen dashboard access
- Menu management capabilities

### Real-time
- Socket.io WebSocket events for live order updates
- Queue status broadcast to all connected clients
- Kitchen dashboard auto-updates on new orders

---

## Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/       # Auth, validation, errors
│   │   ├── lib/             # Prisma client, Socket helpers
│   │   └── types/           # TypeScript enums & interfaces
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Demo data seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── contexts/        # Auth & Socket providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client, Socket config
│   │   └── types/           # TypeScript types
│   └── package.json
├── docs/
│   ├── TRD.md               # Technical Requirements Document
│   └── MRD.md               # Market Requirements Document
├── wrangler.jsonc            # Cloudflare Workers config
└── DEPLOYMENT.md            # This file
```
