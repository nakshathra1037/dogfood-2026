from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.evaluation import EvaluationStatus
from app.schemas.rubric import RubricCriterionRead
from app.schemas.user import UserRead
from app.schemas.project import ProjectRead


class EvaluationScoreInput(BaseModel):
    criterion_id: int
    score: float = Field(..., ge=0)
    comment: Optional[str] = None


class EvaluationScoreRead(BaseModel):
    id: int
    evaluation_id: int
    criterion_id: int
    score: float
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    criterion: Optional[RubricCriterionRead] = None

    model_config = ConfigDict(from_attributes=True)


class EvaluationCreate(BaseModel):
    project_id: int
    rubric_id: Optional[int] = None  # If omitted, defaults to active rubric for the event
    scores: List[EvaluationScoreInput] = []
    notes: Optional[str] = None
    is_draft: bool = False


class EvaluationUpdate(BaseModel):
    scores: Optional[List[EvaluationScoreInput]] = None
    notes: Optional[str] = None
    is_draft: Optional[bool] = None


class EvaluationRead(BaseModel):
    id: int
    event_id: int
    judge_id: int
    project_id: int
    rubric_id: int
    status: EvaluationStatus
    submitted_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    scores: List[EvaluationScoreRead] = []

    model_config = ConfigDict(from_attributes=True)


class EvaluationDetail(EvaluationRead):
    judge: Optional[UserRead] = None
    project: Optional[ProjectRead] = None

    model_config = ConfigDict(from_attributes=True)
