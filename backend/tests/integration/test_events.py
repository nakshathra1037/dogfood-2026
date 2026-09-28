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


@pytest.mark.asyncio
async def test_participant_registration_and_my_hackathons(client: AsyncClient, test_users):
    org_token = test_users["tokens"]["organizer"]
    p1_token = test_users["tokens"]["participant1"]
    p2_token = test_users["tokens"]["participant2"]
    p1_headers = {"Authorization": f"Bearer {p1_token}"}
    p2_headers = {"Authorization": f"Bearer {p2_token}"}
    org_headers = {"Authorization": f"Bearer {org_token}"}
    now = datetime.now(timezone.utc)

    # 1. Create two events
    e1_res = await client.post(
        "/api/v1/events",
        headers=org_headers,
        json={
            "name": "Registered Hackathon 2026",
            "start_date": (now - timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=5)).isoformat(),
            "status": "ACTIVE",
            "is_public": True,
        },
    )
    e1_id = e1_res.json()["id"]

    e2_res = await client.post(
        "/api/v1/events",
        headers=org_headers,
        json={
            "name": "Unregistered Hackathon 2026",
            "start_date": (now - timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=5)).isoformat(),
            "status": "ACTIVE",
            "is_public": True,
        },
    )
    e2_id = e2_res.json()["id"]

    # 2. Before registering, registered events should be empty for both
    my_before1 = await client.get("/api/v1/events/registered", headers=p1_headers)
    assert my_before1.status_code == 200
    assert len([e for e in my_before1.json()["items"] if e["id"] in (e1_id, e2_id)]) == 0

    # Unauthenticated should fail with 401
    unauth_resp = await client.get("/api/v1/events/registered")
    assert unauth_resp.status_code == 401

    # 3. Participant 1 registers for Event 1; Participant 2 registers for Event 2
    reg_res1 = await client.post(f"/api/v1/events/{e1_id}/register", headers=p1_headers)
    assert reg_res1.status_code == 200

    reg_res2 = await client.post(f"/api/v1/events/{e2_id}/register", headers=p2_headers)
    assert reg_res2.status_code == 200

    # 4. Check registered events list for Participant 1
    my_after1 = await client.get("/api/v1/events/registered", headers=p1_headers)
    assert my_after1.status_code == 200
    my_event_ids1 = [e["id"] for e in my_after1.json()["items"]]
    assert e1_id in my_event_ids1
    assert e2_id not in my_event_ids1

    # 5. Check registered events list for Participant 2 (Cross-user isolation)
    my_after2 = await client.get("/api/v1/events/registered", headers=p2_headers)
    assert my_after2.status_code == 200
    my_event_ids2 = [e["id"] for e in my_after2.json()["items"]]
    assert e2_id in my_event_ids2
    assert e1_id not in my_event_ids2

    # 6. Querying with registered_only parameter
    my_filtered1 = await client.get("/api/v1/events?registered_only=true", headers=p1_headers)
    assert my_filtered1.status_code == 200
    filtered_ids1 = [e["id"] for e in my_filtered1.json()["items"]]
    assert e1_id in filtered_ids1
    assert e2_id not in filtered_ids1


