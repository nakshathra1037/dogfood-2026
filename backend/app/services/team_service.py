import secrets
from typing import List, Optional, Tuple
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.team import Team
from app.models.team_member import TeamMember, TeamRole
from app.models.event import Event, EventStatus
from app.models.user import User, UserRole
from app.schemas.team import TeamCreate, TeamUpdate
from app.utils.pagination import PaginationParams
from app.core.exceptions import (
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
)


class TeamService:
    @staticmethod
    def _generate_invite_code() -> str:
        return secrets.token_urlsafe(8)

    @staticmethod
    async def create_team(db: AsyncSession, event_id: int, user: User, data: TeamCreate) -> Team:
        # Verify event exists and is in valid status
        event_query = select(Event).where(Event.id == event_id)
        event_res = await db.execute(event_query)
        event = event_res.scalar_one_or_none()
        if not event:
            raise NotFoundException("Event not found.", code="EVENT_NOT_FOUND")

        if event.status not in (EventStatus.ACTIVE, EventStatus.DRAFT):
            raise BadRequestException(
                "Cannot create team: event is not accepting new registrations.",
                code="EVENT_INACTIVE"
            )

        # Check if user is already a member of any team in this event
        existing_membership_query = (
            select(TeamMember)
            .join(Team, Team.id == TeamMember.team_id)
            .where(Team.event_id == event_id, TeamMember.user_id == user.id)
        )
        existing_membership = (await db.execute(existing_membership_query)).scalar_one_or_none()
        if existing_membership:
            raise ConflictException(
                "You are already a member of a team in this event.",
                code="ALREADY_IN_TEAM"
            )

        # Check for unique team name in event
        team_name_query = select(Team).where(Team.event_id == event_id, Team.name == data.name.strip())
        if (await db.execute(team_name_query)).scalar_one_or_none():
            raise ConflictException(
                f"A team with name '{data.name}' already exists in this event.",
                code="TEAM_NAME_EXISTS"
            )

        invite_code = TeamService._generate_invite_code()

        # Atomic transaction: Create team + add creator as LEADER
        team = Team(
            event_id=event_id,
            name=data.name.strip(),
            invite_code=invite_code,
            created_by=user.id,
            max_size=data.max_size or 5,
        )
        db.add(team)
        await db.flush()

        member = TeamMember(
            team_id=team.id,
            user_id=user.id,
            role=TeamRole.LEADER,
        )
        db.add(member)
        await db.commit()

        return await TeamService.get_team(db, team.id)

    @staticmethod
    async def get_team(db: AsyncSession, team_id: int) -> Team:
        query = (
            select(Team)
            .where(Team.id == team_id)
            .options(
                selectinload(Team.members).selectinload(TeamMember.user),
            )
            .execution_options(populate_existing=True)
        )
        res = await db.execute(query)
        team = res.scalar_one_or_none()
        if not team:
            raise NotFoundException(f"Team with ID {team_id} not found.", code="TEAM_NOT_FOUND")
        return team

    @staticmethod
    async def list_teams_for_event(
        db: AsyncSession,
        event_id: int,
        params: PaginationParams,
    ) -> Tuple[List[Team], int]:
        count_query = select(func.count(Team.id)).where(Team.event_id == event_id)
        total = (await db.execute(count_query)).scalar() or 0

        query = (
            select(Team)
            .where(Team.event_id == event_id)
            .options(
                selectinload(Team.members).selectinload(TeamMember.user),
            )
            .order_by(Team.created_at.desc())
            .offset(params.offset)
            .limit(params.limit)
        )
        res = await db.execute(query)
        teams = list(res.scalars().all())
        return teams, total

    @staticmethod
    async def join_team(db: AsyncSession, user: User, invite_code: str) -> Team:
        query = (
            select(Team)
            .where(Team.invite_code == invite_code.strip())
            .options(selectinload(Team.members), selectinload(Team.event))
            .execution_options(populate_existing=True)
        )
        res = await db.execute(query)
        team = res.scalar_one_or_none()
        if not team:
            raise NotFoundException("Invalid invite code.", code="INVALID_INVITE_CODE")

        # Verify event status
        if team.event.status not in (EventStatus.ACTIVE, EventStatus.DRAFT):
            raise BadRequestException("Cannot join team: event is closed.", code="EVENT_CLOSED")

        # Check if already in this team
        if any(m.user_id == user.id for m in team.members):
            raise ConflictException("You are already a member of this team.", code="ALREADY_TEAM_MEMBER")

        # Check if in another team for this event
        existing_membership_query = (
            select(TeamMember)
            .join(Team, Team.id == TeamMember.team_id)
            .where(Team.event_id == team.event_id, TeamMember.user_id == user.id)
        )
        if (await db.execute(existing_membership_query)).scalar_one_or_none():
            raise ConflictException(
                "You are already a member of another team in this event.",
                code="ALREADY_IN_ANOTHER_TEAM"
            )

        # Atomic check on team size
        if len(team.members) >= team.max_size:
            raise ConflictException("This team is already full.", code="TEAM_FULL")

        team_id = team.id
        new_member = TeamMember(
            team_id=team_id,
            user_id=user.id,
            role=TeamRole.MEMBER,
        )
        team.members.append(new_member)
        await db.commit()

        return await TeamService.get_team(db, team_id)

    @staticmethod
    async def leave_team(db: AsyncSession, team_id: int, user: User) -> None:
        team = await TeamService.get_team(db, team_id)
        
        member_match = next((m for m in team.members if m.user_id == user.id), None)
        if not member_match:
            raise NotFoundException("You are not a member of this team.", code="NOT_TEAM_MEMBER")

        # If leader leaves and there are other members, reassign leader
        if member_match.role == TeamRole.LEADER:
            other_members = [m for m in team.members if m.user_id != user.id]
            if other_members:
                other_members[0].role = TeamRole.LEADER
                await db.delete(member_match)
                await db.commit()
                return
            else:
                # Last member leaves -> delete team
                await db.delete(team)
                await db.commit()
                return

        await db.delete(member_match)
        await db.commit()
