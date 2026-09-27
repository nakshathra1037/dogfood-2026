from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead, ProjectPublicRead
from app.services.project_service import ProjectService
from app.utils.pagination import PaginationParams, PaginatedResponse
from app.api.deps import get_current_user

router = APIRouter(tags=["Projects"])


@router.post("/teams/{team_id}/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED, summary="Create a project draft for a team")
async def create_project(
    team_id: int,
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await ProjectService.create_project(db, team_id, current_user, data)
    return ProjectRead.model_validate(project)


@router.get("/projects/{project_id}", response_model=ProjectRead, status_code=status.HTTP_200_OK, summary="Get project details")
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
):
    project = await ProjectService.get_project(db, project_id)
    return ProjectRead.model_validate(project)


@router.patch("/projects/{project_id}", response_model=ProjectRead, status_code=status.HTTP_200_OK, summary="Update project draft")
async def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await ProjectService.update_project(db, project_id, current_user, data)
    return ProjectRead.model_validate(project)


@router.post("/projects/{project_id}/submit", response_model=ProjectRead, status_code=status.HTTP_200_OK, summary="Submit project atomically before deadline")
async def submit_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await ProjectService.submit_project(db, project_id, current_user)
    return ProjectRead.model_validate(project)


@router.get("/gallery", response_model=PaginatedResponse[ProjectPublicRead], status_code=status.HTTP_200_OK, summary="Browse public gallery of submitted projects")
async def get_gallery(
    event_id: Optional[int] = None,
    track_id: Optional[int] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    params = PaginationParams(page=page, limit=limit)
    projects, total = await ProjectService.list_public_gallery(
        db, params, event_id=event_id, track_id=track_id, search=search
    )
    items = [ProjectPublicRead.model_validate(p) for p in projects]
    return PaginatedResponse.create(items, total, params)
