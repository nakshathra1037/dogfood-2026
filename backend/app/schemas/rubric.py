from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator
from app.models.rubric import RubricStatus


class RubricCriterionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    weight: float = Field(..., gt=0, le=100)
    max_score: float = Field(default=10.0, gt=0, le=1000)
    ordering: int = Field(default=0, ge=0)


class RubricCriterionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    weight: Optional[float] = Field(None, gt=0, le=100)
    max_score: Optional[float] = Field(None, gt=0, le=1000)
    ordering: Optional[int] = Field(None, ge=0)


class RubricCriterionRead(BaseModel):
    id: int
    rubric_id: int
    name: str
    description: Optional[str] = None
    weight: float
    max_score: float
    ordering: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RubricCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    criteria: List[RubricCriterionCreate] = Field(..., min_length=1)

    @model_validator(mode="after")
    def check_weights(self):
        total_weight = sum(c.weight for c in self.criteria)
        if abs(total_weight - 100.0) > 0.01:
            raise ValueError(f"Criterion weights must sum to 100%. Current sum: {total_weight}%")
        return self


class RubricUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[RubricStatus] = None


class RubricRead(BaseModel):
    id: int
    event_id: int
    name: str
    status: RubricStatus
    version: int
    created_at: datetime
    updated_at: datetime
    criteria: List[RubricCriterionRead] = []

    model_config = ConfigDict(from_attributes=True)
