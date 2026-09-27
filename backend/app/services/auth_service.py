from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserRead
from app.core.security import normalize_email, get_password_hash, verify_password, create_access_token
from app.core.exceptions import ConflictException, UnauthorizedException, BadRequestException


class AuthService:
    @staticmethod
    async def register(db: AsyncSession, data: RegisterRequest) -> User:
        normalized_email = normalize_email(data.email)
        
        # Check if email already registered
        query = select(User).where(User.email == normalized_email)
        res = await db.execute(query)
        existing = res.scalar_one_or_none()
        if existing:
            raise ConflictException(
                "An account with this email address already exists.",
                code="EMAIL_ALREADY_EXISTS"
            )
        
        user = User(
            name=data.name.strip(),
            email=normalized_email,
            password_hash=get_password_hash(data.password),
            role=data.role or UserRole.PARTICIPANT,
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate(db: AsyncSession, data: LoginRequest) -> TokenResponse:
        normalized_email = normalize_email(data.email)
        query = select(User).where(User.email == normalized_email)
        res = await db.execute(query)
        user = res.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedException(
                "Invalid email or password.",
                code="INVALID_CREDENTIALS"
            )

        if not user.is_active:
            raise UnauthorizedException(
                "Your account is inactive. Please contact an administrator.",
                code="ACCOUNT_INACTIVE"
            )

        token = create_access_token(subject=str(user.id))
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserRead.model_validate(user),
        )

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        query = select(User).where(User.id == user_id)
        res = await db.execute(query)
        return res.scalar_one_or_none()
