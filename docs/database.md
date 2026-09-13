# FocusFlow AI - Database Architecture & Schema Design

FocusFlow AI employs a normalized 3NF PostgreSQL relational schema.

## 1. Entity Relationship Diagram (ERD)

```
User (1)
 ├── (N) Goals
 │        ├── (N) Milestones
 │        │        └── (N) Tasks
 │        │                 ├── (N) Task Dependencies
 │        │                 └── (N) Schedules
 │        └── (N) AI Plans
 ├── (N) Daily Progress
 ├── (N) Notifications
 ├── (N) Activity Logs
 └── (N) Refresh Tokens
```

---

## 2. Table Specifications & Indexes

### `users`
- Primary Key: `id` (serial)
- `email`: `VARCHAR(255)` - UNIQUE, INDEXED for high-speed auth lookups.
- `hashed_password`: `VARCHAR(255)` - Bcrypt hashed string.
- `daily_capacity_hours`: `FLOAT` - Used by scheduler and smart replanner.
- `preferred_days`: `VARCHAR(255)` - Day filter for task calendar allocation.

### `goals`
- Foreign Key: `user_id` -> `users.id` (ON DELETE CASCADE, INDEXED).
- `title`: `VARCHAR(255)`, `deadline`: `TIMESTAMP`, `status`: `VARCHAR(32)`.

### `milestones`
- Foreign Key: `goal_id` -> `goals.id` (ON DELETE CASCADE, INDEXED).
- `order_index`: `INTEGER`, `status`: `VARCHAR(32)`.

### `tasks`
- Foreign Keys: `goal_id`, `milestone_id`, `user_id` (ON DELETE CASCADE, ALL INDEXED).
- `priority`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `status`: `TODO`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`, `SKIPPED`.
- `scheduled_date`: `TIMESTAMP` - INDEXED to optimize daily focus queries.
- `due_date`: `TIMESTAMP` - INDEXED for deadline tracking.

### `task_dependencies`
- Composite Foreign Keys: `task_id` -> `tasks.id`, `depends_on_task_id` -> `tasks.id`.
- Unique Constraint: `(task_id, depends_on_task_id)` prevents circular self-prerequisites.

### `schedules`
- Maps calendar dates (`scheduled_date` DATE, INDEXED) to `task_id` and `user_id`.

### `daily_progress`
- Unique Constraint: `(user_id, date)` ensures one consolidated record per day.
- Tracks `tasks_completed`, `tasks_missed`, `total_minutes_spent`, `focus_score`.

### `ai_plans`
- Foreign Keys: `goal_id`, `user_id` (INDEXED).
- Stores version history (`version` INTEGER) and status (`DRAFT`, `APPROVED`, `SUPERSEDED`).

### `notifications`
- Foreign Key: `user_id` (INDEXED).
- `is_read`: `BOOLEAN` - INDEXED for fast badge counting.

### `refresh_tokens`
- Foreign Key: `user_id` (INDEXED).
- `token_hash`: `VARCHAR(255)` - UNIQUE, INDEXED for fast verification and revocation.

---

## 3. Query Optimization & Index Justification
1. **User Email Index**: Auth login queries `SELECT * FROM users WHERE email = ?` run in $O(\log N)$ rather than table scan.
2. **Scheduled Date Index**: Today's tasks query `SELECT * FROM tasks WHERE user_id = ? AND scheduled_date = ?` utilizes a composite or single index on `scheduled_date`.
3. **Foreign Key Indexes**: Prevents table locking during cascading deletes and speeds up relational joins.
