from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.models.project import ProjectStatus
from app.schemas.track import TrackRead
from app.schemas.team import TeamRead
from app.utils.validators import validate_http_url


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    track_id: Optional[int] = None
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None

    @field_validator("repository_url", "demo_url")
    def validate_urls(cls, v, info):
        if v:
            return validate_http_url(v, field_name=info.field_name)
        return v


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    track_id: Optional[int] = None
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None

    @field_validator("repository_url", "demo_url")
    def validate_urls(cls, v, info):
        if v:
            return validate_http_url(v, field_name=info.field_name)
        return v


class ProjectRead(BaseModel):
    id: int
    event_id: int
    team_id: int
    track_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None
    status: ProjectStatus
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    track: Optional[TrackRead] = None
    team: Optional[TeamRead] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectPublicRead(BaseModel):
    id: int
    event_id: int
    team_id: int
    track_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    repository_url: Optional[str] = None
    demo_url: Optional[str] = None
    status: ProjectStatus
    submitted_at: Optional[datetime] = None
    created_at: datetime
    track: Optional[TrackRead] = None
    team: Optional[TeamRead] = None

    model_config = ConfigDict(from_attributes=True)
