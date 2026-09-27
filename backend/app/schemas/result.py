from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class CriterionScoreBreakdown(BaseModel):
    criterion_id: int
    criterion_name: str
    weight: float
    max_score: float
    raw_score: float
    normalized_percentage: float
    weighted_score: float


class JudgeEvaluationSummary(BaseModel):
    judge_id: int
    judge_name: str
    raw_weighted_score: float
    normalized_score: float
    criteria_scores: List[CriterionScoreBreakdown] = []


class ProjectResult(BaseModel):
    project_id: int
    project_name: str
    team_id: int
    team_name: str
    track_id: Optional[int] = None
    track_name: Optional[str] = None
    evaluation_count: int
    raw_average_score: float
    normalized_score: float
    final_score: float
    rank: int
    evaluations: List[JudgeEvaluationSummary] = []


class EventResultsResponse(BaseModel):
    event_id: int
    event_name: str
    total_projects: int
    total_evaluations: int
    results: List[ProjectResult]
