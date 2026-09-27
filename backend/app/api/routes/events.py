from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.models.event import EventStatus
from app.schemas.event import EventCreate, EventUpdate, EventRead, EventDetail
from app.schemas.track import TrackCreate, TrackUpdate, TrackRead
from app.schemas.prize import PrizeCreate, PrizeRead
from app.services.event_service import EventService
from app.utils.pagination import PaginationParams, PaginatedResponse
from app.api.deps import (
    get_current_user,
    get_optional_current_user,
    require_organizer_or_admin,
)

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED, summary="Create a new hackathon event")
async def create_event(
    data: EventCreate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    event = await EventService.create_event(db, organizer, data)
    return EventRead.model_validate(event)


@router.get("", response_model=PaginatedResponse[EventRead], status_code=status.HTTP_200_OK, summary="List hackathon events with pagination")
async def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[EventStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    params = PaginationParams(page=page, limit=limit)
    events, total = await EventService.list_events(db, params, current_user, status_filter=status)
    items = [EventRead.model_validate(e) for e in events]
    return PaginatedResponse.create(items, total, params)


@router.get("/{event_id}", response_model=EventDetail, status_code=status.HTTP_200_OK, summary="Get event details including tracks and prizes")
async def get_event(
    event_id: int,
    db: AsyncSession = Depends(get_db),
):
    event = await EventService.get_event(db, event_id)
    return EventDetail.model_validate(event)


@router.patch("/{event_id}", response_model=EventRead, status_code=status.HTTP_200_OK, summary="Update event details")
async def update_event(
    event_id: int,
    data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    event = await EventService.update_event(db, event_id, organizer, data)
    return EventRead.model_validate(event)


# Track routes
@router.post("/{event_id}/tracks", response_model=TrackRead, status_code=status.HTTP_201_CREATED, summary="Add a track to an event")
async def add_track(
    event_id: int,
    data: TrackCreate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    track = await EventService.add_track(db, event_id, organizer, data)
    return TrackRead.model_validate(track)


@router.patch("/{event_id}/tracks/{track_id}", response_model=TrackRead, status_code=status.HTTP_200_OK, summary="Update an event track")
async def update_track(
    event_id: int,
    track_id: int,
    data: TrackUpdate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    track = await EventService.update_track(db, event_id, track_id, organizer, data)
    return TrackRead.model_validate(track)


@router.delete("/{event_id}/tracks/{track_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete or deactivate an event track")
async def delete_track(
    event_id: int,
    track_id: int,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    await EventService.delete_track(db, event_id, track_id, organizer)
    return None


# Prize routes
@router.post("/{event_id}/prizes", response_model=PrizeRead, status_code=status.HTTP_201_CREATED, summary="Add a prize to an event")
async def add_prize(
    event_id: int,
    data: PrizeCreate,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    prize = await EventService.add_prize(db, event_id, organizer, data)
    return PrizeRead.model_validate(prize)


@router.delete("/{event_id}/prizes/{prize_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an event prize")
async def delete_prize(
    event_id: int,
    prize_id: int,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    await EventService.delete_prize(db, event_id, prize_id, organizer)
    return None
