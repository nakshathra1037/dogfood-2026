from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.schemas.rubric import RubricCreate, RubricUpdate, RubricRead
from app.services.rubric_service import RubricService
from app.api.deps import get_current_user, require_organizer_or_admin

router = APIRouter(tags=["Rubrics"])


@router.post("/events/{event_id}/rubrics", response_model=RubricRead, status_code=status.HTTP_201_CREATED, summary="Create a judging rubric with weighted criteria")
async def create_rubric(
    event_id: int,
    data: RubricCreate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    rubric = await RubricService.create_rubric(db, event_id, organizer, data)
    return RubricRead.model_validate(rubric)


@router.get("/events/{event_id}/rubrics", response_model=List[RubricRead], status_code=status.HTTP_200_OK, summary="List all rubrics for an event")
async def list_rubrics(
    event_id: int,
    db: AsyncSession = Depends(get_db),
):
    rubrics = await RubricService.list_rubrics_for_event(db, event_id)
    return [RubricRead.model_validate(r) for r in rubrics]


@router.get("/events/{event_id}/rubrics/active", response_model=RubricRead, status_code=status.HTTP_200_OK, summary="Get active rubric for an event")
async def get_active_rubric(
    event_id: int,
    db: AsyncSession = Depends(get_db),
):
    rubric = await RubricService.get_active_rubric_for_event(db, event_id)
    return RubricRead.model_validate(rubric)


@router.get("/rubrics/{rubric_id}", response_model=RubricRead, status_code=status.HTTP_200_OK, summary="Get rubric details by ID")
async def get_rubric(
    rubric_id: int,
    db: AsyncSession = Depends(get_db),
):
    rubric = await RubricService.get_rubric(db, rubric_id)
    return RubricRead.model_validate(rubric)


@router.patch("/rubrics/{rubric_id}", response_model=RubricRead, status_code=status.HTTP_200_OK, summary="Update rubric status or details")
async def update_rubric(
    rubric_id: int,
    data: RubricUpdate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    rubric = await RubricService.update_rubric_status(db, rubric_id, organizer, data)
    return RubricRead.model_validate(rubric)
