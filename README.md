# DOGFOOD 2026 — Hackathon Submission & Judging Platform

Open-source, self-hostable Hackathon Submission and Judging platform engineered with Python FastAPI, PostgreSQL, SQLAlchemy 2.0 (Async), and React.

---

## 1. Project Purpose & Scope

DOGFOOD 2026 provides a complete, transactional, backend-authoritative hackathon management and judging platform without relying on third-party cloud services or paid APIs.

### Core Capabilities:
- **Organizers:** Create hackathons, configure tracks & prizes, manage judge assignments, build weighted rubrics, monitor evaluations, view real-time leaderboards, and export CSV results.
- **Participants:** Register with case-insensitive email normalization, create/join teams using unique invite codes, draft projects, and atomically submit before the server-enforced deadline.
- **Judges:** Authenticate, review only assigned projects, score per rubric criteria with boundary checks, and submit evaluations.
- **Scoring Engine:** Calculates criteria contributions, performs statistical cross-judge Z-score normalization to adjust for judge bias, and computes deterministic rankings with explicit tie-breaking.
- **Public:** Search and browse submitted projects in the public gallery.

---

## 2. Technology Stack

- **Backend:** Python 3.11+ / 3.12+, FastAPI, Pydantic v2
- **Database & ORM:** PostgreSQL, SQLAlchemy 2.x (Asyncio), Alembic Migrations
- **Security:** Native Bcrypt, Python-Jose (JWT), Centralized RBAC
- **Testing:** Pytest, Pytest-Asyncio, HTTPX
- **Orchestration:** Docker, Docker Compose

---

## 3. Quick Start with Docker Compose

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dogfood-2026
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start complete stack with Docker Compose:**
   ```bash
   docker compose up --build
   ```

4. **Access the application:**
   - **Interactive API Docs (Swagger UI):** `http://localhost:8000/docs`
   - **Alternative API Docs (ReDoc):** `http://localhost:8000/redoc`
   - **Healthcheck:** `http://localhost:8000/health`
   - **Frontend App:** `http://localhost:5173`

---

## 4. Local Development & Testing

### Running Tests
To run the automated test suite (unit tests, integration tests, security access matrix, and end-to-end hackathon workflow):
```bash
cd backend
pytest -v
```

### Database Migrations
```bash
cd backend
alembic upgrade head
```

### Seeding Initial Demo Data
To populate demo organizers, judges, participants, tracks, rubrics, and submitted projects:
```bash
cd backend
python -m app.db.init_db
```

---

## 5. Pre-seeded Demo Credentials

All seed accounts use deterministic credentials for local demonstration and evaluation:

| Role | Email | Password | Access / Notes |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@dogfood.local` | `Admin1234!` | Full platform administration |
| **ORGANIZER** | `organizer@dogfood.local` | `Organizer1234!` | Manages hackathon, tracks, prizes, rubric, and results |
| **JUDGE 1** | `judge1@dogfood.local` | `Judge1234!` | Assigned to evaluate Demo Projects 1 & 2 |
| **JUDGE 2** | `judge2@dogfood.local` | `Judge1234!` | Assigned to evaluate Demo Projects 1 & 2 |
| **PARTICIPANT 1** | `alice@dogfood.local` | `Participant1234!` | Leader of Alpha Innovators (Project: NeuroVision AI) |
| **PARTICIPANT 2** | `bob@dogfood.local` | `Participant1234!` | Leader of Beta Builders (Project: DecentraDocs Vault) |
| **PARTICIPANT 3** | `carol@dogfood.local` | `Participant1234!` | Member of Alpha Innovators |

---

## 6. Architecture & Documentation

- [ARCHITECTURE.md](file:///c:/Users/indhu%20m/OneDrive/Documents/indhu's%20webpage/webpage/dogfood/dogfood-2026/ARCHITECTURE.md) — Detailed 3-tier component architecture, security flow, and data flow.
- [DATA-MODEL.md](file:///c:/Users/indhu%20m/OneDrive/Documents/indhu's%20webpage/webpage/dogfood/dogfood-2026/DATA-MODEL.md) — Database entity-relationship specifications, table definitions, constraints, and indexes.
- [JUDGING.md](file:///c:/Users/indhu%20m/OneDrive/Documents/indhu's%20webpage/webpage/dogfood/dogfood-2026/JUDGING.md) — Exact mathematical equations for weighted scoring, Z-score cross-judge normalization, and tie-breaking.
- [API_CONTRACT.md](file:///c:/Users/indhu%20m/OneDrive/Documents/indhu's%20webpage/webpage/dogfood/dogfood-2026/API_CONTRACT.md) — Full REST API contract, request/response structures, and permissions matrix.
