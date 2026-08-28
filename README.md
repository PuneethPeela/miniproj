# Smart Canteen Ordering and Queue Management System

A full-stack web application for B.Tech mini project that enables students to browse menus, place orders, and track queue status in real-time, while kitchen staff can manage orders and view analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, TypeScript 6, Tailwind CSS v4 |
| Backend | Express 5, TypeScript 5, Socket.io 4 |
| Database | PostgreSQL (Neon) + Prisma 5 ORM |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Deployment | Cloudflare Pages (frontend), Koyeb (backend), Neon (database) |

## Features

- **Real-time Queue Tracking** — Live updates via WebSockets (Socket.io)
- **Role-based Access** — Student and Kitchen Staff profiles
- **Menu Management** — Browse, search, and filter menu items
- **Order Placement** — Cart-based ordering with token generation
- **Kitchen Dashboard** — Staff can update order statuses in real-time
- **Mobile-first UI** — Responsive design with bottom navigation

## Project Structure

```
/
├── backend/                 # Express + Socket.io API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/       # Auth, validation, errors
│   │   ├── lib/             # Prisma client, Socket helpers
│   │   └── types/           # TypeScript interfaces
│   ├── prisma/              # Database schema & seeds
│   └── package.json
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── contexts/        # Auth & Socket providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client, Socket config
│   │   └── types/           # TypeScript types
│   └── package.json
├── docs/                    # TRD & MRD documents
│   ├── TRD.md
│   └── MRD.md
└── DEPLOYMENT.md            # Deployment guide
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/profile` | Protected | Get user profile |
| GET | `/api/menu` | Public | List menu items |
| GET | `/api/menu/:id` | Public | Get menu item |
| POST | `/api/menu` | Kitchen Staff | Create menu item |
| PUT | `/api/menu/:id` | Kitchen Staff | Update menu item |
| DELETE | `/api/menu/:id` | Kitchen Staff | Delete menu item |
| POST | `/api/orders` | Authenticated | Place order |
| GET | `/api/orders` | Authenticated | User's orders |
| GET | `/api/orders/:id` | Authenticated | Get order detail |
| PUT | `/api/orders/:id/status` | Kitchen Staff | Update order status |
| GET | `/api/orders/active/all` | Kitchen Staff | All active orders |
| GET | `/api/queue` | Public | Queue status |

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env  # Edit with your DATABASE_URL
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 | Backend: http://localhost:3000

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Neon, Koyeb, and Cloudflare Pages.

## Documentation

- [Technical Requirements Document](./docs/TRD.md)
- [Market Requirements Document](./docs/MRD.md)
- [Deployment Guide](./DEPLOYMENT.md)
