from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.result import EventResultsResponse
from app.services.result_service import ResultService
from app.api.deps import get_optional_current_user, require_organizer_or_admin

router = APIRouter(tags=["Results & Leaderboard"])


@router.get("/events/{event_id}/results", response_model=EventResultsResponse, status_code=status.HTTP_200_OK, summary="Get calculated results, normalized scores, and rankings for an event")
async def get_event_results(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_optional_current_user),
):
    results_resp = await ResultService.calculate_event_results(db, event_id)
    
    # If the user is not an organizer or admin, hide internal judge individual details for privacy
    if not current_user or current_user.role not in (UserRole.ADMIN, UserRole.ORGANIZER):
        for res in results_resp.results:
            res.evaluations = []  # Omit private judge feedback / scores from public view

    return results_resp
