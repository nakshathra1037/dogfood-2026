import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.db.session import Base, get_db
from app.main import app
from app.models.user import User, UserRole
from app.core.security import get_password_hash, create_access_token

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def test_users(db_session: AsyncSession):
    admin = User(
        name="Admin User",
        email="admin@test.com",
        password_hash=get_password_hash("AdminPass123!"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    organizer = User(
        name="Organizer User",
        email="organizer@test.com",
        password_hash=get_password_hash("OrganizerPass123!"),
        role=UserRole.ORGANIZER,
        is_active=True,
    )
    organizer2 = User(
        name="Organizer Two",
        email="organizer2@test.com",
        password_hash=get_password_hash("OrganizerPass123!"),
        role=UserRole.ORGANIZER,
        is_active=True,
    )
    judge1 = User(
        name="Judge One",
        email="judge1@test.com",
        password_hash=get_password_hash("JudgePass123!"),
        role=UserRole.JUDGE,
        is_active=True,
    )
    judge2 = User(
        name="Judge Two",
        email="judge2@test.com",
        password_hash=get_password_hash("JudgePass123!"),
        role=UserRole.JUDGE,
        is_active=True,
    )
    participant1 = User(
        name="Participant One",
        email="part1@test.com",
        password_hash=get_password_hash("PartPass123!"),
        role=UserRole.PARTICIPANT,
        is_active=True,
    )
    participant2 = User(
        name="Participant Two",
        email="part2@test.com",
        password_hash=get_password_hash("PartPass123!"),
        role=UserRole.PARTICIPANT,
        is_active=True,
    )

    db_session.add_all([admin, organizer, organizer2, judge1, judge2, participant1, participant2])
    await db_session.commit()
    for u in [admin, organizer, organizer2, judge1, judge2, participant1, participant2]:
        await db_session.refresh(u)

    tokens = {
        "admin": create_access_token(str(admin.id)),
        "organizer": create_access_token(str(organizer.id)),
        "organizer2": create_access_token(str(organizer2.id)),
        "judge1": create_access_token(str(judge1.id)),
        "judge2": create_access_token(str(judge2.id)),
        "participant1": create_access_token(str(participant1.id)),
        "participant2": create_access_token(str(participant2.id)),
    }

    return {
        "admin": admin,
        "organizer": organizer,
        "organizer2": organizer2,
        "judge1": judge1,
        "judge2": judge2,
        "participant1": participant1,
        "participant2": participant2,
        "tokens": tokens,
    }
