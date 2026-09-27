from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.team_member import TeamRole
from app.schemas.user import UserRead


class TeamMemberRead(BaseModel):
    id: int
    team_id: int
    user_id: int
    role: TeamRole
    created_at: datetime
    user: Optional[UserRead] = None

    model_config = ConfigDict(from_attributes=True)


class TeamCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    max_size: Optional[int] = Field(default=5, ge=1, le=20)


class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)


class TeamJoinRequest(BaseModel):
    invite_code: str = Field(..., min_length=4, max_length=64)


class TeamRead(BaseModel):
    id: int
    event_id: int
    name: str
    invite_code: str
    created_by: int
    max_size: int
    created_at: datetime
    updated_at: datetime
    members: List[TeamMemberRead] = []

    model_config = ConfigDict(from_attributes=True)
