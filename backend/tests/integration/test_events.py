from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_event_lifecycle_and_tracks(client: AsyncClient, test_users):
    org_token = test_users["tokens"]["organizer"]
    now = datetime.now(timezone.utc)

    # 1. Invalid date range (end before start)
    invalid_resp = await client.post(
        "/api/v1/events",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Invalid Event",
            "start_date": (now + timedelta(days=5)).isoformat(),
            "end_date": now.isoformat(),
        },
    )
    assert invalid_resp.status_code == 422 or invalid_resp.status_code == 400

    # 2. Create valid event
    resp = await client.post(
        "/api/v1/events",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Spring Hack 2026",
            "description": "Annual innovation sprint",
            "start_date": (now - timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=3)).isoformat(),
            "status": "ACTIVE",
            "is_public": True,
        },
    )
    assert resp.status_code == 201
    event = resp.json()
    event_id = event["id"]
    assert event["name"] == "Spring Hack 2026"
    assert event["status"] == "ACTIVE"

    # 3. Add Track
    track_resp = await client.post(
        f"/api/v1/events/{event_id}/tracks",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "Generative AI",
            "description": "LLM applications",
        },
    )
    assert track_resp.status_code == 201
    track = track_resp.json()
    assert track["name"] == "Generative AI"

    # 4. Add Prize
    prize_resp = await client.post(
        f"/api/v1/events/{event_id}/prizes",
        headers={"Authorization": f"Bearer {org_token}"},
        json={
            "name": "1st Place",
            "position": 1,
            "amount": "$5,000",
        },
    )
    assert prize_resp.status_code == 201
    assert prize_resp.json()["amount"] == "$5,000"

    # 5. Fetch Event Details
    detail_resp = await client.get(f"/api/v1/events/{event_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert len(detail["tracks"]) == 1
    assert len(detail["prizes"]) == 1
