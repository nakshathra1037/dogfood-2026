from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.evaluation import Evaluation, EvaluationStatus
from app.models.evaluation_score import EvaluationScore
from app.models.judge_assignment import JudgeAssignment
from app.models.project import Project, ProjectStatus
from app.models.rubric import Rubric
from app.models.rubric_criterion import RubricCriterion
from app.models.user import User, UserRole
from app.schemas.evaluation import EvaluationCreate, EvaluationUpdate
from app.utils.datetime import now_utc
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
)


class EvaluationService:
    @staticmethod
    async def create_or_update_evaluation(
        db: AsyncSession,
        judge: User,
        data: EvaluationCreate,
    ) -> Evaluation:
        # 1. Verify project exists
        project_query = (
            select(Project)
            .where(Project.id == data.project_id)
            .options(selectinload(Project.event))
        )
        project = (await db.execute(project_query)).scalar_one_or_none()
        if not project:
            raise NotFoundException("Project not found.", code="PROJECT_NOT_FOUND")

        # 2. Verify project status is SUBMITTED
        if project.status != ProjectStatus.SUBMITTED:
            raise BadRequestException("Cannot evaluate a project that is not submitted.", code="PROJECT_NOT_SUBMITTED")

        # 3. Verify Judge Assignment (Admin bypass permitted)
        if judge.role != UserRole.ADMIN:
            assignment_query = select(JudgeAssignment).where(
                JudgeAssignment.judge_id == judge.id,
                JudgeAssignment.project_id == project.id,
            )
            assignment = (await db.execute(assignment_query)).scalar_one_or_none()
            if not assignment:
                raise ForbiddenException("You are not assigned to evaluate this project.", code="NOT_ASSIGNED_JUDGE")

        # 4. Resolve Rubric
        rubric_id = data.rubric_id
        if not rubric_id:
            from app.services.rubric_service import RubricService
            active_rubric = await RubricService.get_active_rubric_for_event(db, project.event_id)
            rubric_id = active_rubric.id

        rubric_query = (
            select(Rubric)
            .where(Rubric.id == rubric_id, Rubric.event_id == project.event_id)
            .options(selectinload(Rubric.criteria))
        )
        rubric = (await db.execute(rubric_query)).scalar_one_or_none()
        if not rubric:
            raise NotFoundException("Valid rubric for this event not found.", code="RUBRIC_NOT_FOUND")

        # Check existing evaluation
        existing_eval_query = (
            select(Evaluation)
            .where(Evaluation.judge_id == judge.id, Evaluation.project_id == project.id)
            .options(selectinload(Evaluation.scores))
        )
        evaluation = (await db.execute(existing_eval_query)).scalar_one_or_none()

        if evaluation and evaluation.status == EvaluationStatus.SUBMITTED and judge.role != UserRole.ADMIN:
            raise BadRequestException("You have already submitted an evaluation for this project.", code="EVALUATION_ALREADY_SUBMITTED")

        # Validate scores against criteria
        criteria_map = {c.id: c for c in rubric.criteria}
        scored_crit_ids = set()

        for score_in in data.scores:
            crit = criteria_map.get(score_in.criterion_id)
            if not crit:
                raise BadRequestException(f"Criterion ID {score_in.criterion_id} does not belong to rubric.", code="INVALID_CRITERION")
            if score_in.score < 0 or score_in.score > crit.max_score:
                raise BadRequestException(
                    f"Score for '{crit.name}' must be between 0 and {crit.max_score}. Received: {score_in.score}",
                    code="SCORE_OUT_OF_RANGE"
                )
            scored_crit_ids.add(score_in.criterion_id)

        # If submitting (not draft), all criteria must be scored!
        if not data.is_draft:
            missing_criteria = set(criteria_map.keys()) - scored_crit_ids
            if missing_criteria:
                missing_names = [criteria_map[cid].name for cid in missing_criteria]
                raise BadRequestException(
                    f"All criteria must be scored before final submission. Missing: {', '.join(missing_names)}",
                    code="INCOMPLETE_EVALUATION"
                )

        target_status = EvaluationStatus.DRAFT if data.is_draft else EvaluationStatus.SUBMITTED

        if not evaluation:
            evaluation = Evaluation(
                event_id=project.event_id,
                judge_id=judge.id,
                project_id=project.id,
                rubric_id=rubric.id,
                status=target_status,
                notes=data.notes,
                submitted_at=now_utc() if target_status == EvaluationStatus.SUBMITTED else None,
            )
            db.add(evaluation)
            await db.flush()
        else:
            evaluation.rubric_id = rubric.id
            evaluation.status = target_status
            evaluation.notes = data.notes
            if target_status == EvaluationStatus.SUBMITTED:
                evaluation.submitted_at = now_utc()

            # Remove previous scores to rewrite atomically
            for s in evaluation.scores:
                await db.delete(s)
            await db.flush()

        # Add score entries
        for score_in in data.scores:
            score_entry = EvaluationScore(
                evaluation_id=evaluation.id,
                criterion_id=score_in.criterion_id,
                score=score_in.score,
                comment=score_in.comment,
            )
            db.add(score_entry)

        await db.commit()
        return await EvaluationService.get_evaluation(db, evaluation.id)

    @staticmethod
    async def get_evaluation(db: AsyncSession, evaluation_id: int) -> Evaluation:
        query = (
            select(Evaluation)
            .where(Evaluation.id == evaluation_id)
            .options(
                selectinload(Evaluation.scores).selectinload(EvaluationScore.criterion),
                selectinload(Evaluation.judge),
                selectinload(Evaluation.project).selectinload(Project.track),
            )
        )
        res = await db.execute(query)
        evaluation = res.scalar_one_or_none()
        if not evaluation:
            raise NotFoundException("Evaluation not found.", code="EVALUATION_NOT_FOUND")
        return evaluation

    @staticmethod
    async def list_evaluations_for_judge(
        db: AsyncSession,
        judge_id: int,
        event_id: Optional[int] = None,
    ) -> List[Evaluation]:
        filters = [Evaluation.judge_id == judge_id]
        if event_id:
            filters.append(Evaluation.event_id == event_id)

        query = (
            select(Evaluation)
            .where(and_(*filters))
            .options(
                selectinload(Evaluation.scores).selectinload(EvaluationScore.criterion),
                selectinload(Evaluation.project).selectinload(Project.track),
                selectinload(Evaluation.judge),
            )
            .order_by(Evaluation.created_at.desc())
        )
        res = await db.execute(query)
        return list(res.scalars().all())

    @staticmethod
    async def list_evaluations_for_project(
        db: AsyncSession,
        project_id: int,
    ) -> List[Evaluation]:
        query = (
            select(Evaluation)
            .where(Evaluation.project_id == project_id)
            .options(
                selectinload(Evaluation.scores).selectinload(EvaluationScore.criterion),
                selectinload(Evaluation.judge),
            )
            .order_by(Evaluation.created_at.desc())
        )
        res = await db.execute(query)
        return list(res.scalars().all())
