from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserRead
from app.services.auth_service import AuthService
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED, summary="Register a new user account")
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await AuthService.register(db, data)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK, summary="Authenticate and obtain JWT token")
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    return await AuthService.authenticate(db, data)


@router.get("/me", response_model=UserRead, status_code=status.HTTP_200_OK, summary="Get current authenticated user profile")
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return UserRead.model_validate(current_user)
