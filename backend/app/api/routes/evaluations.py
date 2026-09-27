from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.evaluation import EvaluationCreate, EvaluationRead, EvaluationDetail
from app.services.evaluation_service import EvaluationService
from app.api.deps import (
    get_current_user,
    require_judge_or_admin,
    require_organizer_or_admin,
)
from app.core.exceptions import ForbiddenException

router = APIRouter(tags=["Evaluations"])


@router.post("/evaluations", response_model=EvaluationRead, status_code=status.HTTP_200_OK, summary="Submit or draft a project evaluation")
async def create_or_update_evaluation(
    data: EvaluationCreate,
    db: AsyncSession = Depends(get_db),
    judge: User = Depends(require_judge_or_admin),
):
    evaluation = await EvaluationService.create_or_update_evaluation(db, judge, data)
    return EvaluationRead.model_validate(evaluation)


@router.get("/evaluations/{evaluation_id}", response_model=EvaluationDetail, status_code=status.HTTP_200_OK, summary="Get evaluation by ID")
async def get_evaluation(
    evaluation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    evaluation = await EvaluationService.get_evaluation(db, evaluation_id)
    # Check authorization: judge owner, organizer of event, or admin
    if current_user.role != UserRole.ADMIN and evaluation.judge_id != current_user.id:
        if current_user.role != UserRole.ORGANIZER:
            raise ForbiddenException("You do not have permission to view this evaluation.", code="FORBIDDEN")

    return EvaluationDetail.model_validate(evaluation)


@router.get("/evaluations/judge/me", response_model=List[EvaluationRead], status_code=status.HTTP_200_OK, summary="List evaluations submitted by current judge")
async def list_my_evaluations(
    event_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    judge: User = Depends(require_judge_or_admin),
):
    evaluations = await EvaluationService.list_evaluations_for_judge(db, judge.id, event_id)
    return [EvaluationRead.model_validate(e) for e in evaluations]


@router.get("/projects/{project_id}/evaluations", response_model=List[EvaluationDetail], status_code=status.HTTP_200_OK, summary="List all evaluations for a project (Organizer/Admin only)")
async def list_project_evaluations(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    evaluations = await EvaluationService.list_evaluations_for_project(db, project_id)
    return [EvaluationDetail.model_validate(e) for e in evaluations]
