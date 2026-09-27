from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_rubric_creation_and_judge_evaluation(client: AsyncClient, test_users):
    org_token = test_users["tokens"]["organizer"]
    p1_token = test_users["tokens"]["participant1"]
    j1_token = test_users["tokens"]["judge1"]
    now = datetime.now(timezone.utc)

    # 1. Create Event
    e_resp = await client.post(
        "/api/v1/events",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Judging Test Hackathon",
            "start_date": (now - timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "status": "ACTIVE",
        },
    )
    event_id = e_resp.json()["id"]

    # 2. Create Rubric with invalid weight sum (e.g. 90%) -> Error
    invalid_rubric = await client.post(
        f"/api/v1/events/{event_id}/rubrics",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Invalid Rubric",
            "criteria": [
                {"name": "Innovation", "weight": 50.0, "max_score": 10.0},
                {"name": "Impact", "weight": 40.0, "max_score": 10.0},
            ],
        },
    )
    assert invalid_rubric.status_code == 422 or invalid_rubric.status_code == 400

    # 3. Create Valid Rubric (sum = 100%)
    rubric_resp = await client.post(
        f"/api/v1/events/{event_id}/rubrics",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Official Rubric",
            "criteria": [
                {"name": "Innovation", "weight": 50.0, "max_score": 10.0},
                {"name": "Execution", "weight": 50.0, "max_score": 10.0},
            ],
        },
    )
    assert rubric_resp.status_code == 201
    rubric = rubric_resp.json()
    c1_id = rubric["criteria"][0]["id"]
    c2_id = rubric["criteria"][1]["id"]

    # 4. Create Team & Submitted Project
    t_resp = await client.post(
        f"/api/v1/events/{event_id}/teams",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Eval Team"},
    )
    team_id = t_resp.json()["id"]

    p_resp = await client.post(
        f"/api/v1/teams/{team_id}/projects",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Eval Project", "description": "High performance evaluation project.", "demo_url": "https://demo.local"},
    )
    proj_id = p_resp.json()["id"]

    await client.post(
        f"/api/v1/projects/{proj_id}/submit",
        headers={"Authorization": f"Bearer {p1_token}"},
    )

    # 5. Assign Judge 1
    assign_resp = await client.post(
        f"/api/v1/events/{event_id}/assignments",
        headers={"Authorization": f"Bearer {org_token}"},
        json={"judge_id": test_users["judge1"].id, "project_id": proj_id},
    )
    assert assign_resp.status_code == 201

    # 6. Judge 1 submits complete evaluation
    eval_resp = await client.post(
        "/api/v1/evaluations",
        headers={"Authorization": f"Bearer {j1_token}"},
        json={
            "project_id": proj_id,
            "rubric_id": rubric["id"],
            "scores": [
                {"criterion_id": c1_id, "score": 9.0, "comment": "Great innovation"},
                {"criterion_id": c2_id, "score": 8.0, "comment": "Solid execution"},
            ],
            "notes": "Excellent overall work.",
            "is_draft": False,
        },
    )
    assert eval_resp.status_code == 200
    evaluation = eval_resp.json()
    assert evaluation["status"] == "SUBMITTED"
    assert len(evaluation["scores"]) == 2
