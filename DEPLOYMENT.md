# Deployment Guide

## Prerequisites

1. **Neon PostgreSQL** - https://neon.tech (free tier available)
2. **Koyeb** - https://koyeb.com (free tier available)
3. **Cloudflare Pages** - https://pages.cloudflare.com (free tier available)
4. **GitHub account** - https://github.com

---

## Step 1: Set Up Neon Database

1. Create a free account at https://neon.tech
2. Create a new project called `smart-canteen`
3. Copy the connection string (it looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`)
4. Go to the SQL Editor in Neon dashboard
5. Run the Prisma migrations (see Step 3 below)

---

## Step 2: Deploy Backend to Koyeb

### Option A: Via Koyeb Dashboard

1. Create a free account at https://koyeb.com
2. Click **Create App**
3. Choose **Git** as the deployment method
4. Connect your GitHub account and select the `miniproj` repo
5. Configure:
   - **Name**: `smart-canteen-api`
   - **Builder**: Dockerfile (or Webpack/Node.js)
   - **Instance**: `Nano` (free tier)
   - **Port**: `3000`
6. Add **Environment Variables**:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
   CLIENT_ORIGIN=https://smart-canteen.pages.dev
   JWT_SECRET=<generate-a-random-secret>
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```
7. Click **Deploy**

### Option B: Via Koyeb CLI

```bash
# Install Koyeb CLI
curl -fsSL https://cli.koyeb.com/install.sh | sh

# Login
koyeb login

# Create and deploy
koyeb apps create smart-canteen-api
koyeb services create smart-canteen-api \
  --app smart-canteen-api \
  --git https://github.com/PuneethPeela/miniproj.git \
  --git-branch main \
  --instance-type nano \
  --ports 3000:http \
  --env DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require" \
  --env CLIENT_ORIGIN="https://smart-canteen.pages.dev" \
  --env JWT_SECRET="<random-secret>" \
  --env JWT_EXPIRES_IN="7d" \
  --env NODE_ENV="production" \
  --build-command "cd backend && npm install && npx prisma generate && npm run build" \
  --run-command "cd backend && npm start"
```

---

## Step 3: Run Database Migrations

After Neon is set up and backend is deployed:

```bash
# Set DATABASE_URL locally
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"

# Run migrations
cd backend
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed
```

Or use the Neon SQL Editor to run the SQL from the generated migration files.

---

## Step 4: Deploy Frontend to Cloudflare Pages

### Option A: Via Cloudflare Dashboard

1. Log in to https://dash.cloudflare.com
2. Go to **Workers & Pages** → **Create** → **Pages**
3. Connect your GitHub account and select the `miniproj` repo
4. Configure:
   - **Project name**: `smart-canteen`
   - **Production branch**: `main`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Node.js version**: `20`
5. Add **Environment Variables**:
   ```
   VITE_API_URL=https://smart-canteen-api.koyeb.app/api
   VITE_SOCKET_URL=https://smart-canteen-api.koyeb.app
   ```
6. Click **Save and Deploy**

### Option B: Via Wrangler CLI

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build frontend
cd frontend
npm install
npm run build

# Deploy
wrangler pages deploy dist --project-name smart-canteen
```

---

## Step 5: Update CORS

After deploying, update the backend's `CLIENT_ORIGIN` environment variable in Koyeb to match your Cloudflare Pages URL:
```
CLIENT_ORIGIN=https://smart-canteen.pages.dev
```

---

## Local Development

```bash
# Terminal 1 - Backend
cd backend
cp .env.example .env  # Edit with your DATABASE_URL
npx prisma migrate dev
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

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
| `VITE_SOCKET_URL` | Backend Socket.io URL | `https://smart-canteen-api.koyeb.app` |
