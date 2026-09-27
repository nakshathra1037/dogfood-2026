from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_project_draft_submission_and_gallery(client: AsyncClient, test_users):
    org_token = test_users["tokens"]["organizer"]
    p1_token = test_users["tokens"]["participant1"]
    now = datetime.now(timezone.utc)

    # 1. Create Event
    e_resp = await client.post(
        "/api/v1/events",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Project Flow Hackathon",
            "start_date": (now - timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "status": "ACTIVE",
        },
    )
    event_id = e_resp.json()["id"]

    # 2. Create Team
    t_resp = await client.post(
        f"/api/v1/events/{event_id}/teams",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Pioneers"},
    )
    team_id = t_resp.json()["id"]

    # 3. Create Draft Project
    proj_resp = await client.post(
        f"/api/v1/teams/{team_id}/projects",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={
            "name": "Quantum AI",
            "description": "Initial draft of quantum algorithms.",
            "repository_url": "https://github.com/example/quantum-ai",
        },
    )
    assert proj_resp.status_code == 201
    project = proj_resp.json()
    assert project["status"] == "DRAFT"
    proj_id = project["id"]

    # 4. Public gallery must NOT show draft projects
    gal_resp = await client.get("/api/v1/gallery")
    assert gal_resp.status_code == 200
    assert gal_resp.json()["total"] == 0

    # 5. Submit Project
    submit_resp = await client.post(
        f"/api/v1/projects/{proj_id}/submit",
        headers={"Authorization": f"Bearer {p1_token}"},
    )
    assert submit_resp.status_code == 200
    submitted_proj = submit_resp.json()
    assert submitted_proj["status"] == "SUBMITTED"
    assert submitted_proj["submitted_at"] is not None

    # 6. Public gallery now shows submitted project
    gal_resp2 = await client.get("/api/v1/gallery")
    assert gal_resp2.status_code == 200
    assert gal_resp2.json()["total"] == 1
    assert gal_resp2.json()["items"][0]["name"] == "Quantum AI"
