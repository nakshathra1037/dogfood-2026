from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserRead, UserUpdate
from app.api.deps import get_current_user, require_admin
from app.core.exceptions import NotFoundException, ForbiddenException
from app.core.security import normalize_email

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserRead], status_code=status.HTTP_200_OK, summary="List all users (Admin only)")
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = select(User).order_by(User.id.asc())
    res = await db.execute(query)
    users = res.scalars().all()
    return [UserRead.model_validate(u) for u in users]


@router.get("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK, summary="Get user by ID")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only self or admin can view details
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise ForbiddenException("You do not have permission to view this user profile.", code="FORBIDDEN")

    query = select(User).where(User.id == user_id)
    res = await db.execute(query)
    user = res.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found.", code="USER_NOT_FOUND")
    return UserRead.model_validate(user)


@router.patch("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK, summary="Update user profile")
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise ForbiddenException("You do not have permission to update this user profile.", code="FORBIDDEN")

    query = select(User).where(User.id == user_id)
    res = await db.execute(query)
    user = res.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found.", code="USER_NOT_FOUND")

    if data.name is not None:
        user.name = data.name.strip()
    if data.email is not None:
        user.email = normalize_email(data.email)
    if data.role is not None:
        # Only admin can promote/demote roles
        if current_user.role != UserRole.ADMIN:
            raise ForbiddenException("Only administrators can modify user roles.", code="ROLE_CHANGE_FORBIDDEN")
        user.role = data.role
    if data.is_active is not None:
        if current_user.role != UserRole.ADMIN:
            raise ForbiddenException("Only administrators can deactivate users.", code="FORBIDDEN")
        user.is_active = data.is_active

    await db.commit()
    await db.refresh(user)
    return UserRead.model_validate(user)
