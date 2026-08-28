# Market Requirements Document (MRD)

**Smart Canteen Ordering and Queue Management System**
**Version:** 1.0 | **Date:** August 2026 | **Status:** Active Development

---

## 1. Executive Summary

The Smart Canteen Ordering and Queue Management System is a web-based platform designed to eliminate the inefficiencies of traditional college canteen operations. By enabling students to browse menus, place orders remotely, and track their queue position in real-time, the system reduces wait times, minimizes order errors, and improves the overall dining experience.

---

## 2. Market Problem

### 2.1 The Problem

College canteens across India face a persistent set of operational challenges:

| Problem | Impact |
|---|---|
| **Long physical queues** | 15–30 minute waits during peak hours (12:30–1:30 PM) |
| **No advance ordering** | Students must be physically present to place orders |
| **Order mix-ups** | Manual order tracking leads to wrong items delivered |
| **Menu uncertainty** | Students don't know what's available before arriving |
| **No queue visibility** | Students can't estimate wait time before joining |
| **Cash-only operations** | Limited payment options, no digital trail |
| **Kitchen inefficiency** | Staff don't know demand in advance, leading to over/under preparation |

### 2.2 Current Workflow Pain Points

```
Current (Manual) Flow:
1. Student walks to canteen (5–10 min)
2. Stands in queue (15–30 min)
3. Reaches counter, reads menu board (2–3 min)
4. Places order verbally — risk of miscommunication
5. Pays cash, gets no receipt
6. Waits不确定地 for order (10–20 min)
7. Receives order — may be wrong
8. Total time: 30–60 minutes for lunch
```

### 2.3 Market Size

- **Target Segment:** College canteens in India
- **Estimated canteens in India:** ~30,000+ (government + private colleges)
- **Average students per canteen:** 500–2,000
- **Total addressable users:** 15M+ college students
- **Immediate opportunity:** 500+ colleges in the target district

---

## 3. Target Users

### 3.1 Primary Users

#### Student
- **Profile:** 18–24 year old undergraduate/postgraduate student
- **Pain points:** Wasting lunch break time in queues, missing classes due to long wait
- **Goal:** Quick, convenient meal with minimal time investment
- **Tech comfort:** High — smartphone-native, comfortable with web apps
- **Current behavior:** Orders at canteen counter or skips canteen due to queues

#### Kitchen Staff
- **Profile:** Canteen employees managing food preparation and serving
- **Pain points:** Rush during peak hours, no visibility on demand, verbal order errors
- **Goal:** Organized order queue, clear demand forecast, fewer mistakes
- **Tech comfort:** Low to moderate — needs simple, clear interface
- **Current behavior:** Writing orders on paper, calling out order numbers

### 3.2 Secondary Users

#### Canteen Manager
- **Profile:** Oversees canteen operations
- **Pain points:** No sales data, no demand forecasting, complaints from students
- **Goal:** Operational efficiency, cost control, student satisfaction
- **Tech comfort:** Moderate
- **Current behavior:** Manual record-keeping, word-of-mouth feedback

---

## 4. Competitive Analysis

### 4.1 Competitive Landscape

| Solution | Description | Pros | Cons |
|---|---|---|---|
| **Manual ordering** | Students stand in queue and order at counter | No tech required, familiar | Slow, error-prone, no advance info |
| **Paper chit system** | Students write orders on paper slips | Some order tracking | Still requires physical presence, easy to lose |
| **WhatsApp ordering** | Informal canteen ordering via WhatsApp | No new app needed | Unstructured, hard to track, no queue mgmt |
| **Zomato/Swiggy (Food Courts)** | Commercial food ordering platforms | Polished UX, payment integration | High commission (15-30%), not designed for canteens |
| **Generic POS systems** | Restaurant point-of-sale software | Order management | Expensive, over-featured, not student-focused |

### 4.2 Our Differentiation

```
                    ┌─────────────────────────────────────┐
                    │     Smart Canteen System             │
                    │     ─────────────────────           │
                    │                                     │
                    │  ✓ Purpose-built for college        │
                    │    canteens                         │
                    │  ✓ Zero commission / free to use    │
                    │  ✓ Real-time queue tracking         │
                    │  ✓ No app download required (PWA)   │
                    │  ✓ Role-based (Student + Kitchen)   │
                    │  ✓ Minimal tech requirement         │
                    │  ✓ Open-source / customizable       │
                    └─────────────────────────────────────┘
```

### 4.3 Key Advantages Over Commercial Platforms

| Feature | Zomato/Swiggy | Smart Canteen |
|---|---|---|
| Commission per order | 15–30% | 0% |
| Requires app download | Yes | No (Web app) |
| Real-time queue | No | Yes |
| Campus-specific features | No | Yes (roll number, etc.) |
| Setup cost | High | Low (self-hosted) |
| Data ownership | Platform owns | College owns |

---

## 5. Value Proposition

### 5.1 For Students

> "Skip the queue, not the meal."

- **Order ahead:** Place order from anywhere on campus
- **Real-time tracking:** Know exactly when your food is ready
- **No waiting:** Pick up without standing in line
- **Transparent pricing:** See full menu with prices before ordering
- **Order history:** Reorder your favorites quickly

### 5.2 For Kitchen Staff

> "Prepared orders, not surprises."

- **Prep ahead:** See incoming orders before the rush
- **Organized queue:** No more verbal order confusion
- **Status management:** One-tap order status updates
- **Demand visibility:** Know what's popular today

### 5.3 For Canteen Management

> "Data-driven operations."

- **Sales analytics:** Track orders, revenue, popular items
- **Reduced waste:** Better demand forecasting
- **Student satisfaction:** Fewer complaints, shorter wait times
- **Digital records:** Automatic transaction history

---

## 6. Core Features

### 6.1 MVP Features (Version 1.0)

#### Student Features
| Feature | Priority | Description |
|---|---|---|
| User registration & login | P0 | Email + password registration with roll number |
| Browse menu | P0 | View available items with prices, categories, and prep time |
| Place order | P0 | Select items, add to cart, place order |
| Real-time queue tracking | P0 | See current position and estimated wait time |
| Order status updates | P0 | Live status: Pending → Confirmed → Preparing → Ready |
| Cancel order | P1 | Cancel order before preparation starts |
| Order history | P1 | View past orders and reorder |

#### Kitchen Staff Features
| Feature | Priority | Description |
|---|---|---|
| Kitchen dashboard | P0 | View all incoming orders in queue |
| Update order status | P0 | Move orders through: Confirmed → Preparing → Ready |
| Toggle menu availability | P0 | Mark items as available/unavailable |
| View queue stats | P1 | See current serving position, avg wait time |

### 6.2 Future Features (Version 2.0+)

| Feature | Priority | Target Version |
|---|---|---|
| UPI payment integration | P0 | v2.0 |
| Push notifications (PWA) | P1 | v2.0 |
| Canteen manager analytics dashboard | P1 | v2.0 |
| Menu item ratings and reviews | P2 | v2.1 |
| Multi-canteen support | P2 | v2.1 |
| Pre-order scheduling (book for later) | P2 | v2.2 |
| Dietary filters (veg/non-veg/allergens) | P1 | v2.0 |
| SMS/WhatsApp order notifications | P2 | v2.2 |
| Canteen inventory management | P3 | v3.0 |
| Admin panel for college administration | P3 | v3.0 |

---

## 7. User Personas

### 7.1 Persona: Priya (Student)

```
┌─────────────────────────────────────────────┐
│  PRIYA — CS Final Year Student              │
│  Age: 21 | Phone: iPhone 14                 │
├─────────────────────────────────────────────┤
│  Goals:                                     │
│  • Quick lunch between classes               │
│  • Avoid standing in 20-min queues          │
│  • Know what's available before walking     │
│                                             │
│  Frustrations:                              │
│  • Misses class because of canteen queue    │
│  • Arrives at canteen, food is sold out     │
│  • Doesn't know how long the wait will be   │
│                                             │
│  Tech Behavior:                             │
│  • Uses smartphone for everything           │
│  • Prefers web apps over app downloads      │
│  • Comfortable with digital payments        │
│                                             │
│  Quote: "I waste 30 mins of my 1-hour       │
│  lunch break just standing in line."        │
└─────────────────────────────────────────────┘
```

### 7.2 Persona: Ravi (Kitchen Staff)

```
┌─────────────────────────────────────────────┐
│  RAVI — Canteen Kitchen Staff               │
│  Age: 35 | Phone: Android (basic)           │
├─────────────────────────────────────────────┤
│  Goals:                                     │
│  • Manage orders without chaos              │
│  • Know what to prepare before rush hour    │
│  • Reduce order mix-ups                     │
│                                             │
│  Frustrations:                              │
│  • Students shout orders, hard to track     │
│  • Prepares wrong items due to confusion    │
│  • Can't predict demand for the day         │
│                                             │
│  Tech Behavior:                             │
│  • Comfortable with simple phone apps       │
│  • Needs large buttons, clear text          │
│  • Prefers minimal steps to complete tasks  │
│                                             │
│  Quote: "During lunch rush, it's like       │
│  managing 50 people talking at once."       │
└─────────────────────────────────────────────┘
```

### 7.3 Persona: Dr. Meena (Canteen Manager)

```
┌─────────────────────────────────────────────┐
│  Dr. MEENA — Canteen Manager                │
│  Age: 45 | Laptop user                      │
├─────────────────────────────────────────────┤
│  Goals:                                     │
│  • Reduce student complaints                │
│  • Track daily sales and costs              │
│  • Optimize staff scheduling                │
│                                             │
│  Frustrations:                              │
│  • No data on what sells and what doesn't   │
│  • Hard to justify budget without records   │
│  • Students always complaining about waits  │
│                                             │
│  Quote: "I have no idea which items are     │
│  profitable or which ones students want."   │
└─────────────────────────────────────────────┘
```

---

## 8. Success Metrics

### 8.1 Key Performance Indicators (KPIs)

| Metric | Baseline (Current) | Target (After Launch) | Measurement |
|---|---|---|---|
| Average queue wait time | 20–30 min | < 10 min | System timestamp logs |
| Order accuracy | ~85% (verbal) | > 98% (digital) | Order completion reports |
| Student lunch break time used | 45 min total | 25 min total | User surveys |
| Orders placed per day | ~200 (manual) | 300+ (digital) | Database records |
| Student satisfaction score | 3.2/5 (est.) | 4.2/5+ | In-app ratings |
| Kitchen staff error rate | ~15% | < 3% | Order discrepancy logs |

### 8.2 Adoption Metrics

| Metric | 1 Month | 3 Months | 6 Months |
|---|---|---|---|
| Registered students | 200 | 800 | 1,500 |
| Daily active users | 50 | 300 | 600 |
| Daily orders via system | 30 | 200 | 400 |
| Kitchen staff using dashboard | 3/3 | 3/3 | 3/3 |

### 8.3 Business Metrics (for college)

| Metric | Target |
|---|---|
| Canteen revenue increase | 15–20% (from reduced lost orders) |
| Food waste reduction | 10–15% (better demand forecasting) |
| Student complaints reduced | 60%+ reduction |

---

## 9. Rollout Plan

### 9.1 Phase 1: Campus Pilot (Weeks 1–4)

```
Week 1: Setup
├── Deploy backend (Koyeb) + database (Neon)
├── Deploy frontend (Cloudflare Pages)
├── Seed menu items
└── Train kitchen staff (3 persons)

Week 2: Soft Launch
├── Invite 50 students (beta testers)
├── Collect feedback daily
├── Fix critical bugs
└── Adjust UI based on feedback

Week 3: Expand
├── Open to 200 students
├── Monitor system performance
├── Gather kitchen staff feedback
└── Optimize order flow

Week 4: Full Campus Launch
├── Open registration to all students
├── Announce via college notice board + WhatsApp
├── Monitor for 1 week
└── Document lessons learned
```

### 9.2 Phase 2: Optimization (Months 2–3)

- Add payment integration (UPI)
- Implement push notifications
- Build analytics dashboard for canteen manager
- Performance optimization based on real usage data
- Mobile-responsive improvements

### 9.3 Phase 3: Expansion (Months 4–6)

- Multi-canteen support (if college has multiple)
- Pre-order scheduling feature
- Integration with college ERP system
- Open-source release for other colleges
- Documentation and deployment guides

---

## 10. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Low student adoption | Medium | High | Incentives (early bird discounts), peer champions |
| Kitchen staff resistance | Medium | Medium | Simple UI, hands-on training, gradual transition |
| Server downtime during lunch rush | Low | High | Koyeb auto-scaling, Neon connection pooling, monitoring |
| Network connectivity issues | Medium | Medium | Offline-capable PWA, graceful degradation |
| Menu items sell out quickly | High | Low | Real-time availability toggle, "sold out" badges |
| Data privacy concerns | Low | High | Transparent privacy policy, minimal data collection |

---

## 11. Assumptions

1. College students have reliable smartphone + WiFi access on campus
2. Kitchen staff are willing to use a simple web dashboard with training
3. The canteen operates during fixed hours (11:30 AM – 2:30 PM, 6:30 – 8:30 PM)
4. Orders are self-pickup (no delivery within campus needed initially)
5. Payment is cash-based initially; digital payments added in v2.0
6. Single canteen deployment for MVP

---

## 12. Dependencies

| Dependency | Type | Status | Risk |
|---|---|---|---|
| College WiFi infrastructure | Technical | Available | Low |
| Kitchen staff cooperation | Operational | Pending | Medium |
| Menu data from canteen | Data | Pending | Low |
| College administration approval | Regulatory | Pending | Medium |
| Domain/hosting budget | Financial | Self-funded | Low |

---

*Document prepared for B.Tech Mini Project — Smart Canteen Ordering and Queue Management System*
