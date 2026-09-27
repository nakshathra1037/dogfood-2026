from typing import List, Optional, Tuple
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import Event, EventStatus
from app.models.track import Track
from app.models.prize import Prize
from app.models.project import Project, ProjectStatus
from app.models.user import User, UserRole
from app.schemas.event import EventCreate, EventUpdate
from app.schemas.track import TrackCreate, TrackUpdate
from app.schemas.prize import PrizeCreate, PrizeUpdate
from app.utils.pagination import PaginationParams
from app.utils.datetime import ensure_utc
from app.core.exceptions import NotFoundException, ForbiddenException, ConflictException, BadRequestException


class EventService:
    @staticmethod
    async def create_event(db: AsyncSession, user: User, data: EventCreate) -> Event:
        start_utc = ensure_utc(data.start_date)
        end_utc = ensure_utc(data.end_date)

        if start_utc >= end_utc:
            raise BadRequestException(
                "Event start_date must be strictly earlier than end_date.",
                code="INVALID_DATE_RANGE"
            )

        event = Event(
            name=data.name.strip(),
            description=data.description,
            start_date=start_utc,
            end_date=end_utc,
            created_by=user.id,
            status=data.status or EventStatus.DRAFT,
            is_public=data.is_public,
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)
        return event

    @staticmethod
    async def get_event(db: AsyncSession, event_id: int) -> Event:
        query = (
            select(Event)
            .where(Event.id == event_id)
            .options(selectinload(Event.tracks), selectinload(Event.prizes))
        )
        res = await db.execute(query)
        event = res.scalar_one_or_none()
        if not event:
            raise NotFoundException(f"Event with ID {event_id} not found.", code="EVENT_NOT_FOUND")
        return event

    @staticmethod
    async def list_events(
        db: AsyncSession,
        params: PaginationParams,
        user: Optional[User] = None,
        status_filter: Optional[EventStatus] = None,
    ) -> Tuple[List[Event], int]:
        filters = []
        
        # If user is not admin or organizer, show only public active/ended events
        if not user or (user.role not in (UserRole.ADMIN, UserRole.ORGANIZER)):
            filters.append(Event.is_public == True)
            filters.append(Event.status.in_([EventStatus.ACTIVE, EventStatus.ENDED]))
        elif user.role == UserRole.ORGANIZER:
            # Organizer sees all public events or their own drafts
            filters.append(
                or_(
                    Event.created_by == user.id,
                    and_(Event.is_public == True, Event.status != EventStatus.DRAFT)
                )
            )

        if status_filter:
            filters.append(Event.status == status_filter)

        count_query = select(func.count(Event.id)).where(and_(*filters) if filters else True)
        total_res = await db.execute(count_query)
        total = total_res.scalar() or 0

        query = (
            select(Event)
            .where(and_(*filters) if filters else True)
            .options(selectinload(Event.tracks), selectinload(Event.prizes))
            .order_by(Event.created_at.desc())
            .offset(params.offset)
            .limit(params.limit)
        )
        res = await db.execute(query)
        events = list(res.scalars().all())
        return events, total

    @staticmethod
    async def update_event(db: AsyncSession, event_id: int, user: User, data: EventUpdate) -> Event:
        event = await EventService.get_event(db, event_id)

        # Check authorization: must be creator or admin
        if user.role != UserRole.ADMIN and event.created_by != user.id:
            raise ForbiddenException("You do not have permission to modify this event.", code="EVENT_FORBIDDEN")

        if data.name is not None:
            event.name = data.name.strip()
        if data.description is not None:
            event.description = data.description
        if data.start_date is not None:
            event.start_date = ensure_utc(data.start_date)
        if data.end_date is not None:
            event.end_date = ensure_utc(data.end_date)
        if data.status is not None:
            event.status = data.status
        if data.is_public is not None:
            event.is_public = data.is_public

        if event.start_date >= event.end_date:
            raise BadRequestException(
                "Event start_date must be strictly earlier than end_date.",
                code="INVALID_DATE_RANGE"
            )

        await db.commit()
        await db.refresh(event)
        return event

    # Tracks management
    @staticmethod
    async def add_track(db: AsyncSession, event_id: int, user: User, data: TrackCreate) -> Track:
        event = await EventService.get_event(db, event_id)
        if user.role != UserRole.ADMIN and event.created_by != user.id:
            raise ForbiddenException("You do not have permission to manage tracks for this event.", code="TRACK_FORBIDDEN")

        # Check for duplicate track name in this event
        query = select(Track).where(Track.event_id == event_id, Track.name == data.name.strip())
        res = await db.execute(query)
        if res.scalar_one_or_none():
            raise ConflictException(f"Track with name '{data.name}' already exists in this event.", code="TRACK_EXISTS")

        track = Track(
            event_id=event_id,
            name=data.name.strip(),
            description=data.description,
            is_active=data.is_active,
        )
        db.add(track)
        await db.commit()
        await db.refresh(track)
        return track

    @staticmethod
    async def update_track(db: AsyncSession, event_id: int, track_id: int, user: User, data: TrackUpdate) -> Track:
        event = await EventService.get_event(db, event_id)
        if user.role != UserRole.ADMIN and event.created_by != user.id:
            raise ForbiddenException("You do not have permission to manage tracks for this event.", code="TRACK_FORBIDDEN")

        query = select(Track).where(Track.id == track_id, Track.event_id == event_id)
        res = await db.execute(query)
        track = res.scalar_one_or_none()
        if not track:
            raise NotFoundException("Track not found in this event.", code="TRACK_NOT_FOUND")

        if data.name is not None:
            name_check = await db.execute(
                select(Track).where(Track.event_id == event_id, Track.name == data.name.strip(), Track.id != track_id)
            )
            if name_check.scalar_one_or_none():
                raise ConflictException(f"Another track with name '{data.name}' already exists in this event.", code="TRACK_EXISTS")
            track.name = data.name.strip()

        if data.description is not None:
            track.description = data.description
        if data.is_active is not None:
            track.is_active = data.is_active

        await db.commit()
        await db.refresh(track)
        return track

    @staticmethod
    async def delete_track(db: AsyncSession, event_id: int, track_id: int, user: User) -> None:
        event = await EventService.get_event(db, event_id)
        if user.role != UserRole.ADMIN and event.created_by != user.id:
            raise ForbiddenException("You do not have permission to delete tracks for this event.", code="TRACK_FORBIDDEN")

        query = select(Track).where(Track.id == track_id, Track.event_id == event_id)
        res = await db.execute(query)
        track = res.scalar_one_or_none()
        if not track:
            raise NotFoundException("Track not found in this event.", code="TRACK_NOT_FOUND")

        # Check if submitted projects are using this track
        proj_query = select(Project).where(
            Project.track_id == track_id,
            Project.status == ProjectStatus.SUBMITTED
        )
        proj_res = await db.execute(proj_query)
        if proj_res.scalars().first():
            # Soft deactivate rather than destroying submitted history
            track.is_active = False
            await db.commit()
            return

        await db.delete(track)
        await db.commit()

    # Prizes management
    @staticmethod
    async def add_prize(db: AsyncSession, event_id: int, user: User, data: PrizeCreate) -> Prize:
        event = await EventService.get_event(db, event_id)
        if user.role != UserRole.ADMIN and event.created_by != user.id:
            raise ForbiddenException("You do not have permission to manage prizes for this event.", code="PRIZE_FORBIDDEN")

        prize = Prize(
            event_id=event_id,
            name=data.name.strip(),
            description=data.description,
            position=data.position,
            amount=data.amount,
        )
        db.add(prize)
        await db.commit()
        await db.refresh(prize)
        return prize

    @staticmethod
    async def delete_prize(db: AsyncSession, event_id: int, prize_id: int, user: User) -> None:
        event = await EventService.get_event(db, event_id)
        if user.role != UserRole.ADMIN and event.created_by != user.id:
            raise ForbiddenException("You do not have permission to manage prizes for this event.", code="PRIZE_FORBIDDEN")

        query = select(Prize).where(Prize.id == prize_id, Prize.event_id == event_id)
        res = await db.execute(query)
        prize = res.scalar_one_or_none()
        if not prize:
            raise NotFoundException("Prize not found in this event.", code="PRIZE_NOT_FOUND")

        await db.delete(prize)
        await db.commit()
