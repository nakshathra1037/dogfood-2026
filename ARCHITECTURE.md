# System Architecture Specification — DOGFOOD 2026

## Overview
DOGFOOD 2026 is an open-source, self-hostable Hackathon Submission and Judging platform engineered with Python FastAPI, SQLAlchemy 2.0 (Async), PostgreSQL, and Alembic migrations.

The backend acts as the authoritative source of truth. Every business rule, ownership constraint, assignment permission, score validity rule, normalization algorithm, and CSV generation is enforced on the server.

```
+-------------------------------------------------------+
|                 Browser / Client UI                   |
|            (React + Vite + Tailwind CSS)              |
+---------------------------+---------------------------+
                            |
                     Axios HTTP / REST
                            |
+---------------------------v---------------------------+
|               FastAPI Application Engine              |
|        - Auth & RBAC Security Layer                   |
|        - Service Layer / Business Domain              |
|        - Statistical Judging Engine                   |
|        - RFC 4180 CSV Generator                       |
+---------------------------+---------------------------+
                            |
                    SQLAlchemy 2.x Async
                            |
+---------------------------v---------------------------+
|                 PostgreSQL Database                   |
|             (ACID Transactions & FKs)                 |
+-------------------------------------------------------+
```

---

## 1. Architectural Layers

### A. API Layer (`app/api/`)
- Thin router endpoints exposing versioned routes (`/api/v1/*`).
- Dependency injection for database sessions (`get_db`) and role-based access control (`get_current_user`, `require_organizer_or_admin`, etc.).
- Explicit Pydantic schemas for request validation, data serialization, and mass assignment protection.

### B. Service & Domain Layer (`app/services/`)
- Encapsulates all transactional business operations:
  - `AuthService`: Password hashing, token issuance, case-insensitive email normalization.
  - `EventService`: Event lifecycles, date validation, track and prize management.
  - `TeamService`: Atomic team creation, invite codes, size limits, member leaves.
  - `ProjectService`: Draft updates, atomic submissions, server-side deadline checks, public gallery.
  - `JudgeService`: Assignment enforcement, duplicate prevention.
  - `RubricService`: Criteria weight validation ($\sum w = 100\%$), immutability controls.
  - `EvaluationService`: Criterion score boundary checks, completeness checks, draft saving.
  - `ResultService`: Cross-judge normalization, final score calculation, deterministic tie-breaking.
  - `ExportService`: RFC 4180 compliant CSV exports with Unicode support.

### C. Judging & Normalization Engine (`app/judging/`)
- **Scoring (`scoring.py`):** Calculates weighted scores:
  $$\text{Weighted Score} = \sum_{c} \left( \frac{\text{score}_c}{\text{max\_score}_c} \times \text{weight}_c \right)$$
- **Cross-Judge Normalization (`normalization.py`):** Normalizes judge scores via Z-score transformation with zero-variance fallback.
- **Ranking (`ranking.py`):** Deterministic tie-breaking hierarchy.

### D. Data & Storage Layer (`app/db/` & `app/models/`)
- SQLAlchemy 2.x Declarative Base with complete relational models.
- Database integrity via foreign keys (`ON DELETE CASCADE` / `RESTRICT` / `SET NULL`), unique constraints, check constraints (`start_date < end_date`), and explicit indexes.
- Managed database migrations via Alembic.

---

## 2. Security & Access Control Model

1. **Authentication:**
   - Password hashing via bcrypt (`12` work factor).
   - Stateless JWT tokens signed with `HS256` and configurable expiration.
2. **Authorization Matrix:**
   - `ADMIN`: Platform-wide access.
   - `ORGANIZER`: Access restricted to events created by that organizer.
   - `JUDGE`: Access strictly restricted to projects assigned to that judge.
   - `PARTICIPANT`: Access restricted to their own team, drafts, and public submissions.
3. **IDOR Protection:**
   - All object-level actions verify that the authenticated user owns the parent entity or is assigned to it before modification.
