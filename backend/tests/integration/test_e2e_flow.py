from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_full_hackathon_e2e_flow(client: AsyncClient):
    """
    Complete End-to-End Hackathon Workflow:
    1. Admin and Organizer registered and active.
    2. Organizer creates Hackathon Event, Tracks, Prizes, and Rubric with criteria.
    3. Participants register, form Teams with invite codes, create and submit Projects.
    4. Organizer assigns Judges to Projects.
    5. Judges review assigned projects and submit evaluations.
    6. System calculates weighted scores, runs cross-judge normalization, and ranks projects.
    7. Organizer views final results and exports CSV.
    """
    now = datetime.now(timezone.utc)

    # 1. Register Organizer
    org_reg = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Maria Organizer",
            "email": "maria@organizer.io",
            "password": "SecurePassword123!",
            "role": "ORGANIZER",
        },
    )
    assert org_reg.status_code == 201

    org_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "maria@organizer.io", "password": "SecurePassword123!"},
    )
    org_token = org_login.json()["access_token"]
    org_headers = {"Authorization": f"Bearer {org_token}"}

    # 2. Register 2 Judges
    j1_reg = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Judge Alan",
            "email": "alan@judge.io",
            "password": "JudgePassword123!",
            "role": "JUDGE",
        },
    )
    j1_id = j1_reg.json()["id"]
    j1_token = (
        await client.post(
            "/api/v1/auth/login",
            json={"email": "alan@judge.io", "password": "JudgePassword123!"},
        )
    ).json()["access_token"]
    j1_headers = {"Authorization": f"Bearer {j1_token}"}

    j2_reg = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Judge Grace",
            "email": "grace@judge.io",
            "password": "JudgePassword123!",
            "role": "JUDGE",
        },
    )
    j2_id = j2_reg.json()["id"]
    j2_token = (
        await client.post(
            "/api/v1/auth/login",
            json={"email": "grace@judge.io", "password": "JudgePassword123!"},
        )
    ).json()["access_token"]
    j2_headers = {"Authorization": f"Bearer {j2_token}"}

    # 3. Organizer creates Hackathon Event
    event_resp = await client.post(
        "/api/v1/events",
        headers=org_headers,
        json={
            "name": "Global Tech Disrupt 2026",
            "description": "The premier worldwide builder competition.",
            "start_date": (now - timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=3)).isoformat(),
            "status": "ACTIVE",
            "is_public": True,
        },
    )
    assert event_resp.status_code == 201
    event_id = event_resp.json()["id"]

    # 4. Add Tracks and Prizes
    t_ai = (
        await client.post(
            f"/api/v1/events/{event_id}/tracks",
            headers=org_headers,
            json={"name": "Generative AI & LLMs", "description": "AI systems"},
        )
    ).json()

    t_infra = (
        await client.post(
            f"/api/v1/events/{event_id}/tracks",
            headers=org_headers,
            json={"name": "Cloud Infrastructure", "description": "Infra tools"},
        )
    ).json()

    await client.post(
        f"/api/v1/events/{event_id}/prizes",
        headers=org_headers,
        json={"name": "Grand Prize", "position": 1, "amount": "$20,000"},
    )

    # 5. Configure Rubric (Criteria weights sum to 100%)
    rubric_resp = await client.post(
        f"/api/v1/events/{event_id}/rubrics",
        headers=org_headers,
        json={
            "name": "Main Evaluation Rubric",
            "criteria": [
                {"name": "Innovation", "weight": 40.0, "max_score": 10.0, "ordering": 1},
                {"name": "Technical Depth", "weight": 30.0, "max_score": 10.0, "ordering": 2},
                {"name": "Presentation", "weight": 30.0, "max_score": 10.0, "ordering": 3},
            ],
        },
    )
    assert rubric_resp.status_code == 201
    rubric = rubric_resp.json()
    crit_ids = [c["id"] for c in rubric["criteria"]]

    # 6. Participants Register & Form Teams
    # Participant 1
    p1_reg = await client.post(
        "/api/v1/auth/register",
        json={"name": "Sam Builder", "email": "sam@builder.io", "password": "SamPassword123!"},
    )
    p1_token = (
        await client.post(
            "/api/v1/auth/login",
            json={"email": "sam@builder.io", "password": "SamPassword123!"},
        )
    ).json()["access_token"]
    p1_headers = {"Authorization": f"Bearer {p1_token}"}

    # Participant 2
    p2_reg = await client.post(
        "/api/v1/auth/register",
        json={"name": "Devin Coder", "email": "devin@builder.io", "password": "DevinPassword123!"},
    )
    p2_token = (
        await client.post(
            "/api/v1/auth/login",
            json={"email": "devin@builder.io", "password": "DevinPassword123!"},
        )
    ).json()["access_token"]
    p2_headers = {"Authorization": f"Bearer {p2_token}"}

    # Teams
    team1 = (
        await client.post(
            f"/api/v1/events/{event_id}/teams",
            headers=p1_headers,
            json={"name": "Team Hyperion"},
        )
    ).json()

    team2 = (
        await client.post(
            f"/api/v1/events/{event_id}/teams",
            headers=p2_headers,
            json={"name": "Team Nexus"},
        )
    ).json()

    # 7. Projects Created & Submitted
    proj1 = (
        await client.post(
            f"/api/v1/teams/{team1['id']}/projects",
            headers=p1_headers,
            json={
                "name": "Hyperion AI Engine",
                "description": "High throughput agentic inference platform.",
                "track_id": t_ai["id"],
                "repository_url": "https://github.com/hyperion/engine",
                "demo_url": "https://hyperion.io",
            },
        )
    ).json()

    proj2 = (
        await client.post(
            f"/api/v1/teams/{team2['id']}/projects",
            headers=p2_headers,
            json={
                "name": "Nexus Mesh Network",
                "description": "Resilient peer to peer edge compute framework.",
                "track_id": t_infra["id"],
                "repository_url": "https://github.com/nexus/mesh",
                "demo_url": "https://nexus-mesh.io",
            },
        )
    ).json()

    # Submit Projects
    await client.post(f"/api/v1/projects/{proj1['id']}/submit", headers=p1_headers)
    await client.post(f"/api/v1/projects/{proj2['id']}/submit", headers=p2_headers)

    # 8. Organizer Assigns Both Judges to Both Projects
    await client.post(
        f"/api/v1/events/{event_id}/assignments",
        headers=org_headers,
        json={"judge_id": j1_id, "project_id": proj1["id"]},
    )
    await client.post(
        f"/api/v1/events/{event_id}/assignments",
        headers=org_headers,
        json={"judge_id": j1_id, "project_id": proj2["id"]},
    )
    await client.post(
        f"/api/v1/events/{event_id}/assignments",
        headers=org_headers,
        json={"judge_id": j2_id, "project_id": proj1["id"]},
    )
    await client.post(
        f"/api/v1/events/{event_id}/assignments",
        headers=org_headers,
        json={"judge_id": j2_id, "project_id": proj2["id"]},
    )

    # 9. Judges View Their Assignments
    j1_assignments = (await client.get("/api/v1/judges/me/assignments", headers=j1_headers)).json()
    assert len(j1_assignments) == 2

    # 10. Judges Score Projects
    # Judge 1 on Project 1 (Hyperion)
    await client.post(
        "/api/v1/evaluations",
        headers=j1_headers,
        json={
            "project_id": proj1["id"],
            "rubric_id": rubric["id"],
            "scores": [
                {"criterion_id": crit_ids[0], "score": 9.5},
                {"criterion_id": crit_ids[1], "score": 9.0},
                {"criterion_id": crit_ids[2], "score": 9.0},
            ],
            "notes": "State of the art system.",
            "is_draft": False,
        },
    )

    # Judge 1 on Project 2 (Nexus)
    await client.post(
        "/api/v1/evaluations",
        headers=j1_headers,
        json={
            "project_id": proj2["id"],
            "rubric_id": rubric["id"],
            "scores": [
                {"criterion_id": crit_ids[0], "score": 8.0},
                {"criterion_id": crit_ids[1], "score": 8.5},
                {"criterion_id": crit_ids[2], "score": 7.5},
            ],
            "notes": "Good infrastructure idea.",
            "is_draft": False,
        },
    )

    # Judge 2 on Project 1 (Hyperion)
    await client.post(
        "/api/v1/evaluations",
        headers=j2_headers,
        json={
            "project_id": proj1["id"],
            "rubric_id": rubric["id"],
            "scores": [
                {"criterion_id": crit_ids[0], "score": 9.0},
                {"criterion_id": crit_ids[1], "score": 9.5},
                {"criterion_id": crit_ids[2], "score": 8.5},
            ],
            "is_draft": False,
        },
    )

    # Judge 2 on Project 2 (Nexus)
    await client.post(
        "/api/v1/evaluations",
        headers=j2_headers,
        json={
            "project_id": proj2["id"],
            "rubric_id": rubric["id"],
            "scores": [
                {"criterion_id": crit_ids[0], "score": 8.5},
                {"criterion_id": crit_ids[1], "score": 8.0},
                {"criterion_id": crit_ids[2], "score": 8.0},
            ],
            "is_draft": False,
        },
    )

    # 11. Calculate Results and Verify Leaderboard
    results_resp = await client.get(f"/api/v1/events/{event_id}/results", headers=org_headers)
    assert results_resp.status_code == 200
    results_data = results_resp.json()

    assert results_data["total_projects"] == 2
    assert results_data["total_evaluations"] == 4
    results_list = results_data["results"]

    # Rank 1 should be Hyperion AI Engine
    assert results_list[0]["project_name"] == "Hyperion AI Engine"
    assert results_list[0]["rank"] == 1
    assert results_list[0]["final_score"] > results_list[1]["final_score"]

    # Rank 2 should be Nexus Mesh Network
    assert results_list[1]["project_name"] == "Nexus Mesh Network"
    assert results_list[1]["rank"] == 2

    # 12. Export CSV
    csv_resp = await client.get(f"/api/v1/events/{event_id}/export/csv", headers=org_headers)
    assert csv_resp.status_code == 200
    assert "Hyperion AI Engine" in csv_resp.text
    assert "Nexus Mesh Network" in csv_resp.text
