from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class PrizeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    position: int = Field(default=1, ge=1)
    amount: Optional[str] = None


class PrizeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    position: Optional[int] = Field(None, ge=1)
    amount: Optional[str] = None


class PrizeRead(BaseModel):
    id: int
    event_id: int
    name: str
    description: Optional[str] = None
    position: int
    amount: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
