from typing import List, Dict, Any, Optional
from collections import defaultdict
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event
from app.models.project import Project, ProjectStatus
from app.models.evaluation import Evaluation, EvaluationStatus
from app.models.evaluation_score import EvaluationScore
from app.models.rubric import Rubric
from app.models.rubric_criterion import RubricCriterion
from app.models.user import User
from app.models.team import Team
from app.models.track import Track
from app.schemas.result import (
    EventResultsResponse,
    ProjectResult,
    JudgeEvaluationSummary,
    CriterionScoreBreakdown,
)
from app.judging.scoring import calculate_evaluation_weighted_score
from app.judging.normalization import normalize_judge_scores
from app.judging.ranking import rank_and_aggregate_results
from app.core.exceptions import NotFoundException


class ResultService:
    @staticmethod
    async def calculate_event_results(db: AsyncSession, event_id: int) -> EventResultsResponse:
        # 1. Fetch Event
        event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
        if not event:
            raise NotFoundException("Event not found.", code="EVENT_NOT_FOUND")

        # 2. Fetch all submitted projects for this event
        projects_query = (
            select(Project)
            .where(Project.event_id == event_id, Project.status == ProjectStatus.SUBMITTED)
            .options(selectinload(Project.team), selectinload(Project.track))
        )
        projects = list((await db.execute(projects_query)).scalars().all())

        if not projects:
            return EventResultsResponse(
                event_id=event.id,
                event_name=event.name,
                total_projects=0,
                total_evaluations=0,
                results=[],
            )

        project_map = {p.id: p for p in projects}
        project_ids = list(project_map.keys())

        # 3. Fetch all SUBMITTED evaluations for these projects
        evaluations_query = (
            select(Evaluation)
            .where(
                Evaluation.event_id == event_id,
                Evaluation.project_id.in_(project_ids),
                Evaluation.status == EvaluationStatus.SUBMITTED,
            )
            .options(
                selectinload(Evaluation.scores).selectinload(EvaluationScore.criterion),
                selectinload(Evaluation.judge),
            )
        )
        evaluations = list((await db.execute(evaluations_query)).scalars().all())

        # 4. Fetch all rubric criteria for this event
        criteria_query = (
            select(RubricCriterion)
            .join(Rubric, Rubric.id == RubricCriterion.rubric_id)
            .where(Rubric.event_id == event_id)
        )
        criteria = list((await db.execute(criteria_query)).scalars().all())
        criteria_map = {c.id: c for c in criteria}

        # 5. Compute raw weighted score for each evaluation
        # judge_scores_map: judge_id -> {project_id: raw_weighted_score}
        judge_scores_map: Dict[int, Dict[int, float]] = defaultdict(dict)
        evaluation_breakdowns: Dict[int, Tuple[float, List[CriterionScoreBreakdown]]] = {}

        for ev in evaluations:
            raw_w_score, breakdowns = calculate_evaluation_weighted_score(ev.scores, criteria_map)
            judge_scores_map[ev.judge_id][ev.project_id] = raw_w_score
            evaluation_breakdowns[ev.id] = (raw_w_score, breakdowns)

        # 6. Apply Cross-Judge Normalization
        normalized_scores_map = normalize_judge_scores(judge_scores_map)

        # 7. Build JudgeEvaluationSummary objects per project
        evaluation_summaries_map: Dict[int, List[JudgeEvaluationSummary]] = defaultdict(list)
        for ev in evaluations:
            raw_score, breakdowns = evaluation_breakdowns[ev.id]
            norm_score = normalized_scores_map.get(ev.judge_id, {}).get(ev.project_id, raw_score)

            summary = JudgeEvaluationSummary(
                judge_id=ev.judge_id,
                judge_name=ev.judge.name if ev.judge else f"Judge #{ev.judge_id}",
                raw_weighted_score=raw_score,
                normalized_score=norm_score,
                criteria_scores=breakdowns,
            )
            evaluation_summaries_map[ev.project_id].append(summary)

        # 8. Prepare project data map for ranking
        project_evaluations_data: Dict[int, Dict[str, Any]] = {}
        for p in projects:
            project_evaluations_data[p.id] = {
                "project_name": p.name,
                "team_id": p.team_id,
                "team_name": p.team.name if p.team else "No Team",
                "track_id": p.track_id,
                "track_name": p.track.name if p.track else None,
            }

        # 9. Rank and aggregate
        ranked_results = rank_and_aggregate_results(
            project_evaluations_map=project_evaluations_data,
            normalized_scores_map=normalized_scores_map,
            raw_scores_map=judge_scores_map,
            evaluation_summaries_map=evaluation_summaries_map,
        )

        return EventResultsResponse(
            event_id=event.id,
            event_name=event.name,
            total_projects=len(projects),
            total_evaluations=len(evaluations),
            results=ranked_results,
        )
