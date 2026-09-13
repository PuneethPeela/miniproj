<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io">
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<h1 align="center">🍽️ Smart Canteen</h1>

<p align="center">
  <strong>Ordering & Queue Management System</strong><br>
  A full-stack web application for managing canteen orders, kitchen workflows, and real-time queue tracking — built as a B.Tech Mini Project.
</p>

<p align="center">
  <a href="#-live-demo">🌐 Live Demo</a> &bull;
  <a href="#-features">✨ Features</a> &bull;
  <a href="#-quick-start">🚀 Quick Start</a> &bull;
  <a href="#-deployment-guide">📦 Deploy</a> &bull;
  <a href="#-license">📜 License</a>
</p>

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [smart-canteen.pages.dev](https://smart-canteen.pages.dev) |
| **Backend API** | [smart-canteen-api.koyeb.app](https://smart-canteen-api.koyeb.app) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, TypeScript 6, Tailwind CSS v4, Framer Motion |
| **Backend** | Express 5, TypeScript 5, Socket.io 4 |
| **Database** | PostgreSQL (Neon) + Prisma 5 ORM |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast) |
| **Deployment** | Cloudflare Pages (frontend), Koyeb (backend), Neon (database) |

---

## ✨ Features

### 🎓 Student
- Register & login with JWT authentication
- Browse menu with search and category filtering
- Add items to cart and place orders
- Track order status in real-time: `PENDING` → `CONFIRMED` → `PREPARING` → `READY` → `PICKED_UP`
- Pick up orders when ready
- Cancel pending orders
- View queue status and estimated wait time

### 👨‍🍳 Kitchen Staff
- View active orders with real-time updates
- Advance order status (`PENDING` → `CONFIRMED` → `PREPARING` → `READY`)
- Manage menu items (Add / Edit / Delete / Toggle availability)
- View queue analytics

### ⚡ Real-time
- Socket.io WebSocket events for live order updates
- Queue status broadcast to all connected clients
- Kitchen dashboard auto-updates on new orders

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    🌐 Cloudflare Pages                  │
│              React 19 + Vite + Tailwind CSS             │
│           [https://smart-canteen.pages.dev]             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    🚀 Koyeb (Backend)                   │
│            Express 5 + Socket.io + TypeScript           │
│         [https://smart-canteen-api.koyeb.app]          │
└──────────────────────┬──────────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   🐘 Neon PostgreSQL                    │
│                Managed Serverless Database              │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A PostgreSQL database (e.g., [Neon](https://neon.tech))

### 1. Clone & Install

```bash
git clone https://github.com/PuneethPeela/miniproj.git
cd miniproj

# Backend
cd backend
cp .env.example .env    # Set DATABASE_URL to your Neon connection string
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Setup Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |

---

## 📦 Deployment Guide

### 1. Set Up Neon Database
1. Create a free account at [neon.tech](https://neon.tech)
2. Create a project called `smart-canteen`
3. Copy the connection string

### 2. Deploy Backend to Koyeb
1. Create a free account at [koyeb.com](https://koyeb.com)
2. Create app → Select **Git** → Connect GitHub → Select repo
3. Configure:
   - **Name**: `smart-canteen-api`
   - **Instance**: Nano (free)
   - **Port**: `3000`
4. Set environment variables (see [Environment Variables](#-environment-variables))
5. Set build command: `cd backend && npm install && npx prisma generate && npm run build`
6. Set run command: `cd backend && node dist/index.js`

### 3. Deploy Frontend to Cloudflare Pages
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Create** → **Pages**
3. Connect GitHub → Select repo
4. Configure:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Output directory**: `frontend/dist`
   - **Node.js version**: `22`
5. Set `VITE_API_URL` to your backend URL + `/api`
6. Click **Save and Deploy**

### 4. Update CORS
Update `CLIENT_ORIGIN` in Koyeb to your actual Cloudflare Pages URL.

> 📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions including CLI deployment options.

---

## 🔐 Environment Variables

### Backend (Koyeb)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `https://smart-canteen.pages.dev` |
| `JWT_SECRET` | Secret key for JWT signing | `<random-secret-string>` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |

### Frontend (Cloudflare Pages)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://smart-canteen-api.koyeb.app/api` |

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/profile` | Protected | Get user profile |
| GET | `/api/menu` | Public | List menu items |
| GET | `/api/menu/:id` | Public | Get menu item by ID |
| POST | `/api/menu` | Kitchen Staff | Create menu item |
| PUT | `/api/menu/:id` | Kitchen Staff | Update menu item |
| DELETE | `/api/menu/:id` | Kitchen Staff | Delete menu item |
| POST | `/api/orders` | Authenticated | Place order |
| GET | `/api/orders` | Authenticated | User's order history |
| GET | `/api/orders/:id` | Authenticated | Get order detail |
| PUT | `/api/orders/:id/status` | Kitchen Staff | Update order status |
| GET | `/api/orders/active/all` | Kitchen Staff | All active orders |
| GET | `/api/queue` | Public | Queue status & wait time |

---

## 🗄️ Database Schema

| Model | Description |
|-------|-------------|
| **User** | Users with roles (`STUDENT`, `KITCHEN_STAFF`, `MANAGER`) |
| **MenuItem** | Menu items with price, category, availability, stock, and prep time |
| **Order** | Orders with auto-incrementing token numbers and status tracking |
| **OrderItem** | Line items linking orders to menu items with quantity |
| **QueueEntry** | Queue position tracking with stage (`WAITING` → `IN_KITCHEN` → `READY_FOR_PICKUP`) |
| **QueueStatus** | Global queue state with current token and estimated wait time |
| **StockRequest** | Inventory restock requests with approval workflow |

---

## 📁 Project Structure

```
miniproj/
├── backend/                    # Express + Socket.io API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API routes
│   │   ├── middleware/          # Auth, validation, errors
│   │   ├── lib/                # Prisma client, Socket helpers
│   │   └── types/              # TypeScript enums & interfaces
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Demo data seeder
│   └── package.json
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route pages
│   │   ├── contexts/           # Auth & Socket providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API client, Socket config
│   │   └── types/              # TypeScript types
│   └── package.json
├── docs/
│   ├── TRD.md                  # Technical Requirements Document
│   └── MRD.md                  # Market Requirements Document
├── DEPLOYMENT.md               # Deployment guide
└── README.md
```

---

## 🔑 Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `student@college.edu` | `password` | Student |
| `kitchen@college.edu` | `password` | Kitchen Staff |

> Accounts are created automatically by running `npm run prisma:seed`.

---

## 📚 Documentation

- [Technical Requirements Document](./docs/TRD.md)
- [Market Requirements Document](./docs/MRD.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

## 📜 License

This project is licensed under the **MIT License**.
