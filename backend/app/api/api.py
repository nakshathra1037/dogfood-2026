from fastapi import APIRouter
from app.api.routes import (
    auth,
    users,
    events,
    teams,
    projects,
    judges,
    rubrics,
    evaluations,
    results,
    exports,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(events.router)
api_router.include_router(teams.router)
api_router.include_router(projects.router)
api_router.include_router(judges.router)
api_router.include_router(rubrics.router)
api_router.include_router(evaluations.router)
api_router.include_router(results.router)
api_router.include_router(exports.router)
