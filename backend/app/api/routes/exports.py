from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.services.export_service import ExportService
from app.api.deps import require_organizer_or_admin

router = APIRouter(tags=["Exports"])


@router.get("/events/{event_id}/export/csv", status_code=status.HTTP_200_OK, summary="Export hackathon results leaderboard as CSV")
async def export_results_csv(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    csv_content = await ExportService.export_results_csv(db, event_id)
    filename = f"event_{event_id}_results.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/events/{event_id}/export/detailed-csv", status_code=status.HTTP_200_OK, summary="Export detailed judging evaluation breakdown as CSV")
async def export_detailed_evaluations_csv(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    organizer: User = Depends(require_organizer_or_admin),
):
    csv_content = await ExportService.export_detailed_evaluations_csv(db, event_id)
    filename = f"event_{event_id}_detailed_evaluations.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
