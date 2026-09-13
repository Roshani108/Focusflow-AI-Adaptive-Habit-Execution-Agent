# FocusFlow AI ⚡
### Autonomous Goal-Decomposition & Productivity Execution Platform

[![Frontend CI](https://github.com/your-username/focusflow-ai/actions/workflows/frontend.yml/badge.svg)](https://github.com/your-username/focusflow-ai/actions/workflows/frontend.yml)
[![Backend CI](https://github.com/your-username/focusflow-ai/actions/workflows/backend.yml/badge.svg)](https://github.com/your-username/focusflow-ai/actions/workflows/backend.yml)
[![Docker Validation](https://github.com/your-username/focusflow-ai/actions/workflows/docker.yml/badge.svg)](https://github.com/your-username/focusflow-ai/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)

FocusFlow AI is a production-style, cross-platform productivity and autonomous goal-execution platform engineered to demonstrate advanced full-stack competencies for a **Frontend / React + Python Full Stack Engineer** role.

A user enters an ambitious goal (e.g. *"Prepare for Senior Full Stack Engineer Interview in 6 weeks"*), and FocusFlow AI's multi-stage agent pipeline analyzes feasibility, breaks it down into sequential milestones, assigns realistic time estimates and priorities, calendar-schedules daily tasks based on available capacity, tracks verified completion velocity, and **autonomously replans remaining work when tasks are missed or overdue without violating the final deadline**.

---

## 🚀 Live Demo Credentials

For local evaluation or interview presentation, the database comes pre-seeded with rich, realistic data:

| Field | Demo Credential |
|---|---|
| **Email** | `demo@focusflow.dev` |
| **Password** | `DemoPassword123!` |
| **Active Goals** | 2 Full Roadmaps (Interview Prep & Full Stack SaaS) |
| **Tasks Seeded** | 24 Tasks (Completed, Scheduled Today, and Overdue for replanning) |

---

## 🏛️ System Architecture

```text
                         ┌────────────────────────────────────────┐
                         │               Clients                  │
                         │   React Web (TS)   React Native Mobile │
                         └───────────────────┬────────────────────┘
                                             │
                                             │ REST API (JSON / Bearer JWT)
                                             ▼
                         ┌────────────────────────────────────────┐
                         │       FastAPI Main Application         │
                         │   Routers  • Services  • Repositories  │
                         └───────────────────┬────────────────────┘
                                             │
                   ┌─────────────────────────┼─────────────────────────┐
                   │                         │                         │
                   ▼                         ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
          │   PostgreSQL    │       │   Redis Cache   │       │ AI Agent Engine │
          │ Relational Data │       │ TTL & RateLimit │       │ Pipeline & Repl │
          └─────────────────┘       └────────┬────────┘       └─────────────────┘
                                             │
                                             │ Message / Trigger Queue
                                             ▼
                                    ┌─────────────────┐
                                    │ Node.js Worker  │
                                    │ Reminder Daemon │
                                    └─────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Web Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5, React Router v6, Recharts, Lucide React, Zod |
| **Mobile App** | React Native, Expo SDK 51, TypeScript, React Navigation (Native Stack + Bottom Tabs) |
| **Main Backend** | Python 3.13, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, pyjwt, bcrypt |
| **Background Service** | Node.js 20, Express, TypeScript, ioredis |
| **Data & Cache** | PostgreSQL 16, Redis 7 (with zero-config SQLite & in-memory fallbacks) |
| **DevOps & Infra** | Docker, Docker Compose, Nginx, GitHub Actions CI/CD workflows |
| **Testing** | pytest, pytest-asyncio, Postman Collection |

---

## 📂 Monorepo Project Structure

```text
focusflow-ai/
├── apps/
│   ├── web/                     # React 18 + Vite + TypeScript + Tailwind CSS
│   │   ├── src/
│   │   │   ├── api/             # Axios client with auto-refresh interceptor
│   │   │   ├── components/      # Reusable UI component library
│   │   │   ├── context/         # AuthContext & state providers
│   │   │   ├── pages/           # Dashboard, Goals, AI Wizard, Tasks, Analytics, etc.
│   │   │   └── types/           # Strict TypeScript contracts
│   │   └── Dockerfile
│   │
│   └── mobile/                  # React Native + Expo mobile application
│       ├── src/
│       │   ├── api/             # Platform-aware mobile API client
│       │   ├── components/      # Native UI cards, headers, badges
│       │   ├── navigation/      # Stack & Bottom Tab navigators
│       │   └── screens/         # 14 complete native screens
│       └── App.tsx
│
├── services/
│   ├── api/                     # Python FastAPI main backend service
│   │   ├── app/
│   │   │   ├── agents/          # 5-stage AI pipeline & Smart Replanner
│   │   │   ├── models/          # 11 normalized SQLAlchemy models
│   │   │   ├── repositories/    # Repository pattern queries
│   │   │   ├── routers/         # REST API endpoints
│   │   │   ├── schemas/         # Pydantic v2 validation schemas
│   │   │   └── services/        # Core business logic & Redis cache
│   │   ├── alembic/             # Database migration versions
│   │   ├── tests/               # Pytest automated test suite
│   │   ├── seed.py              # Development seeder script
│   │   └── requirements.txt
│   │
│   └── notification-service/    # Node.js background reminder daemon
│       ├── src/
│       │   ├── scheduler.ts     # Cron-style recurring timers
│       │   ├── workers/         # Reminder scan & overdue task workers
│       │   └── index.ts         # Express server & trigger endpoints
│       └── package.json
│
├── infrastructure/
│   ├── docker/                  # PostgreSQL initialization scripts
│   └── nginx/                   # Reverse proxy configuration
│
├── docs/                        # Deep-dive engineering guides
│   ├── architecture.md          # System architecture & component roles
│   ├── api.md                   # Complete REST API specifications
│   ├── database.md              # 11-table relational schema & indexes
│   ├── ai-agent.md              # AI agent pipeline & replanning logic
│   ├── deployment.md            # Linux & Ubuntu deployment guide
│   └── performance.md           # Before/after optimization benchmarks
│
├── tests/
│   └── FocusFlow_AI.postman_collection.json
├── .github/workflows/           # Automated CI/CD pipelines
├── docker-compose.yml           # Multi-service container orchestration
├── SECURITY.md                  # Security policies and threat model
└── README.md
```

---

## ⚡ Quick Start & Installation

### Option 1: One-Command Docker Compose (Recommended)

Run all 5 services (Postgres, Redis, API, Notification Worker, Web) with a single command:

```bash
docker compose up -d --build
```
- Web Application: `http://localhost:3000`
- FastAPI Swagger Docs: `http://localhost:8000/docs`
- Node.js Notification Worker: `http://localhost:4000/health`

To populate the database with demo goals and tasks:
```bash
docker compose exec api python seed.py
```

---

### Option 2: Local Development (Zero-Config)

FocusFlow AI is designed with an automatic SQLite and in-memory cache fallback, allowing you to run and test immediately without Docker running.

#### 1. Start the FastAPI Backend
```bash
cd services/api
pip install -r requirements.txt pytest-asyncio email-validator
python seed.py          # Populates demo user and roadmaps
uvicorn app.main:app --reload --port 8000
```

#### 2. Start the React Web Frontend
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

#### 3. Start the Node.js Background Service
```bash
cd services/notification-service
npm install
npm run build
npm start
```

#### 4. Start the React Native Mobile App
```bash
cd apps/mobile
npm install
npx expo start
```

---

## 🧪 Testing Suite

### 1. Backend Pytest Suite
Run the 15-test automated backend test suite:
```bash
cd services/api
python -m pytest -v
```
Tests cover:
- User registration, duplicate email rejection, login, token refresh, and logout
- Goal creation, AI plan generation, schema validation, and plan approval
- Task status transitions, completion timestamp tracking, and batch updates
- AI Goal Analyzer missing input verification and Priority Engine bounds
- Smart Replanner capacity-aware task redistribution algorithms

### 2. Postman Collection
Import `tests/FocusFlow_AI.postman_collection.json` into Postman to run integrated API tests.

---

## 🧠 AI Agent Pipeline & Smart Replanning

### 5-Stage Agent Decomposition
1. **Goal Analyzer**: Checks for missing fields (deadline, capacity) and estimates feasibility.
2. **Task Decomposer**: Breaks goals into structured sequential milestones.
3. **Priority Engine**: Normalizes priorities (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and clamps durations to realistic focus blocks (15-180 mins).
4. **Schedule Generator**: Calendars tasks across allowed study days without exceeding user's configured `daily_capacity_hours`.
5. **Plan Validator**: Validates JSON structure using Pydantic `StructuredPlan` schemas.

### Smart Replanning in Action
When tasks become overdue, FocusFlow AI detects the backlog and redistributes them forward:
```text
⚠ Schedule Updated

You had 2 missed tasks yesterday.
I've redistributed them across upcoming days without increasing your
daily workload above your configured limit of 2.5h/day.
```

---

## 🎯 Technical Interview Guide: Questions Grounded in Code

During technical interviews for full-stack roles, discuss these specific design decisions:

#### 1. Why React over other frontend frameworks?
> **Answer**: React's component-based paradigm and mature ecosystem allow clean separation between presentation and data fetching. By combining React with TanStack Query, server state is cached and synchronized seamlessly. In `apps/web/src/pages/DashboardPage.tsx`, task completions update state optimistically while invalidating the cache in the background.

#### 2. Why React Native for mobile?
> **Answer**: Code and type reusability. Both `apps/web` and `apps/mobile` share the same API contracts (`types/index.ts`) and consume identical REST endpoints. React Native compiles to genuine native UI elements rather than wrapping web views, delivering 60 FPS performance and native gesture ergonomics.

#### 3. Why FastAPI for the primary backend?
> **Answer**: FastAPI provides asynchronous I/O (`async/await`), automatic OpenAPI Swagger generation, and high-performance serialization via Pydantic v2 compiled in Rust. In `services/api/app/agents/`, asynchronous HTTP clients allow concurrent AI agent calls without blocking the worker process.

#### 4. Why Node.js for the notification service instead of Python?
> **Answer**: Demonstrates microservice separation of concerns. The Node.js event loop is optimized for long-lived timers, recurring cron jobs, and I/O-bound webhook dispatching. Keeping this in `services/notification-service` prevents background jobs from starving FastAPI request threads.

#### 5. Why PostgreSQL over MongoDB?
> **Answer**: FocusFlow AI is inherently relational: Users have Goals; Goals have Milestones; Milestones have Tasks; Tasks have prerequisite Dependencies (`task_dependencies`). Relational integrity (`ON DELETE CASCADE`) prevents orphaned tasks, and ACID transactions guarantee that plan approvals insert milestones and tasks atomically.

#### 6. When would MongoDB be preferable?
> **Answer**: MongoDB would be preferable if user goals were unstructured documents with wildly polymorphic properties (e.g. custom form builders, dynamic JSON schemas with arbitrary keys) where cross-entity transactions and strict referential integrity were not required.

#### 7. How does JWT authentication work with Token Rotation?
> **Answer**: On login (`app/services/auth_service.py`), the server signs an ephemeral `access_token` (60 min) and generates a cryptographic 64-character `refresh_token` stored as a SHA-256 hash in the database. When the client's access token expires, the Axios interceptor in `apps/web/src/api/client.ts` automatically exchanges the refresh token, invalidating the old refresh token (rotation) and issuing a new pair.

#### 8. How did you optimize queries and eliminate N+1 problems?
> **Answer**: In `app/repositories/goal_repo.py`, loading a goal's milestones and tasks uses SQLAlchemy `joinedload(Goal.milestones).joinedload(Milestone.tasks)`. This executes a single SQL `LEFT OUTER JOIN` instead of issuing $1 + M + (M \times T)$ separate queries.

#### 9. Why use Redis?
> **Answer**: As documented in `docs/performance.md`, the dashboard aggregates tasks, milestones, streaks, and progress. Serving this from PostgreSQL took ~64ms. Caching the serialized payload in Redis under `user:{id}:dashboard` dropped response latency to 3.8ms (94% drop). State changes immediately trigger `redis_service.invalidate_user_cache(user_id)`.

#### 10. How do you validate LLM output?
> **Answer**: We never trust raw LLM output. In `app/agents/plan_validator.py`, the AI's response is parsed through Pydantic's `StructuredPlan` schema. If a required field is missing or an invalid priority string is returned, validation rejects it and falls back safely before anything touches the database.

#### 11. How does the AI failover work when external APIs are unavailable?
> **Answer**: In `app/agents/ai_service.py`, requests to OpenAI or Groq are wrapped in try/except blocks. If the external provider returns an HTTP 429 rate limit or 5xx outage, the service seamlessly delegates to `MockProvider`, which generates deterministic, domain-specific roadmaps instantly without crashing.

#### 12. What security vulnerabilities were considered?
> **Answer**:
> - **SQL Injection**: Prevented by parameterized ORM queries in SQLAlchemy.
> - **Multi-tenancy Leaks**: Every query is strictly scoped by `current_user.id`.
> - **Password Theft**: Passwords hashed with `bcrypt` with unique salts.
> - **CSRF**: Mitigated by stateless Bearer token authorization stored in secure client memory.

---

## 📋 Implemented Features Checklist

- [x] React 18 Web App (Vite, TypeScript, Tailwind CSS, Recharts)
- [x] React Native Mobile App (Expo SDK 51, TypeScript, 14 screens)
- [x] Python FastAPI Main Backend (Pydantic v2, SQLAlchemy 2.0, Alembic)
- [x] 11 Normalized Database Entities with Foreign Keys and Indexes
- [x] JWT Authentication with Refresh Token Rotation & Revocation
- [x] 5-Stage Modular AI Agent Pipeline (Analyzer, Decomposer, Priority, Scheduler, Validator)
- [x] Provider Abstraction (Mock, OpenAI, Groq) with Graceful Failover
- [x] Smart Replanner Engine with Workload Capacity Balancing
- [x] Node.js Background Notification Worker (Cron jobs & Queue)
- [x] Redis Caching Layer with User-Scoped Invalidation
- [x] Comprehensive Pytest Test Suite (15/15 tests passing)
- [x] Docker & Multi-Container Docker Compose Orchestration
- [x] GitHub Actions CI/CD Pipelines (`frontend.yml`, `backend.yml`, `docker.yml`)
- [x] Complete Documentation (`architecture.md`, `api.md`, `database.md`, `ai-agent.md`, `deployment.md`, `performance.md`, `SECURITY.md`)

---

## 🔮 Suggested Future Improvements

1. **WebSockets for Real-Time Sync**: Add a WebSocket endpoint to FastAPI to push live schedule replans across multiple open devices simultaneously.
2. **Calendar Sync Integrations**: Integrate Google Calendar and Apple Calendar OAuth webhooks to block out focus time slots automatically.
3. **Voice Input for Goal Capture**: Add speech-to-text input to the AI Goal Wizard for rapid verbal goal creation.

---

## 📄 License
MIT License. Built for engineering portfolio and technical interview demonstration.
