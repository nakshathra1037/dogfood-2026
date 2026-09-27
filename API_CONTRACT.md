# DOGFOOD 2026 — API Contract Specification

This document defines the authoritative REST API contract for DOGFOOD 2026 backend (`/api/v1`).

---

## Standard Response & Error Format

### Standard Error Response (HTTP 4xx / 5xx)
```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human readable explanation of the error",
    "details": null
  }
}
```

### Standard Paginated Response
```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "limit": 20,
  "total_pages": 5,
  "has_next": true,
  "has_prev": false
}
```

---

## Endpoints

### 1. Authentication (`/api/v1/auth`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Public | `{ name, email, password, role? }` | `201 Created` | Register account (email normalized to lowercase) |
| `/auth/login` | `POST` | Public | `{ email, password }` | `200 OK` | Authenticate and obtain JWT Bearer token |
| `/auth/me` | `GET` | Authenticated | None | `200 OK` | Fetch current active user profile |

### 2. Users (`/api/v1/users`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/users` | `GET` | Admin | None | `200 OK` | List all users |
| `/users/{id}` | `GET` | Self / Admin | None | `200 OK` | Fetch user profile by ID |
| `/users/{id}` | `PATCH` | Self / Admin | `{ name?, email?, role?, is_active? }` | `200 OK` | Update user profile (role update restricted to Admin) |

### 3. Hackathons & Events (`/api/v1/events`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/events` | `POST` | Organizer / Admin | `{ name, description?, start_date, end_date, status?, is_public? }` | `201 Created` | Create new hackathon event |
| `/events` | `GET` | Public / Auth | Query: `?page=1&limit=20&status=ACTIVE` | `200 OK` | List hackathon events |
| `/events/{id}` | `GET` | Public / Auth | None | `200 OK` | Get event detail with tracks & prizes |
| `/events/{id}` | `PATCH` | Owner / Admin | `{ name?, description?, start_date?, end_date?, status?, is_public? }` | `200 OK` | Update event configuration |
| `/events/{id}/tracks` | `POST` | Owner / Admin | `{ name, description?, is_active? }` | `201 Created` | Add competition track |
| `/events/{id}/tracks/{track_id}` | `PATCH` | Owner / Admin | `{ name?, description?, is_active? }` | `200 OK` | Update track |
| `/events/{id}/tracks/{track_id}` | `DELETE` | Owner / Admin | None | `204 No Content` | Delete track (or soft-deactivate if in use) |
| `/events/{id}/prizes` | `POST` | Owner / Admin | `{ name, description?, position, amount? }` | `201 Created` | Add prize |
| `/events/{id}/prizes/{prize_id}` | `DELETE` | Owner / Admin | None | `204 No Content` | Delete prize |

### 4. Teams (`/api/v1/teams`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/events/{event_id}/teams` | `POST` | Participant | `{ name, max_size? }` | `201 Created` | Create team; creator automatically becomes LEADER |
| `/events/{event_id}/teams` | `GET` | Public / Auth | Query: `?page=1&limit=20` | `200 OK` | List teams registered for event |
| `/teams/{id}` | `GET` | Public / Auth | None | `200 OK` | Get team details and member list |
| `/teams/join` | `POST` | Participant | `{ invite_code }` | `200 OK` | Join team via invite code with size limit checks |
| `/teams/{id}/leave` | `POST` | Team Member | None | `204 No Content` | Leave team (reassigns leader or cleans up team) |

### 5. Projects & Submissions (`/api/v1/projects`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/teams/{team_id}/projects` | `POST` | Team Member | `{ name, description?, track_id?, repository_url?, demo_url? }` | `201 Created` | Initialize project draft |
| `/projects/{id}` | `GET` | Public / Auth | None | `200 OK` | Get project detail |
| `/projects/{id}` | `PATCH` | Team Member | `{ name?, description?, track_id?, repository_url?, demo_url? }` | `200 OK` | Update project draft |
| `/projects/{id}/submit` | `POST` | Team Member | None | `200 OK` | Atomically validate and submit project before deadline |
| `/gallery` | `GET` | Public | Query: `?event_id=&track_id=&search=&page=1&limit=20` | `200 OK` | Search submitted projects in gallery |

### 6. Judges & Assignments (`/api/v1/judges` & `/api/v1/events/{id}/assignments`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/events/{event_id}/assignments` | `POST` | Owner / Admin | `{ judge_id, project_id }` | `201 Created` | Assign judge to project |
| `/events/{event_id}/assignments/bulk` | `POST` | Owner / Admin | `{ judge_id, project_ids: [] }` | `201 Created` | Bulk assign projects to judge |
| `/events/{event_id}/assignments` | `GET` | Owner / Admin | None | `200 OK` | List all judging assignments for event |
| `/judges/me/assignments` | `GET` | Judge | Query: `?event_id=` | `200 OK` | List projects assigned to current judge |
| `/assignments/{id}` | `DELETE` | Owner / Admin | None | `204 No Content` | Remove judge assignment |

### 7. Rubrics (`/api/v1/rubrics` & `/api/v1/events/{id}/rubrics`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/events/{event_id}/rubrics` | `POST` | Owner / Admin | `{ name, criteria: [{ name, description?, weight, max_score?, ordering? }] }` | `201 Created` | Create rubric (weights must sum to 100%) |
| `/events/{event_id}/rubrics` | `GET` | Public / Auth | None | `200 OK` | List all rubrics for event |
| `/events/{event_id}/rubrics/active` | `GET` | Public / Auth | None | `200 OK` | Fetch active rubric for scoring |
| `/rubrics/{id}` | `GET` | Public / Auth | None | `200 OK` | Fetch rubric by ID |
| `/rubrics/{id}` | `PATCH` | Owner / Admin | `{ name?, status? }` | `200 OK` | Update rubric status |

### 8. Evaluations (`/api/v1/evaluations`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/evaluations` | `POST` | Assigned Judge | `{ project_id, rubric_id?, scores: [{ criterion_id, score, comment? }], notes?, is_draft }` | `200 OK` | Save draft or submit completed evaluation |
| `/evaluations/{id}` | `GET` | Judge / Organizer | None | `200 OK` | Fetch evaluation details |
| `/evaluations/judge/me` | `GET` | Judge | Query: `?event_id=` | `200 OK` | List current judge's submitted/draft evaluations |
| `/projects/{project_id}/evaluations`| `GET` | Owner / Admin | None | `200 OK` | List all judge scores for project |

### 9. Results & Leaderboards (`/api/v1/events/{id}/results`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/events/{event_id}/results` | `GET` | Public / Auth | None | `200 OK` | Fetch normalized scores and deterministic rankings (detailed judge breakdown hidden from public) |

### 10. Exports (`/api/v1/events/{id}/export`)

| Endpoint | Method | Role | Request Body | Response Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/events/{event_id}/export/csv` | `GET` | Owner / Admin | None | `200 OK` (`text/csv`) | Download leaderboard results CSV |
| `/events/{event_id}/export/detailed-csv` | `GET` | Owner / Admin | None | `200 OK` (`text/csv`) | Download granular criteria breakdown CSV |
