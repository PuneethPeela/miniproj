# Technical Requirements Document (TRD)

**Smart Canteen Ordering and Queue Management System**
**Version:** 1.0 | **Date:** August 2026 | **Status:** Active Development

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Student App    │  │  Kitchen Staff Dashboard    │  │
│  │  (React + Vite) │  │  (React + Vite)             │  │
│  └────────┬────────┘  └──────────────┬──────────────┘  │
│           │                          │                  │
│           └──────────┬───────────────┘                  │
│                      │                                  │
└──────────────────────┼──────────────────────────────────┘
                       │  HTTPS / WSS
┌──────────────────────┼──────────────────────────────────┐
│                 SERVER LAYER                            │
│  ┌───────────────────┴───────────────────────────────┐  │
│  │              Express 5 API Server                 │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │  │
│  │  │  Auth   │  │  Routes  │  │  Socket.io     │  │  │
│  │  │  Middleware │ │ (REST)  │  │  (WebSocket)   │  │  │
│  │  └─────────┘  └──────────┘  └────────────────┘  │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                  │
└──────────────────────┼──────────────────────────────────┘
                       │  Prisma ORM / Connection Pool
┌──────────────────────┼──────────────────────────────────┐
│                DATA LAYER                               │
│  ┌───────────────────┴───────────────────────────────┐  │
│  │          PostgreSQL (Neon Serverless)             │  │
│  │  ┌──────┐ ┌────────┐ ┌───────┐ ┌────────────┐   │  │
│  │  │ User │ │MenuItem│ │ Order │ │QueueStatus │   │  │
│  │  └──────┘ └────────┘ └───────┘ └────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Pattern

The system follows a **three-tier client-server architecture** with:

- **Presentation Tier:** React SPA served via Cloudflare Pages
- **Application Tier:** Node.js/Express REST API + WebSocket server on Koyeb
- **Data Tier:** PostgreSQL database on Neon (serverless)

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI component library |
| Vite | 8.x | Build tool and dev server |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| React Router | 7.x | Client-side routing |
| Socket.io Client | 4.x | WebSocket communication |
| Axios | 1.x | HTTP client |
| Zustand | 5.x | Lightweight state management |
| React Hot Toast | 2.x | Toast notifications |

### 2.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22.x LTS | Runtime environment |
| Express | 5.x | HTTP framework |
| Prisma | 6.x | Database ORM and migrations |
| Socket.io | 4.x | Real-time WebSocket server |
| JWT (jsonwebtoken) | 9.x | Authentication tokens |
| bcryptjs | 2.x | Password hashing |
| Zod | 3.x | Request validation |
| CORS | 2.x | Cross-origin resource sharing |
| dotenv | 16.x | Environment variable management |

### 2.3 Database

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 17.x | Relational database |
| Neon | Serverless | Managed PostgreSQL hosting |

### 2.4 DevOps & Deployment

| Technology | Purpose |
|---|---|
| Koyeb | Backend API + WebSocket hosting |
| Cloudflare Pages | Frontend static hosting |
| GitHub | Source control and CI/CD |
| npm | Package management |

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│     User     │       │   MenuItem   │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │
│ email (UQ)   │       │ description  │
│ passwordHash │       │ price        │
│ role         │       │ category     │
│ rollNumber   │       │ imageUrl     │
│ phone        │       │ isAvailable  │
│ createdAt    │       │ prepTime     │
│ updatedAt    │       │ createdAt    │
└──────┬───────┘       └──────┬───────┘
       │                      │
       │ 1:N                  │ 1:N
       │                      │
┌──────┴──────────────────────┴───────┐
│               Order                  │
├──────────────────────────────────────┤
│ id (PK)                              │
│ userId (FK → User)                   │
│ status (PENDING → PREPARING →        │
│         READY → COMPLETED / CANCELLED)│
│ totalAmount                          │
│ queuePosition                        │
│ estimatedWait                       │
│ notes                                │
│ createdAt                            │
│ updatedAt                            │
└──────┬───────────────────────────────┘
       │ 1:N
       │
┌──────┴───────────────┐
│      OrderItem       │
├──────────────────────┤
│ id (PK)              │
│ orderId (FK → Order) │
│ menuItemId (FK → MenuItem) │
│ quantity             │
│ unitPrice            │
│ subtotal             │
└──────────────────────┘
```

### 3.2 Prisma Schema Definition

```prisma
enum UserRole {
  STUDENT
  KITCHEN_STAFF
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

enum MenuCategory {
  MAIN_COURSE
  SNACKS
  BEVERAGES
  DESSERTS
  COMBO
}

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(STUDENT)
  rollNumber   String?  @unique
  phone        String?
  orders       Order[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model MenuItem {
  id          String       @id @default(uuid())
  name        String
  description String?
  price       Float
  category    MenuCategory
  imageUrl    String?
  isAvailable Boolean      @default(true)
  prepTime    Int          // estimated prep time in minutes
  orderItems  OrderItem[]
  createdAt   DateTime     @default(now())
}

model Order {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  status          OrderStatus @default(PENDING)
  totalAmount     Float
  queuePosition   Int?
  estimatedWait   Int?        // estimated wait in minutes
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id         String   @id @default(uuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id])
  menuItemId String
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])
  quantity   Int
  unitPrice  Float
  subtotal   Float
}

model QueueStatus {
  id            String   @id @default(uuid())
  currentServing Int     // current queue number being served
  totalWaiting   Int     // total students waiting
  avgWaitTime    Int     // average wait in minutes
  lastUpdated    DateTime @default(now())
}
```

---

## 4. API Endpoints Specification

### 4.1 Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### 4.2 Menu

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/menu` | List all menu items (with filters) | Yes |
| GET | `/api/menu/:id` | Get single menu item | Yes |
| POST | `/api/menu` | Create menu item | Yes (KITCHEN_STAFF) |
| PUT | `/api/menu/:id` | Update menu item | Yes (KITCHEN_STAFF) |
| PATCH | `/api/menu/:id/availability` | Toggle availability | Yes (KITCHEN_STAFF) |
| DELETE | `/api/menu/:id` | Delete menu item | Yes (KITCHEN_STAFF) |

### 4.3 Orders

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/orders` | Place new order | Yes (STUDENT) |
| GET | `/api/orders` | List orders (filtered by role) | Yes |
| GET | `/api/orders/:id` | Get order details | Yes |
| PATCH | `/api/orders/:id/status` | Update order status | Yes (KITCHEN_STAFF) |
| PATCH | `/api/orders/:id/cancel` | Cancel order | Yes (STUDENT) |
| GET | `/api/orders/my` | Get current user's orders | Yes (STUDENT) |

### 4.4 Queue

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/queue/status` | Get current queue status | Yes |
| GET | `/api/queue/position/:orderId` | Get specific order position | Yes |

### 4.5 Request/Response Examples

#### POST `/api/auth/register`

```json
// Request
{
  "name": "Puneeth",
  "email": "puneeth@college.edu",
  "password": "securePass123",
  "role": "STUDENT",
  "rollNumber": "CS21B001",
  "phone": "9876543210"
}

// Response (201)
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Puneeth",
      "email": "puneeth@college.edu",
      "role": "STUDENT"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/orders`

```json
// Request
{
  "items": [
    { "menuItemId": "uuid", "quantity": 2 },
    { "menuItemId": "uuid", "quantity": 1 }
  ],
  "notes": "Extra spicy"
}

// Response (201)
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "status": "PENDING",
      "totalAmount": 145,
      "queuePosition": 12,
      "estimatedWait": 25,
      "items": [...]
    }
  }
}
```

---

## 5. WebSocket Event Specification

### 5.1 Connection

```
Server: ws://api.example.com (Koyeb)
Client connects with JWT in handshake auth
```

### 5.2 Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join-kitchen` | Client → Server | `{}` | Kitchen staff joins kitchen room |
| `join-order` | Client → Server | `{ orderId }` | Student joins their order room |
| `order-placed` | Server → Client | `{ order }` | Broadcast: new order placed |
| `order-status-updated` | Server → Client | `{ orderId, status, queuePosition }` | Order status changed |
| `queue-updated` | Server → Client | `{ currentServing, totalWaiting, avgWaitTime }` | Queue changed |
| `order-ready` | Server → Client | `{ orderId, studentId }` | Order ready for pickup |
| `menu-updated` | Server → Client | `{ menuItem }` | Menu item changed |
| `kitchen-broadcast` | Server → Client | `{ message, type }` | Kitchen announcement |

### 5.3 Socket.io Room Structure

```
Root Namespace /
├── Kitchen Room (kitchen-staff)
│   └── All kitchen staff members
├── Order Rooms (order:{orderId})
│   └── Student who placed the order
└── Queue Room (queue)
    └── All connected students
```

---

## 6. Security Considerations

### 6.1 Authentication & Authorization

- **JWT tokens** with 24-hour expiry, stored in HTTP-only cookies
- **bcryptjs** with salt rounds of 12 for password hashing
- Role-based middleware: `authenticateToken`, `requireRole('KITCHEN_STAFF')`
- Token refresh mechanism for session persistence

### 6.2 Input Validation

- **Zod schemas** for all API request bodies
- Server-side validation before database operations
- Sanitization of user inputs to prevent XSS
- Parameterized queries via Prisma to prevent SQL injection

### 6.3 CORS Configuration

```javascript
// Allowed origins
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,       // Cloudflare Pages domain
  'http://localhost:5173'         // Local dev
];

// Strict CORS policy
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 6.4 Rate Limiting

- API rate limit: 100 requests per 15-minute window per IP
- Auth endpoints: 10 requests per 15-minute window per IP
- WebSocket connection limit: 5 concurrent per user

### 6.5 Environment Variables

All secrets managed via Koyeb environment variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — Secret key for JWT signing
- `JWT_EXPIRES_IN` — Token expiry duration
- `PORT` — Server port
- `FRONTEND_URL` — Allowed CORS origin
- `NODE_ENV` — Environment mode

---

## 7. Deployment Architecture

### 7.1 Neon PostgreSQL

```
Provider: Neon (Serverless PostgreSQL)
├── Database: smart_canteen
├── Connection: Pooled via Prisma (PgBouncer)
├── Auto-scaling: 0.5 GB RAM, compute on demand
├── Branching: Main branch for production
└── Backups: Daily automatic backups
```

### 7.2 Koyeb (Backend)

```
Provider: Koyeb
├── Runtime: Node.js 22.x
├── Build: npm ci && npx prisma generate
├── Start: node server.js
├── Port: 3000 (env: PORT)
├── Environment: Production
├── Auto-deploy: On push to main branch
└── Health check: GET /api/health
```

### 7.3 Cloudflare Pages (Frontend)

```
Provider: Cloudflare Pages
├── Build: npm run build
├── Output: dist/
├── Framework: Vite (auto-detected)
├── Environment variables:
│   └── VITE_API_URL = https://api.koyeb.app
├── Auto-deploy: On push to main branch
└── Custom domain: Optional
```

### 7.4 CI/CD Flow

```
Git Push → GitHub Actions
    ├── Backend (main branch)
    │   ├── Run lint + tests
    │   ├── Build
    │   └── Koyeb auto-deploys
    └── Frontend (main branch)
        ├── Run lint + tests
        ├── Build
        └── Cloudflare Pages auto-deploys
```

---

## 8. Performance Requirements

### 8.1 Response Time Targets

| Operation | Target | Max |
|---|---|---|
| API response (list/read) | < 200ms | 500ms |
| API response (create/update) | < 300ms | 700ms |
| WebSocket event delivery | < 50ms | 150ms |
| Page load (initial) | < 2s | 3s |
| Page load (cached) | < 500ms | 1s |

### 8.2 Scalability Targets

| Metric | Target |
|---|---|
| Concurrent users | 500+ |
| Orders per minute | 100+ |
| WebSocket connections | 200+ simultaneous |
| Database queries/second | 200+ |

### 8.3 Optimization Strategies

- **Frontend:** Code splitting via React.lazy, image lazy loading, Tailwind purge
- **Backend:** Prisma connection pooling, response caching for menu data
- **Database:** Indexes on frequently queried columns (userId, status, createdAt)
- **WebSocket:** Room-based broadcasting, heartbeat mechanism

---

## 9. Testing Strategy

### 9.1 Unit Testing

| Tool | Scope |
|---|---|
| Vitest | Frontend components, hooks, utilities |
| Jest | Backend services, middleware, validators |

### 9.2 Integration Testing

| Tool | Scope |
|---|---|
| Supertest | API endpoint testing |
| Prisma Seed | Database state setup |

### 9.3 End-to-End Testing

| Tool | Scope |
|---|---|
| Playwright | Full user flows across browser |

### 9.4 Test Coverage Targets

| Area | Minimum Coverage |
|---|---|
| Auth flows | 90% |
| Order placement | 85% |
| Queue management | 85% |
| Menu CRUD | 80% |
| WebSocket events | 75% |

### 9.5 Testing Pyramid

```
          ╱╲
         ╱  ╲         E2E (Playwright)
        ╱ 5% ╲
       ╱──────╲
      ╱        ╲      Integration (Supertest)
     ╱   25%    ╲
    ╱────────────╲
   ╱              ╲   Unit (Vitest/Jest)
  ╱      70%       ╲
 ╱──────────────────╲
```

---

## 10. Environment Configuration

### 10.1 Frontend (.env)

```bash
VITE_API_URL=https://smart-canteen-api.koyeb.app
VITE_WS_URL=wss://smart-canteen-api.koyeb.app
```

### 10.2 Backend (.env)

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/smart_canteen?sslmode=require
JWT_SECRET=your-secure-random-string
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://smart-canteen.pages.dev
```

---

*Document prepared for B.Tech Mini Project — Smart Canteen Ordering and Queue Management System*
