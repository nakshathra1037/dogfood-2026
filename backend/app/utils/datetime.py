from datetime import datetime, timezone
from typing import Optional


def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensure a datetime object is timezone-aware and converted to UTC."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        # Assume naive datetime is UTC
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def now_utc() -> datetime:
    """Get current UTC timestamp."""
    return datetime.now(timezone.utc)


def is_submission_open(start_date: datetime, end_date: datetime) -> bool:
    """
    Check if the current server time is strictly between start_date (inclusive) and end_date (inclusive).
    """
    current = now_utc()
    start = ensure_utc(start_date)
    end = ensure_utc(end_date)
    return start <= current <= end


def is_event_ended(end_date: datetime) -> bool:
    """Check if end_date has passed."""
    current = now_utc()
    end = ensure_utc(end_date)
    return current > end
