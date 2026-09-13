# FocusFlow AI - REST API Specification

All API endpoints reside under the `/api` route prefix. Standard responses follow the predictable envelope pattern:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional status message"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [ ... ]
  }
}
```

---

## Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "email": "user@focusflow.dev",
    "password": "SecurePassword123!",
    "full_name": "Alex Chen",
    "daily_capacity_hours": 2.5
  }
  ```
- **Response**: `201 Created` with `access_token`, `refresh_token`, `token_type`, `expires_in`.

### `POST /api/auth/login`
Authenticates credentials.
- **Request Body**: `{ "email": "...", "password": "..." }`
- **Response**: `200 OK` with `access_token`, `refresh_token`.

### `POST /api/auth/refresh`
Rotates refresh tokens and issues fresh access tokens.
- **Request Body**: `{ "refresh_token": "..." }`

### `GET /api/auth/me`
Returns current authenticated user details. Requires `Authorization: Bearer <access_token>`.

---

## Goals & AI Planning Endpoints

### `GET /api/goals`
Returns all goals for current user with computed task counts and progress percentages.

### `POST /api/goals`
Creates a new high-level goal.

### `GET /api/goals/{id}`
Returns complete goal detail including milestone hierarchy and tasks.

### `POST /api/goals/{id}/generate-plan`
Invokes the 5-stage AI pipeline to decompose the goal into structured milestones and tasks.
- **Request Body**:
  ```json
  {
    "goal": "Prepare for software engineering interview in 6 weeks",
    "deadline_days": 42,
    "daily_available_hours": 2.5,
    "current_skill": "Advanced",
    "preferred_days": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
  }
  ```

### `POST /api/goals/{id}/approve-plan`
Saves the reviewed/modified plan into permanent database entities (`Milestone`, `Task`, `Schedule`).

### `POST /api/goals/{id}/replan`
Scans for overdue/missed tasks and redistributes them forward without exceeding daily capacity limits.

---

## Tasks Endpoints

### `GET /api/tasks`
Query parameters: `status`, `priority`, `goal_id`, `page`, `page_size`.

### `POST /api/tasks`
Creates an individual task under a milestone.

### `PATCH /api/tasks/{id}/complete`
Marks task as `COMPLETED`, records completion timestamp, and updates daily progress.

### `PATCH /api/tasks/{id}/status`
Transitions task status (`TODO`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`, `SKIPPED`).

---

## Dashboard & Analytics

### `GET /api/dashboard`
Returns today's tasks, completion percentage, current streak, active goals, overdue tasks, and AI recommendations. Cached in Redis.

### `GET /api/analytics`
Returns verified metrics computed from database logs: daily completion rate, weekly rate, focus hours, and workload distribution.
