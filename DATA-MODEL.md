# Data Model Specification — DOGFOOD 2026

## Entity Relationship Overview

```
 [User] <----+ (created_by)
   |         |
   |         +----------- [Event] <-----------+ (event_id)
   |                       |  |  |              |
   | (creator)             |  |  +--> [Track]   |
   +--> [Team] <-----------+  |  |              |
         |  |                 |  +--> [Prize]   |
         |  +--> [Project] <--+                 |
         |         ^  ^                         |
         |         |  +---------+               |
         v         |            |               |
   [TeamMember]    |            |               |
                   |            |               |
 [JudgeAssignment] +            |               |
   (judge_id + project_id)      |               |
                                |               |
 [Evaluation] ------------------+               |
   (judge_id + project_id)                      |
     |                                          |
     +--> [EvaluationScore]                     |
            ^                                   |
            |                                   |
 [RubricCriterion] <--- [Rubric] <--------------+
```

---

## Entities & Tables

### 1. `users`
- `id`: Integer (PK, Autoincrement)
- `name`: String(255), Not Null
- `email`: String(255), Unique, Not Null, Index (Lowercase normalized)
- `password_hash`: String(255), Not Null
- `role`: Enum (`PARTICIPANT`, `JUDGE`, `ORGANIZER`, `ADMIN`), Not Null, Index
- `is_active`: Boolean, Default True, Not Null
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null

### 2. `events`
- `id`: Integer (PK, Autoincrement)
- `name`: String(255), Not Null
- `description`: Text, Nullable
- `start_date`: DateTime (UTC), Not Null
- `end_date`: DateTime (UTC), Not Null
- `created_by`: Integer (FK -> `users.id`), Not Null, Index
- `status`: Enum (`DRAFT`, `ACTIVE`, `ENDED`, `ARCHIVED`), Default `DRAFT`, Index
- `is_public`: Boolean, Default True, Not Null
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null
- **Constraint:** `CHECK (start_date < end_date)`

### 3. `tracks`
- `id`: Integer (PK, Autoincrement)
- `event_id`: Integer (FK -> `events.id`, ON DELETE CASCADE), Not Null, Index
- `name`: String(255), Not Null
- `description`: Text, Nullable
- `is_active`: Boolean, Default True, Not Null
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null
- **Constraint:** `UNIQUE (event_id, name)`

### 4. `prizes`
- `id`: Integer (PK, Autoincrement)
- `event_id`: Integer (FK -> `events.id`, ON DELETE CASCADE), Not Null, Index
- `name`: String(255), Not Null
- `description`: Text, Nullable
- `position`: Integer, Default 1, Not Null
- `amount`: String(100), Nullable
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null

### 5. `teams`
- `id`: Integer (PK, Autoincrement)
- `event_id`: Integer (FK -> `events.id`, ON DELETE CASCADE), Not Null, Index
- `name`: String(255), Not Null
- `invite_code`: String(64), Unique, Not Null, Index
- `created_by`: Integer (FK -> `users.id`), Not Null, Index
- `max_size`: Integer, Default 5, Not Null
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null
- **Constraint:** `UNIQUE (event_id, name)`

### 6. `team_members`
- `id`: Integer (PK, Autoincrement)
- `team_id`: Integer (FK -> `teams.id`, ON DELETE CASCADE), Not Null, Index
- `user_id`: Integer (FK -> `users.id`, ON DELETE CASCADE), Not Null, Index
- `role`: Enum (`LEADER`, `MEMBER`), Default `MEMBER`, Not Null
- `created_at`: DateTime (UTC), Not Null
- **Constraint:** `UNIQUE (team_id, user_id)`

### 7. `projects`
- `id`: Integer (PK, Autoincrement)
- `event_id`: Integer (FK -> `events.id`, ON DELETE CASCADE), Not Null, Index
- `team_id`: Integer (FK -> `teams.id`, ON DELETE CASCADE), Unique, Not Null, Index
- `track_id`: Integer (FK -> `tracks.id`, ON DELETE SET NULL), Nullable, Index
- `name`: String(255), Not Null
- `description`: Text, Nullable
- `repository_url`: String(500), Nullable
- `demo_url`: String(500), Nullable
- `status`: Enum (`DRAFT`, `SUBMITTED`), Default `DRAFT`, Index
- `submitted_at`: DateTime (UTC), Nullable
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null
- **Constraint:** `UNIQUE (event_id, name)`

### 8. `judge_assignments`
- `id`: Integer (PK, Autoincrement)
- `event_id`: Integer (FK -> `events.id`, ON DELETE CASCADE), Not Null, Index
- `judge_id`: Integer (FK -> `users.id`, ON DELETE CASCADE), Not Null, Index
- `project_id`: Integer (FK -> `projects.id`, ON DELETE CASCADE), Not Null, Index
- `assigned_by`: Integer (FK -> `users.id`), Not Null
- `created_at`: DateTime (UTC), Not Null
- **Constraint:** `UNIQUE (judge_id, project_id)`

### 9. `rubrics`
- `id`: Integer (PK, Autoincrement)
- `event_id`: Integer (FK -> `events.id`, ON DELETE CASCADE), Not Null, Index
- `name`: String(255), Not Null
- `status`: Enum (`DRAFT`, `ACTIVE`, `LOCKED`), Default `DRAFT`, Index
- `version`: Integer, Default 1, Not Null
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null

### 10. `rubric_criteria`
- `id`: Integer (PK, Autoincrement)
- `rubric_id`: Integer (FK -> `rubrics.id`, ON DELETE CASCADE), Not Null, Index
- `name`: String(255), Not Null
- `description`: Text, Nullable
- `weight`: Float (Percentage 0-100), Not Null
- `max_score`: Float, Default 10.0, Not Null
- `ordering`: Integer, Default 0, Not Null
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null

### 11. `evaluations`
- `id`: Integer (PK, Autoincrement)
- `event_id`: Integer (FK -> `events.id`, ON DELETE CASCADE), Not Null, Index
- `judge_id`: Integer (FK -> `users.id`, ON DELETE CASCADE), Not Null, Index
- `project_id`: Integer (FK -> `projects.id`, ON DELETE CASCADE), Not Null, Index
- `rubric_id`: Integer (FK -> `rubrics.id`, ON DELETE RESTRICT), Not Null, Index
- `status`: Enum (`DRAFT`, `SUBMITTED`), Default `DRAFT`, Index
- `submitted_at`: DateTime (UTC), Nullable
- `notes`: Text, Nullable
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null
- **Constraint:** `UNIQUE (judge_id, project_id)`

### 12. `evaluation_scores`
- `id`: Integer (PK, Autoincrement)
- `evaluation_id`: Integer (FK -> `evaluations.id`, ON DELETE CASCADE), Not Null, Index
- `criterion_id`: Integer (FK -> `rubric_criteria.id`, ON DELETE RESTRICT), Not Null, Index
- `score`: Float, Not Null
- `comment`: Text, Nullable
- `created_at`: DateTime (UTC), Not Null
- `updated_at`: DateTime (UTC), Not Null
- **Constraint:** `UNIQUE (evaluation_id, criterion_id)`
