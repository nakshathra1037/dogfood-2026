# System Architecture Specification

## Overview
DOGFOOD 2026 is built on a 3-tier local architecture comprising a React SPA frontend client, an asynchronous FastAPI backend service, and a PostgreSQL relational database.

```
+-------------------------------------------------------+
|                 Browser / Client                      |
|            (React + Vite + Tailwind CSS)              |
+---------------------------+---------------------------+
                            |
                     Axios HTTP / REST
                            |
+---------------------------v---------------------------+
|               FastAPI Application Engine              |
|                (Python 3.11+ / Uvicorn)               |
+---------------------------+---------------------------+
                            |
                    SQLAlchemy / Asyncpg
                            |
+---------------------------v---------------------------+
|                 PostgreSQL Database                   |
|                  (Containerized DB)                   |
+-------------------------------------------------------+
```

## Architectural Principles
1. **Local First:** Zero external dependencies or third-party cloud services.
2. **Containerized Portability:** Fully executable via Docker Compose.
3. **Decoupled Architecture:** Clean separation of concerns between client UI and core service layer.
4. **Asynchronous I/O:** Async database connections and API routes.

## Core Component Specification

### 1. Frontend Client (`/frontend`)
- Single Page Application powered by Vite and React.
- Styled using Tailwind CSS utility classes.
- API requests managed using Axios client instance.

### 2. Backend Application (`/backend`)
- Asynchronous API routes powered by FastAPI.
- Data access abstraction managed via SQLAlchemy ORM.
- Schema versioning and migrations managed via Alembic.

### 3. Storage Layer
- PostgreSQL relational database for structured storage.
- Data persistence via Docker volume bindings.
