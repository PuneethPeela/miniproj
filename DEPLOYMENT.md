# Deployment Guide

## Prerequisites

1. **Neon PostgreSQL** — https://neon.tech (free tier available)
2. **Koyeb** — https://koyeb.com (free tier available)
3. **Cloudflare Pages** — https://pages.cloudflare.com (free tier available)
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

## Step 3: Deploy Backend to Koyeb

### Option A: Via Koyeb Dashboard (Recommended)

1. Create a free account at https://koyeb.com
2. Click **Create App**
3. Choose **Git** as the deployment method
4. Connect GitHub and select `PuneethPeela/miniproj`
5. Configure:
   - **Name**: `smart-canteen-api`
   - **Instance**: Nano (free)
   - **Port**: `3000`
6. Set **Environment Variables**:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
   CLIENT_ORIGIN=https://smart-canteen.pages.dev
   JWT_SECRET=<generate-a-random-secret-string>
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3000
   ```
7. Set **Build & Run Commands**:
   - Build: `cd backend && npm install && npx prisma generate && npm run build`
   - Run: `cd backend && node dist/index.js`
8. Click **Deploy**

### Option B: Via Koyeb CLI

```bash
# Install Koyeb CLI
curl -fsSL https://cli.koyeb.com/install.sh | sh
koyeb login

# Create app
koyeb apps create smart-canteen-api
koyeb services create smart-canteen-api \
  --app smart-canteen-api \
  --git https://github.com/PuneethPeela/miniproj.git \
  --git-branch main \
  --instance-type nano \
  --ports 3000:http \
  --env "DATABASE_URL=<your-neon-url>" \
  --env "CLIENT_ORIGIN=https://smart-canteen.pages.dev" \
  --env "JWT_SECRET=<random-secret>" \
  --env "JWT_EXPIRES_IN=7d" \
  --env "NODE_ENV=production" \
  --build-command "cd backend && npm install && npx prisma generate && npm run build" \
  --run-command "cd backend && node dist/index.js"
```

---

## Step 4: Deploy Frontend to Cloudflare Pages

### Option A: Via Cloudflare Dashboard (Recommended)

1. Log in to https://dash.cloudflare.com
2. Go to **Workers & Pages** → **Create** → **Pages**
3. Connect GitHub and select `PuneethPeela/miniproj`
4. Configure:
   - **Project name**: `smart-canteen`
   - **Production branch**: `main`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Node.js version**: `22`
5. Add **Environment Variables**:
   ```
   VITE_API_URL=https://smart-canteen-api.koyeb.app/api
   ```
6. Click **Save and Deploy**

### Option B: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler
wrangler login

# Build frontend
cd frontend
npm install
npm run build

# Deploy
wrangler pages deploy dist --project-name smart-canteen
```

---

## Step 5: Update CORS Origin

After frontend is deployed, update the backend's `CLIENT_ORIGIN` env var in Koyeb to your actual Cloudflare Pages URL:
```
CLIENT_ORIGIN=https://smart-canteen.pages.dev
```

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

### Real-time
- Socket.io WebSocket events for live order updates
- Queue status broadcast to all connected clients
- Kitchen dashboard auto-updates on new orders

---

## Environment Variables Reference

### Backend (Koyeb)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Neon PostgreSQL URL | `postgresql://...` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `https://smart-canteen.pages.dev` |
| `JWT_SECRET` | Secret for JWT signing | `<random-string>` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |

### Frontend (Cloudflare Pages)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://smart-canteen-api.koyeb.app/api` |

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
└── DEPLOYMENT.md            # This file
```
