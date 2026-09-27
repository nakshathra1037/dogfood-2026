from typing import List, Optional, Tuple
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.judge_assignment import JudgeAssignment
from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus
from app.models.event import Event
from app.models.team import Team
from app.models.team_member import TeamMember
from app.schemas.judge import JudgeAssignmentCreate, JudgeAssignmentBulkCreate
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
)


class JudgeService:
    @staticmethod
    async def assign_judge(
        db: AsyncSession,
        event_id: int,
        organizer: User,
        data: JudgeAssignmentCreate,
    ) -> JudgeAssignment:
        # Verify event and organizer permissions
        event = (await db.execute(select(Event).where(Event.id == event_id))).scalar_one_or_none()
        if not event:
            raise NotFoundException("Event not found.", code="EVENT_NOT_FOUND")

        if organizer.role != UserRole.ADMIN and event.created_by != organizer.id:
            raise ForbiddenException("You do not have permission to assign judges for this event.", code="FORBIDDEN")

        # Verify judge
        judge = (await db.execute(select(User).where(User.id == data.judge_id))).scalar_one_or_none()
        if not judge or judge.role not in (UserRole.JUDGE, UserRole.ADMIN):
            raise BadRequestException("User must have the JUDGE role to be assigned.", code="INVALID_JUDGE_ROLE")

        # Verify project belongs to event
        project = (
            await db.execute(
                select(Project).where(Project.id == data.project_id, Project.event_id == event_id)
            )
        ).scalar_one_or_none()
        if not project:
            raise NotFoundException("Project not found in this event.", code="PROJECT_NOT_FOUND")

        # Check existing assignment
        existing = (
            await db.execute(
                select(JudgeAssignment).where(
                    JudgeAssignment.judge_id == data.judge_id,
                    JudgeAssignment.project_id == data.project_id,
                )
            )
        ).scalar_one_or_none()
        if existing:
            raise ConflictException("Judge is already assigned to this project.", code="ASSIGNMENT_EXISTS")

        assignment = JudgeAssignment(
            event_id=event_id,
            judge_id=data.judge_id,
            project_id=data.project_id,
            assigned_by=organizer.id,
        )
        db.add(assignment)
        await db.commit()

        return await JudgeService.get_assignment(db, assignment.id)

    @staticmethod
    async def bulk_assign_judge(
        db: AsyncSession,
        event_id: int,
        organizer: User,
        data: JudgeAssignmentBulkCreate,
    ) -> List[JudgeAssignment]:
        created: List[JudgeAssignment] = []
        for pid in data.project_ids:
            try:
                assign = await JudgeService.assign_judge(
                    db,
                    event_id,
                    organizer,
                    JudgeAssignmentCreate(judge_id=data.judge_id, project_id=pid),
                )
                created.append(assign)
            except ConflictException:
                pass  # Skip already existing
        return created

    @staticmethod
    async def get_assignment(db: AsyncSession, assignment_id: int) -> JudgeAssignment:
        query = (
            select(JudgeAssignment)
            .where(JudgeAssignment.id == assignment_id)
            .options(
                selectinload(JudgeAssignment.judge),
                selectinload(JudgeAssignment.project).selectinload(Project.track),
                selectinload(JudgeAssignment.project).selectinload(Project.team).selectinload(Team.members).selectinload(TeamMember.user),
            )
        )
        res = await db.execute(query)
        assignment = res.scalar_one_or_none()
        if not assignment:
            raise NotFoundException("Judge assignment not found.", code="ASSIGNMENT_NOT_FOUND")
        return assignment

    @staticmethod
    async def list_assignments_for_judge(
        db: AsyncSession,
        judge_id: int,
        event_id: Optional[int] = None,
    ) -> List[JudgeAssignment]:
        filters = [JudgeAssignment.judge_id == judge_id]
        if event_id:
            filters.append(JudgeAssignment.event_id == event_id)

        query = (
            select(JudgeAssignment)
            .where(and_(*filters))
            .options(
                selectinload(JudgeAssignment.judge),
                selectinload(JudgeAssignment.project).selectinload(Project.track),
                selectinload(JudgeAssignment.project).selectinload(Project.team).selectinload(Team.members).selectinload(TeamMember.user),
            )
            .order_by(JudgeAssignment.created_at.desc())
        )
        res = await db.execute(query)
        return list(res.scalars().all())

    @staticmethod
    async def list_assignments_for_event(
        db: AsyncSession,
        event_id: int,
    ) -> List[JudgeAssignment]:
        query = (
            select(JudgeAssignment)
            .where(JudgeAssignment.event_id == event_id)
            .options(
                selectinload(JudgeAssignment.judge),
                selectinload(JudgeAssignment.project).selectinload(Project.track),
                selectinload(JudgeAssignment.project).selectinload(Project.team).selectinload(Team.members).selectinload(TeamMember.user),
            )
            .order_by(JudgeAssignment.created_at.desc())
        )
        res = await db.execute(query)
        return list(res.scalars().all())

    @staticmethod
    async def delete_assignment(
        db: AsyncSession,
        assignment_id: int,
        organizer: User,
    ) -> None:
        assignment = await JudgeService.get_assignment(db, assignment_id)
        event = (await db.execute(select(Event).where(Event.id == assignment.event_id))).scalar_one_or_none()
        if organizer.role != UserRole.ADMIN and event.created_by != organizer.id:
            raise ForbiddenException("Permission denied to remove assignment.", code="FORBIDDEN")

        await db.delete(assignment)
        await db.commit()
