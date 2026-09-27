from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_results_and_csv_export(client: AsyncClient, test_users):
    org_token = test_users["tokens"]["organizer"]
    p1_token = test_users["tokens"]["participant1"]
    j1_token = test_users["tokens"]["judge1"]
    now = datetime.now(timezone.utc)

    # 1. Create Event
    e_resp = await client.post(
        "/api/v1/events",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Results Test Event",
            "start_date": (now - timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "status": "ACTIVE",
        },
    )
    event_id = e_resp.json()["id"]

    # 2. Create Rubric
    rubric_resp = await client.post(
        f"/api/v1/events/{event_id}/rubrics",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Standard Rubric",
            "criteria": [
                {"name": "Overall Quality", "weight": 100.0, "max_score": 10.0},
            ],
        },
    )
    rubric_id = rubric_resp.json()["id"]
    crit_id = rubric_resp.json()["criteria"][0]["id"]

    # 3. Create Project
    t_resp = await client.post(
        f"/api/v1/events/{event_id}/teams",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Top Team"},
    )
    team_id = t_resp.json()["id"]

    p_resp = await client.post(
        f"/api/v1/teams/{team_id}/projects",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Winner Project", "description": "Top quality hackathon entry.", "repository_url": "https://github.com/test/top"},
    )
    proj_id = p_resp.json()["id"]

    await client.post(f"/api/v1/projects/{proj_id}/submit", headers={"Authorization": f"Bearer {p1_token}"})

    # 4. Assign & Evaluate
    await client.post(
        f"/api/v1/events/{event_id}/assignments",
        headers={"Authorization": f"Bearer {org_token}"},
        json={"judge_id": test_users["judge1"].id, "project_id": proj_id},
    )

    await client.post(
        "/api/v1/evaluations",
        headers={"Authorization": f"Bearer {j1_token}"},
        json={
            "project_id": proj_id,
            "rubric_id": rubric_id,
            "scores": [{"criterion_id": crit_id, "score": 10.0}],
            "is_draft": False,
        },
    )

    # 5. Fetch Event Results
    results_resp = await client.get(
        f"/api/v1/events/{event_id}/results",
        headers={"Authorization": f"Bearer {org_token}"},
    )
    assert results_resp.status_code == 200
    data = results_resp.json()
    assert data["total_projects"] == 1
    assert data["total_evaluations"] == 1
    assert data["results"][0]["rank"] == 1
    assert data["results"][0]["final_score"] == 100.0

    # 6. Export Results CSV
    csv_resp = await client.get(
        f"/api/v1/events/{event_id}/export/csv",
        headers={"Authorization": f"Bearer {org_token}"},
    )
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    assert "Winner Project" in csv_resp.text
    assert "Rank" in csv_resp.text
