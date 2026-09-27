import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    # 1. Register new user
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "New User",
            "email": "NEW.USER@Example.COM",  # Test email case normalization
            "password": "Password123!",
            "role": "PARTICIPANT",
        },
    )
    assert reg_resp.status_code == 201
    user_data = reg_resp.json()
    assert user_data["email"] == "new.user@example.com"
    assert "password_hash" not in user_data

    # 2. Prevent duplicate registration with different casing
    dup_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Another User",
            "email": "new.user@example.com",
            "password": "Password123!",
        },
    )
    assert dup_resp.status_code == 409
    assert dup_resp.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"

    # 3. Login
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "new.user@example.com",
            "password": "Password123!",
        },
    )
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 4. Access /auth/me with Bearer token
    me_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "new.user@example.com"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_users):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "WrongPassword!"},
    )
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "INVALID_CREDENTIALS"
