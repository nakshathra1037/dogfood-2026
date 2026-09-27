from typing import List, Optional, Tuple
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project, ProjectStatus
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.track import Track
from app.models.event import Event, EventStatus
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.utils.pagination import PaginationParams
from app.utils.datetime import is_submission_open, now_utc
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
)


class ProjectService:
    @staticmethod
    async def create_project(db: AsyncSession, team_id: int, user: User, data: ProjectCreate) -> Project:
        # Load team and event
        team_query = (
            select(Team)
            .where(Team.id == team_id)
            .options(selectinload(Team.members), selectinload(Team.event))
        )
        team = (await db.execute(team_query)).scalar_one_or_none()
        if not team:
            raise NotFoundException("Team not found.", code="TEAM_NOT_FOUND")

        # Verify user is a member of the team
        if not any(m.user_id == user.id for m in team.members) and user.role != UserRole.ADMIN:
            raise ForbiddenException("You must be a member of this team to create a project.", code="NOT_TEAM_MEMBER")

        # Check if project already exists for this team
        existing_proj = (
            await db.execute(select(Project).where(Project.team_id == team_id))
        ).scalar_one_or_none()
        if existing_proj:
            raise ConflictException("A project already exists for this team.", code="PROJECT_ALREADY_EXISTS")

        # Verify event status
        if team.event.status != EventStatus.ACTIVE:
            raise BadRequestException("Cannot create project: event is not active.", code="EVENT_NOT_ACTIVE")

        # Verify track if provided
        if data.track_id:
            track = (
                await db.execute(
                    select(Track).where(Track.id == data.track_id, Track.event_id == team.event_id)
                )
            ).scalar_one_or_none()
            if not track:
                raise NotFoundException("Specified track does not belong to this event.", code="INVALID_TRACK")

        project = Project(
            event_id=team.event_id,
            team_id=team_id,
            track_id=data.track_id,
            name=data.name.strip(),
            description=data.description,
            repository_url=data.repository_url,
            demo_url=data.demo_url,
            status=ProjectStatus.DRAFT,
        )
        db.add(project)
        await db.commit()
        return await ProjectService.get_project(db, project.id)

    @staticmethod
    async def get_project(db: AsyncSession, project_id: int) -> Project:
        query = (
            select(Project)
            .where(Project.id == project_id)
            .options(
                selectinload(Project.team).selectinload(Team.members).selectinload(TeamMember.user),
                selectinload(Project.track),
                selectinload(Project.event),
            )
        )
        res = await db.execute(query)
        project = res.scalar_one_or_none()
        if not project:
            raise NotFoundException(f"Project with ID {project_id} not found.", code="PROJECT_NOT_FOUND")
        return project

    @staticmethod
    async def update_project(db: AsyncSession, project_id: int, user: User, data: ProjectUpdate) -> Project:
        project = await ProjectService.get_project(db, project_id)

        # Authorization: must be team member or admin
        is_member = any(m.user_id == user.id for m in project.team.members)
        if not is_member and user.role != UserRole.ADMIN:
            raise ForbiddenException("You do not have permission to modify this project.", code="PROJECT_FORBIDDEN")

        # If already submitted, participants cannot edit
        if project.status == ProjectStatus.SUBMITTED and user.role not in (UserRole.ADMIN, UserRole.ORGANIZER):
            raise BadRequestException(
                "Submitted projects cannot be modified. Contact an organizer to reopen submission.",
                code="PROJECT_ALREADY_SUBMITTED"
            )

        if data.track_id is not None:
            track = (
                await db.execute(
                    select(Track).where(Track.id == data.track_id, Track.event_id == project.event_id)
                )
            ).scalar_one_or_none()
            if not track:
                raise NotFoundException("Specified track does not belong to this event.", code="INVALID_TRACK")
            project.track_id = data.track_id

        if data.name is not None:
            project.name = data.name.strip()
        if data.description is not None:
            project.description = data.description
        if data.repository_url is not None:
            project.repository_url = data.repository_url
        if data.demo_url is not None:
            project.demo_url = data.demo_url

        await db.commit()
        return await ProjectService.get_project(db, project.id)

    @staticmethod
    async def submit_project(db: AsyncSession, project_id: int, user: User) -> Project:
        project = await ProjectService.get_project(db, project_id)

        # Verify authorization
        is_member = any(m.user_id == user.id for m in project.team.members)
        if not is_member and user.role != UserRole.ADMIN:
            raise ForbiddenException("You must be a member of the team to submit this project.", code="NOT_TEAM_MEMBER")

        # Verify event status & deadline
        event = project.event
        if event.status != EventStatus.ACTIVE:
            raise BadRequestException(
                f"Cannot submit project: event status is '{event.status}'. Submissions require 'ACTIVE' status.",
                code="EVENT_NOT_ACCEPTING_SUBMISSIONS"
            )

        if not is_submission_open(event.start_date, event.end_date):
            raise BadRequestException(
                "Project submission window is closed for this event.",
                code="SUBMISSION_DEADLINE_PASSED"
            )

        # Validate required fields
        if not project.name or len(project.name.strip()) < 2:
            raise BadRequestException("Project name is required before submission.", code="MISSING_PROJECT_NAME")
        if not project.description or len(project.description.strip()) < 10:
            raise BadRequestException("Detailed project description (at least 10 characters) is required.", code="MISSING_DESCRIPTION")
        if not project.repository_url and not project.demo_url:
            raise BadRequestException("Either a repository URL or demo URL is required for submission.", code="MISSING_URLS")

        # Atomic commit
        project.status = ProjectStatus.SUBMITTED
        project.submitted_at = now_utc()
        await db.commit()
        return await ProjectService.get_project(db, project.id)

    @staticmethod
    async def list_public_gallery(
        db: AsyncSession,
        params: PaginationParams,
        event_id: Optional[int] = None,
        track_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Project], int]:
        filters = [Project.status == ProjectStatus.SUBMITTED]

        if event_id:
            filters.append(Project.event_id == event_id)
        if track_id:
            filters.append(Project.track_id == track_id)
        if search:
            search_clean = f"%{search.strip()}%"
            filters.append(
                or_(
                    Project.name.ilike(search_clean),
                    Project.description.ilike(search_clean),
                )
            )

        count_query = select(func.count(Project.id)).where(and_(*filters))
        total = (await db.execute(count_query)).scalar() or 0

        query = (
            select(Project)
            .where(and_(*filters))
            .options(
                selectinload(Project.team).selectinload(Team.members).selectinload(TeamMember.user),
                selectinload(Project.track),
            )
            .order_by(Project.submitted_at.desc())
            .offset(params.offset)
            .limit(params.limit)
        )
        res = await db.execute(query)
        projects = list(res.scalars().all())
        return projects, total
