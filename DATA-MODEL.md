# Data Model Specification

## Overview
This document defines the entity-relationship placeholders for the DOGFOOD 2026 database schema.

## Proposed Entities

### 1. Users
- `id`: UUID (Primary Key)
- `username`: String (Unique)
- `email`: String (Unique)
- `role`: Enum (`organizer`, `judge`, `participant`)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### 2. Hackathons / Events
- `id`: UUID (Primary Key)
- `title`: String
- `description`: Text
- `status`: Enum (`draft`, `active`, `judging`, `completed`)
- `start_time`: Timestamp
- `end_time`: Timestamp
- `created_at`: Timestamp

### 3. Submissions / Projects
- `id`: UUID (Primary Key)
- `hackathon_id`: UUID (Foreign Key -> Hackathons.id)
- `title`: String
- `tagline`: String
- `description`: Text
- `repo_url`: String
- `demo_url`: String
- `team_members`: JSONB / Array
- `created_at`: Timestamp

### 4. Criteria
- `id`: UUID (Primary Key)
- `hackathon_id`: UUID (Foreign Key -> Hackathons.id)
- `name`: String
- `description`: Text
- `weight`: Float
- `max_score`: Integer

### 5. Evaluations / Scores
- `id`: UUID (Primary Key)
- `submission_id`: UUID (Foreign Key -> Submissions.id)
- `judge_id`: UUID (Foreign Key -> Users.id)
- `criterion_id`: UUID (Foreign Key -> Criteria.id)
- `score`: Float
- `feedback`: Text
- `created_at`: Timestamp

## Planned Schema Migrations
Database schema versioning will be managed by Alembic migrations in `/backend/alembic/versions`.
