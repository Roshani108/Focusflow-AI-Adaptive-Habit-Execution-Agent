# FocusFlow AI - System Architecture Document

## 1. High-Level Architecture Overview

FocusFlow AI is designed with clean modular separation of concerns across clients, main API backend, background workers, and persistent stores.

```
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

## 2. Component Responsibilities

### 2.1 React Web Client (`apps/web`)
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5, React Router v6, Recharts.
- **Role**: Responsive desktop and tablet SaaS application.
- **Security**: Automatic token refresh via Axios response interceptors; no plaintext password caching.
- **Optimization**: Route-level code splitting, TanStack Query client-side cache, optimistic status updates.

### 2.2 React Native Mobile App (`apps/mobile`)
- **Technology**: Expo, React Native 0.74, TypeScript, React Navigation (Native Stack + Bottom Tabs).
- **Role**: True native mobile experience with 14 dedicated screens for on-the-go productivity tracking.
- **Networking**: Configured with platform-aware networking (Android `10.0.2.2` / iOS `localhost`).

### 2.3 FastAPI Main Backend (`services/api`)
- **Technology**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, pyjwt, bcrypt.
- **Role**: Core business logic, secure authentication, data validation, and modular AI agent orchestrator.
- **Design Patterns**: Repository Pattern, Dependency Injection (`get_db`, `get_current_user`), Strategy Pattern for AI Providers.

### 2.4 Modular AI Agent Pipeline (`services/api/app/agents`)
- **Pipeline Stages**:
  1. `GoalAnalyzer`: Checks goal scope, detects missing required inputs, scores feasibility.
  2. `TaskDecomposer`: Breaks down high-level goal into logical milestones.
  3. `PriorityEngine`: Sets priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and binds estimated duration to realistic chunks (15-180m).
  4. `ScheduleGenerator`: Maps tasks to calendar days respecting daily capacity (e.g. 2h/day) and preferred days.
  5. `PlanValidator`: Validates JSON structure using Pydantic `StructuredPlan` before returning to user.
  6. `SmartReplanner`: Automatically redistributes overdue tasks forward across active days without violating daily capacity.

### 2.5 Node.js Background Notification Worker (`services/notification-service`)
- **Technology**: Node.js 20, Express, TypeScript, ioredis.
- **Role**: Periodic background jobs, reminder scanning, overdue task alerts, simulated push/webhook delivery.
- **Isolation**: Prevents long-running background cron work from competing with latency-critical API requests.

### 2.6 Persistence Layer
- **PostgreSQL 16**: 11 normalized relational tables with foreign keys, composite indexes, cascading deletes.
- **Redis 7**: High-speed caching for `/dashboard` and `/analytics` endpoints with automatic invalidation upon task state mutations.
