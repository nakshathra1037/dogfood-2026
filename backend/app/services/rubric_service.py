from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.rubric import Rubric, RubricStatus
from app.models.rubric_criterion import RubricCriterion
from app.models.evaluation import Evaluation
from app.models.event import Event
from app.models.user import User, UserRole
from app.schemas.rubric import RubricCreate, RubricUpdate
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
)


class RubricService:
    @staticmethod
    async def create_rubric(
        db: AsyncSession,
        event_id: int,
        user: User,
        data: RubricCreate,
    ) -> Rubric:
        # Check event
        event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
        if not event:
            raise NotFoundException("Event not found.", code="EVENT_NOT_FOUND")

        if user.role != UserRole.ADMIN and event.created_by != user.id:
            raise ForbiddenException("You do not have permission to manage rubrics for this event.", code="FORBIDDEN")

        # Validate total criteria weight = 100%
        total_weight = sum(c.weight for c in data.criteria)
        if abs(total_weight - 100.0) > 0.01:
            raise BadRequestException(
                f"Criteria weights must sum to exactly 100%. Current sum: {total_weight}%",
                code="INVALID_WEIGHT_SUM"
            )

        # Deactivate any currently active rubric for this event if new one is set to ACTIVE
        rubric = Rubric(
            event_id=event_id,
            name=data.name.strip(),
            status=RubricStatus.ACTIVE,
            version=1,
        )
        db.add(rubric)
        await db.flush()

        for idx, crit_in in enumerate(data.criteria):
            crit = RubricCriterion(
                rubric_id=rubric.id,
                name=crit_in.name.strip(),
                description=crit_in.description,
                weight=crit_in.weight,
                max_score=crit_in.max_score,
                ordering=crit_in.ordering if crit_in.ordering is not None else idx,
            )
            db.add(crit)

        await db.commit()
        return await RubricService.get_rubric(db, rubric.id)

    @staticmethod
    async def get_rubric(db: AsyncSession, rubric_id: int) -> Rubric:
        query = (
            select(Rubric)
            .where(Rubric.id == rubric_id)
            .options(selectinload(Rubric.criteria))
        )
        res = await db.execute(query)
        rubric = res.scalar_one_or_none()
        if not rubric:
            raise NotFoundException("Rubric not found.", code="RUBRIC_NOT_FOUND")
        return rubric

    @staticmethod
    async def get_active_rubric_for_event(db: AsyncSession, event_id: int) -> Rubric:
        query = (
            select(Rubric)
            .where(Rubric.event_id == event_id, Rubric.status == RubricStatus.ACTIVE)
            .options(selectinload(Rubric.criteria))
            .order_by(Rubric.version.desc())
        )
        res = await db.execute(query)
        rubric = res.scalars().first()
        if not rubric:
            # Fallback to any rubric for this event
            fallback_query = (
                select(Rubric)
                .where(Rubric.event_id == event_id)
                .options(selectinload(Rubric.criteria))
                .order_by(Rubric.created_at.desc())
            )
            rubric = (await db.execute(fallback_query)).scalars().first()
            if not rubric:
                raise NotFoundException("No rubric configured for this event.", code="RUBRIC_NOT_FOUND")
        return rubric

    @staticmethod
    async def list_rubrics_for_event(db: AsyncSession, event_id: int) -> List[Rubric]:
        query = (
            select(Rubric)
            .where(Rubric.event_id == event_id)
            .options(selectinload(Rubric.criteria))
            .order_by(Rubric.created_at.desc())
        )
        res = await db.execute(query)
        return list(res.scalars().all())

    @staticmethod
    async def update_rubric_status(
        db: AsyncSession,
        rubric_id: int,
        user: User,
        data: RubricUpdate,
    ) -> Rubric:
        rubric = await RubricService.get_rubric(db, rubric_id)
        event = (await db.execute(select(Event).where(Event.id == rubric.event_id))).scalar_one_or_none()
        if user.role != UserRole.ADMIN and event.created_by != user.id:
            raise ForbiddenException("Permission denied.", code="FORBIDDEN")

        if data.name is not None:
            rubric.name = data.name.strip()
        if data.status is not None:
            rubric.status = data.status

        await db.commit()
        return await RubricService.get_rubric(db, rubric.id)
