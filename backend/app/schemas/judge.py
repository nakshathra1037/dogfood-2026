from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserRead
from app.schemas.project import ProjectRead


class JudgeAssignmentCreate(BaseModel):
    judge_id: int
    project_id: int


class JudgeAssignmentBulkCreate(BaseModel):
    judge_id: int
    project_ids: List[int]


class JudgeAssignmentRead(BaseModel):
    id: int
    event_id: int
    judge_id: int
    project_id: int
    assigned_by: int
    created_at: datetime
    judge: Optional[UserRead] = None
    project: Optional[ProjectRead] = None

    model_config = ConfigDict(from_attributes=True)
