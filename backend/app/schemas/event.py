from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator
from app.models.event import EventStatus
from app.schemas.track import TrackRead
from app.schemas.prize import PrizeRead


class EventCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    status: Optional[EventStatus] = EventStatus.DRAFT
    is_public: bool = True

    @model_validator(mode="after")
    def check_dates(self):
        if self.start_date >= self.end_date:
            raise ValueError("start_date must be strictly before end_date")
        return self


class EventUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[EventStatus] = None
    is_public: Optional[bool] = None

    @model_validator(mode="after")
    def check_dates(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValueError("start_date must be strictly before end_date")
        return self


class EventRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    created_by: int
    status: EventStatus
    is_public: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventDetail(EventRead):
    tracks: List[TrackRead] = []
    prizes: List[PrizeRead] = []

    model_config = ConfigDict(from_attributes=True)
