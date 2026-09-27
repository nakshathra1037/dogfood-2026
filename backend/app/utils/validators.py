import re
from urllib.parse import urlparse
from app.core.exceptions import BadRequestException


def validate_http_url(url: str, field_name: str = "URL") -> str:
    """
    Validate that a given string is a valid HTTP/HTTPS URL without making network calls.
    """
    if not url:
        return url
    
    url = url.strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise BadRequestException(
            f"Invalid {field_name}: must be a valid HTTP or HTTPS URL.",
            code="INVALID_URL"
        )
    return url


def validate_invite_code_format(code: str) -> bool:
    """Validate invite code consists only of alphanumeric characters."""
    return bool(re.match(r"^[A-Za-z0-9_-]{4,32}$", code))
