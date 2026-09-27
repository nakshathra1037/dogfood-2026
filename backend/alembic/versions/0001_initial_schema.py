"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-09-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('PARTICIPANT', 'JUDGE', 'ORGANIZER', 'ADMIN', name='user_role_enum'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

    # Events table
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'ACTIVE', 'ENDED', 'ARCHIVED', name='event_status_enum'), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('start_date < end_date', name='check_event_start_before_end'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_events_created_by'), 'events', ['created_by'], unique=False)
    op.create_index(op.f('ix_events_id'), 'events', ['id'], unique=False)
    op.create_index(op.f('ix_events_status'), 'events', ['status'], unique=False)

    # Tracks table
    op.create_table(
        'tracks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id', 'name', name='uq_track_event_name')
    )
    op.create_index(op.f('ix_tracks_event_id'), 'tracks', ['event_id'], unique=False)
    op.create_index(op.f('ix_tracks_id'), 'tracks', ['id'], unique=False)

    # Prizes table
    op.create_table(
        'prizes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('amount', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prizes_event_id'), 'prizes', ['event_id'], unique=False)
    op.create_index(op.f('ix_prizes_id'), 'prizes', ['id'], unique=False)

    # Teams table
    op.create_table(
        'teams',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('invite_code', sa.String(length=64), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('max_size', sa.Integer(), nullable=False, server_default=sa.text('5')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id', 'name', name='uq_team_event_name')
    )
    op.create_index(op.f('ix_teams_created_by'), 'teams', ['created_by'], unique=False)
    op.create_index(op.f('ix_teams_event_id'), 'teams', ['event_id'], unique=False)
    op.create_index(op.f('ix_teams_id'), 'teams', ['id'], unique=False)
    op.create_index(op.f('ix_teams_invite_code'), 'teams', ['invite_code'], unique=True)

    # Team members table
    op.create_table(
        'team_members',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.Enum('LEADER', 'MEMBER', name='team_role_enum'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('team_id', 'user_id', name='uq_team_user')
    )
    op.create_index(op.f('ix_team_members_id'), 'team_members', ['id'], unique=False)
    op.create_index(op.f('ix_team_members_team_id'), 'team_members', ['team_id'], unique=False)
    op.create_index(op.f('ix_team_members_user_id'), 'team_members', ['user_id'], unique=False)

    # Projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('track_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('repository_url', sa.String(length=500), nullable=True),
        sa.Column('demo_url', sa.String(length=500), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'SUBMITTED', name='project_status_enum'), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['track_id'], ['tracks.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id', 'name', name='uq_project_event_name')
    )
    op.create_index(op.f('ix_projects_event_id'), 'projects', ['event_id'], unique=False)
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)
    op.create_index(op.f('ix_projects_status'), 'projects', ['status'], unique=False)
    op.create_index(op.f('ix_projects_team_id'), 'projects', ['team_id'], unique=True)
    op.create_index(op.f('ix_projects_track_id'), 'projects', ['track_id'], unique=False)

    # Judge Assignments table
    op.create_table(
        'judge_assignments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('judge_id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('assigned_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['assigned_by'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['judge_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('judge_id', 'project_id', name='uq_judge_project_assignment')
    )
    op.create_index(op.f('ix_judge_assignments_event_id'), 'judge_assignments', ['event_id'], unique=False)
    op.create_index(op.f('ix_judge_assignments_id'), 'judge_assignments', ['id'], unique=False)
    op.create_index(op.f('ix_judge_assignments_judge_id'), 'judge_assignments', ['judge_id'], unique=False)
    op.create_index(op.f('ix_judge_assignments_project_id'), 'judge_assignments', ['project_id'], unique=False)

    # Rubrics table
    op.create_table(
        'rubrics',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'ACTIVE', 'LOCKED', name='rubric_status_enum'), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rubrics_event_id'), 'rubrics', ['event_id'], unique=False)
    op.create_index(op.f('ix_rubrics_id'), 'rubrics', ['id'], unique=False)
    op.create_index(op.f('ix_rubrics_status'), 'rubrics', ['status'], unique=False)

    # Rubric Criteria table
    op.create_table(
        'rubric_criteria',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('rubric_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.Column('max_score', sa.Float(), nullable=False, server_default=sa.text('10.0')),
        sa.Column('ordering', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['rubric_id'], ['rubrics.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rubric_criteria_id'), 'rubric_criteria', ['id'], unique=False)
    op.create_index(op.f('ix_rubric_criteria_rubric_id'), 'rubric_criteria', ['rubric_id'], unique=False)

    # Evaluations table
    op.create_table(
        'evaluations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('judge_id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('rubric_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'SUBMITTED', name='evaluation_status_enum'), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['judge_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['rubric_id'], ['rubrics.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('judge_id', 'project_id', name='uq_judge_project_evaluation')
    )
    op.create_index(op.f('ix_evaluations_event_id'), 'evaluations', ['event_id'], unique=False)
    op.create_index(op.f('ix_evaluations_id'), 'evaluations', ['id'], unique=False)
    op.create_index(op.f('ix_evaluations_judge_id'), 'evaluations', ['judge_id'], unique=False)
    op.create_index(op.f('ix_evaluations_project_id'), 'evaluations', ['project_id'], unique=False)
    op.create_index(op.f('ix_evaluations_rubric_id'), 'evaluations', ['rubric_id'], unique=False)
    op.create_index(op.f('ix_evaluations_status'), 'evaluations', ['status'], unique=False)

    # Evaluation Scores table
    op.create_table(
        'evaluation_scores',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('evaluation_id', sa.Integer(), nullable=False),
        sa.Column('criterion_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['criterion_id'], ['rubric_criteria.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['evaluation_id'], ['evaluations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('evaluation_id', 'criterion_id', name='uq_evaluation_criterion')
    )
    op.create_index(op.f('ix_evaluation_scores_criterion_id'), 'evaluation_scores', ['criterion_id'], unique=False)
    op.create_index(op.f('ix_evaluation_scores_evaluation_id'), 'evaluation_scores', ['evaluation_id'], unique=False)
    op.create_index(op.f('ix_evaluation_scores_id'), 'evaluation_scores', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('evaluation_scores')
    op.drop_table('evaluations')
    op.drop_table('rubric_criteria')
    op.drop_table('rubrics')
    op.drop_table('judge_assignments')
    op.drop_table('projects')
    op.drop_table('team_members')
    op.drop_table('teams')
    op.drop_table('prizes')
    op.drop_table('tracks')
    op.drop_table('events')
    op.drop_table('users')
