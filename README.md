# dogfood-2026

Open-source hackathon submission and judging platform. Self-hostable, runs locally with docker compose up.

## Project Purpose
DOGFOOD 2026 is an open-source, self-hostable platform designed for managing hackathon project submissions, evaluations, and judging workflows locally without external service lock-in or third-party API dependencies.

## Technology Stack
- **Backend Framework:** Python FastAPI
- **Frontend Framework:** React + Vite
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy (Async)
- **Database Migrations:** Alembic
- **Frontend Styling:** Tailwind CSS
- **API Communication:** Axios
- **Orchestration & Deployment:** Docker Compose

## Local Setup Placeholder
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dogfood-2026
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Start local environment with Docker Compose:**
   ```bash
   docker compose up --build
   ```

4. **Access services:**
   - Frontend: `http://localhost:5173`
   - Backend API Docs: `http://localhost:8000/docs`
   - Healthcheck: `http://localhost:8000/health`

## Project Structure
```
dogfood-2026/
├── backend/               # Python FastAPI backend core
├── frontend/              # React + Vite + Tailwind CSS frontend app
├── docker-compose.yml     # Local orchestration configuration
├── .env.example           # Environment template configuration
├── README.md              # Project overview and documentation
├── ARCHITECTURE.md        # Placeholder architecture specification
├── DATA-MODEL.md          # Placeholder database schema model
├── JUDGING.md             # Placeholder judging methodology
├── acceptance-report.txt  # Project initialization verification report
├── LICENSE                # OSI-approved MIT License
└── .gitignore             # Git ignore definitions
```
