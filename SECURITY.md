# Security Policy & Architecture - FocusFlow AI

This document details the security model, threat mitigations, and defensive engineering practices implemented across FocusFlow AI.

---

## 1. Authentication & Session Security

### 1.1 Secure Password Hashing
- Passwords are never stored in plain text.
- Hashing is performed using `bcrypt` with automatically generated unique salt rounds.
- Work factor prevents dictionary and brute-force GPU hash collision attacks.

### 1.2 JWT Access Tokens & Refresh Rotation
- **Access Tokens**: Ephemeral tokens signed using HMAC-SHA256 (`HS256`) with a strict expiration lifetime (default: 60 minutes).
- **Refresh Token Rotation**: Stored as a cryptographically secure random 64-character token. Each refresh request invalidates the consumed refresh token and issues a new pair.
- **Revocation**: The database table `refresh_tokens` records token hashes (`SHA-256`) and revocation flags, allowing instant session invalidation on logout.

---

## 2. Authorization & Data Isolation (Multi-Tenancy)

- **Ownership Validation**: Every sensitive endpoint strictly scopes queries by `current_user.id`. A user cannot view, edit, or delete another user's goals, milestones, tasks, or notifications.
- **Dependency Guard**: FastAPI dependency injection (`get_current_user`) guarantees authentication is evaluated before route handlers execute.

---

## 3. Injection Protections

- **SQL Injection**: SQLAlchemy 2.0 ORM constructs parameterized queries by default. Raw concatenated SQL strings are strictly prohibited.
- **Cross-Site Scripting (XSS)**: React automatically escapes interpolated JSX values.
- **Data Validation**: Strict Pydantic v2 schemas reject unexpected request payload types before business logic is invoked.

---

## 4. Environment Variables & Secret Hygiene

- No API keys, JWT secrets, or database passwords are committed to source control.
- Root and service `.env.example` files specify required variables with safe placeholder values.
- Production deployments inject secrets via environment variables or secret managers (e.g. AWS Secrets Manager, Doppler).

---

## 5. Network & CORS Policy

- FastAPI `CORSMiddleware` restricts allowed origins to designated frontend and mobile app origins (`http://localhost:5173`, `http://localhost:3000`, `exp://...`).
- Reverse proxy configurations in `infrastructure/nginx/nginx.conf` strip unauthorized internal headers and enforce HTTPS termination in production.
