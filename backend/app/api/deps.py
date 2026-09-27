from typing import Optional, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.services.auth_service import AuthService

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise UnauthorizedException("Authentication token is missing.", code="MISSING_TOKEN")

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token.", code="INVALID_TOKEN")

    user_id_str = payload.get("sub")
    if not user_id_str or not user_id_str.isdigit():
        raise UnauthorizedException("Malformed authentication token.", code="MALFORMED_TOKEN")

    user = await AuthService.get_user_by_id(db, int(user_id_str))
    if not user:
        raise UnauthorizedException("User account associated with this token not found.", code="USER_NOT_FOUND")

    if not user.is_active:
        raise UnauthorizedException("User account is deactivated.", code="ACCOUNT_INACTIVE")

    return user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if not credentials or not credentials.credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except Exception:
        return None


def require_role(allowed_roles: List[UserRole]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"Action requires one of the following roles: {[r.value for r in allowed_roles]}",
                code="INSUFFICIENT_PERMISSIONS"
            )
        return current_user
    return role_checker


require_admin = require_role([UserRole.ADMIN])
require_organizer_or_admin = require_role([UserRole.ORGANIZER, UserRole.ADMIN])
require_judge_or_admin = require_role([UserRole.JUDGE, UserRole.ADMIN])
require_participant_or_above = require_role([UserRole.PARTICIPANT, UserRole.ORGANIZER, UserRole.ADMIN])
