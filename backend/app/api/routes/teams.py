from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.schemas.team import TeamCreate, TeamRead, TeamJoinRequest
from app.services.team_service import TeamService
from app.utils.pagination import PaginationParams, PaginatedResponse
from app.api.deps import get_current_user

router = APIRouter(tags=["Teams"])


@router.post("/events/{event_id}/teams", response_model=TeamRead, status_code=status.HTTP_201_CREATED, summary="Create a team for an event")
async def create_team(
    event_id: int,
    data: TeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = await TeamService.create_team(db, event_id, current_user, data)
    return TeamRead.model_validate(team)


@router.get("/events/{event_id}/teams", response_model=PaginatedResponse[TeamRead], status_code=status.HTTP_200_OK, summary="List teams for an event")
async def list_teams(
    event_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    params = PaginationParams(page=page, limit=limit)
    teams, total = await TeamService.list_teams_for_event(db, event_id, params)
    items = [TeamRead.model_validate(t) for t in teams]
    return PaginatedResponse.create(items, total, params)


@router.get("/teams/{team_id}", response_model=TeamRead, status_code=status.HTTP_200_OK, summary="Get team details and members")
async def get_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
):
    team = await TeamService.get_team(db, team_id)
    return TeamRead.model_validate(team)


@router.post("/teams/join", response_model=TeamRead, status_code=status.HTTP_200_OK, summary="Join a team using an invite code")
async def join_team(
    data: TeamJoinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = await TeamService.join_team(db, current_user, data.invite_code)
    return TeamRead.model_validate(team)


@router.post("/teams/{team_id}/leave", status_code=status.HTTP_204_NO_CONTENT, summary="Leave a team")
async def leave_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await TeamService.leave_team(db, team_id, current_user)
    return None
