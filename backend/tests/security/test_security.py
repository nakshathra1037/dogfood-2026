from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_security_access_control(client: AsyncClient, test_users):
    p1_token = test_users["tokens"]["participant1"]
    org_token = test_users["tokens"]["organizer"]
    org2_token = test_users["tokens"]["organizer2"]
    j1_token = test_users["tokens"]["judge1"]
    now = datetime.now(timezone.utc)

    # 1. Participant attempting to create event -> Forbidden (403)
    resp = await client.post(
        "/api/v1/events",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={
            "name": "Unauthorized Event",
            "start_date": now.isoformat(),
            "end_date": (now + timedelta(days=1)).isoformat(),
        },
    )
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "INSUFFICIENT_PERMISSIONS"

    # 2. Organizer 1 creates an event
    e_resp = await client.post(
        "/api/v1/events",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Org1 Event",
            "start_date": now.isoformat(),
            "end_date": (now + timedelta(days=1)).isoformat(),
            "status": "ACTIVE",
        },
    )
    event_id = e_resp.json()["id"]

    # 3. Organizer 2 tries to modify Organizer 1's event -> Forbidden (403)
    mod_resp = await client.patch(
        f"/api/v1/events/{event_id}",
        headers={"Authorization": f"Bearer {org2_token}"},
        json={"name": "Hacked Name"},
    )
    assert mod_resp.status_code == 403

    # 4. Judge 1 tries to evaluate an unassigned project -> Forbidden (403)
    # Create project by participant 1
    t_resp = await client.post(
        f"/api/v1/events/{event_id}/teams",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Secure Team"},
    )
    team_id = t_resp.json()["id"]

    p_resp = await client.post(
        f"/api/v1/teams/{team_id}/projects",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Secure Project", "description": "Secured project against unassigned judging.", "demo_url": "https://secure.local"},
    )
    proj_id = p_resp.json()["id"]
    await client.post(f"/api/v1/projects/{proj_id}/submit", headers={"Authorization": f"Bearer {p1_token}"})

    eval_unassigned = await client.post(
        "/api/v1/evaluations",
        headers={"Authorization": f"Bearer {j1_token}"},
        json={
            "project_id": proj_id,
            "scores": [],
        },
    )
    assert eval_unassigned.status_code == 403
    assert eval_unassigned.json()["error"]["code"] == "NOT_ASSIGNED_JUDGE"

    # 5. Invalid / Expired Token -> Unauthorized (401)
    invalid_token_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.token"},
    )
    assert invalid_token_resp.status_code == 401
    assert invalid_token_resp.json()["error"]["code"] == "INVALID_TOKEN"
