from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_team_creation_and_joining(client: AsyncClient, test_users):
    org_token = test_users["tokens"]["organizer"]
    p1_token = test_users["tokens"]["participant1"]
    p2_token = test_users["tokens"]["participant2"]
    now = datetime.now(timezone.utc)

    # 1. Create active event
    e_resp = await client.post(
        "/api/v1/events",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Team Test Hackathon",
            "start_date": (now - timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "status": "ACTIVE",
        },
    )
    event_id = e_resp.json()["id"]

    # 2. Participant 1 creates a team
    t_resp = await client.post(
        f"/api/v1/events/{event_id}/teams",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Cyber Wizards", "max_size": 2},
    )
    assert t_resp.status_code == 201
    team = t_resp.json()
    assert team["name"] == "Cyber Wizards"
    assert len(team["members"]) == 1
    assert team["members"][0]["role"] == "LEADER"
    invite_code = team["invite_code"]

    # 3. Participant 1 tries to create another team in same event -> Conflict
    dup_team = await client.post(
        f"/api/v1/events/{event_id}/teams",
        headers={"Authorization": f"Bearer {p1_token}"},
        json={"name": "Duplicate Team"},
    )
    assert dup_team.status_code == 409

    # 4. Participant 2 joins via invite code
    join_resp = await client.post(
        "/api/v1/teams/join",
        headers={"Authorization": f"Bearer {p2_token}"},
        json={"invite_code": invite_code},
    )
    assert join_resp.status_code == 200
    joined_team = join_resp.json()
    assert len(joined_team["members"]) == 2
