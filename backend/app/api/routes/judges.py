from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.schemas.judge import (
    JudgeAssignmentCreate,
    JudgeAssignmentBulkCreate,
    JudgeAssignmentRead,
)
from app.services.judge_service import JudgeService
from app.api.deps import (
    get_current_user,
    require_organizer_or_admin,
    require_judge_or_admin,
)

router = APIRouter(tags=["Judges & Assignments"])


@router.post("/events/{event_id}/assignments", response_model=JudgeAssignmentRead, status_code=status.HTTP_201_CREATED, summary="Assign a judge to evaluate a project")
async def assign_judge(
    event_id: int,
    data: JudgeAssignmentCreate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    assignment = await JudgeService.assign_judge(db, event_id, organizer, data)
    return JudgeAssignmentRead.model_validate(assignment)


@router.post("/events/{event_id}/assignments/bulk", response_model=List[JudgeAssignmentRead], status_code=status.HTTP_201_CREATED, summary="Bulk assign projects to a judge")
async def bulk_assign_judge(
    event_id: int,
    data: JudgeAssignmentBulkCreate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    assignments = await JudgeService.bulk_assign_judge(db, event_id, organizer, data)
    return [JudgeAssignmentRead.model_validate(a) for a in assignments]


@router.get("/events/{event_id}/assignments", response_model=List[JudgeAssignmentRead], status_code=status.HTTP_200_OK, summary="List all judge assignments for an event (Organizer/Admin)")
async def list_event_assignments(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    assignments = await JudgeService.list_assignments_for_event(db, event_id)
    return [JudgeAssignmentRead.model_validate(a) for a in assignments]


@router.get("/judges/me/assignments", response_model=List[JudgeAssignmentRead], status_code=status.HTTP_200_OK, summary="List assigned projects for currently authenticated judge")
async def list_my_assignments(
    event_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    judge: User = Depends(require_judge_or_admin),
):
    assignments = await JudgeService.list_assignments_for_judge(db, judge.id, event_id)
    return [JudgeAssignmentRead.model_validate(a) for a in assignments]


@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove a judge assignment")
async def delete_assignment(
    assignment_id: int,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    await JudgeService.delete_assignment(db, assignment_id, organizer)
    return None
