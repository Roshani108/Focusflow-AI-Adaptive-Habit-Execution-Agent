# FocusFlow AI - Agent Architecture & Replanning Engine

## 1. Multi-Stage Pipeline Design

Rather than executing an uncontrolled monolithic prompt, FocusFlow AI processes goals through five distinct pipeline stages:

```
User Input (Goal, Deadline, Capacity, Skill)
    │
    ▼
1. Goal Analyzer (app/agents/goal_analyzer.py)
   - Checks requirement completeness & clarity
   - Calculates baseline feasibility score
    │
    ▼
2. Task Decomposer (app/agents/task_decomposer.py)
   - Breaks high-level objective into sequential milestones
   - Selects provider (OpenAI, Groq, or Mock Provider)
    │
    ▼
3. Priority Engine (app/agents/priority_engine.py)
   - Classifies task priorities (CRITICAL, HIGH, MEDIUM, LOW)
   - Bounds durations between 15m and 180m to prevent burnout
    │
    ▼
4. Schedule Generator (app/agents/scheduler.py)
   - Distributes tasks across allowed days
   - Strictly obeys user's daily capacity limit (e.g. 2.5h/day)
    │
    ▼
5. Plan Validator (app/agents/plan_validator.py)
   - Validates JSON against Pydantic StructuredPlan schema
   - Guarantees zero unhandled LLM hallucinations reach DB
    │
    ▼
User Review & Approval UI (apps/web & apps/mobile)
   - User can edit, delete, reorder tasks
    │
    ▼
Database Persistence (Milestones, Tasks, Schedules)
```

---

## 2. Provider Abstraction Layer

FocusFlow AI implements the Strategy Pattern for AI providers:

```
                AIService (ai_service.py)
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
  MockProvider      OpenAIProvider        GroqProvider
 (Deterministic)    (GPT-4o-mini)      (Llama-3.3-70b)
```

- **MockProvider**: Provides immediate, rich, zero-credential generation for software engineering, interview prep, full-stack dev, and general goals. Enables offline evaluation and instant unit testing.
- **Failover**: If OpenAI or Groq returns a rate limit or 5xx network failure, `AIService` automatically catches the exception and falls back to `MockProvider` without crashing the application.

---

## 3. Smart Replanning Algorithm

### Problem
Users occasionally miss planned study or coding sessions. Naively piling overdue tasks onto the next day causes cognitive overload and cascade failure.

### Solution Algorithm (`app/agents/replanner.py`)
1. Scans incomplete tasks where `scheduled_date < today`.
2. Retrieves user's `daily_capacity_hours` (e.g., $C = 2.0$ hours $= 120$ minutes).
3. Evaluates remaining days before goal deadline on allowed study days.
4. Starting tomorrow ($D+1$), greedily assigns overdue tasks to calendar slots where:
   $$\sum \text{Task Minutes} \le C$$
5. Updates task `scheduled_date` in database and marks status back to `TODO`.
6. Creates a new `AIPlan` version to maintain historical auditability.
7. Dispatches an in-app notification: *"⚠ Schedule Updated: You missed 2 tasks yesterday. I've redistributed them across upcoming days without exceeding your daily workload limit."*
