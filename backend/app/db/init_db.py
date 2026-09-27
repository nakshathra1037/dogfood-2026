import asyncio
from datetime import timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import engine, AsyncSessionLocal, Base
from app.models.user import User, UserRole
from app.models.event import Event, EventStatus
from app.models.track import Track
from app.models.prize import Prize
from app.models.team import Team
from app.models.team_member import TeamMember, TeamRole
from app.models.project import Project, ProjectStatus
from app.models.judge_assignment import JudgeAssignment
from app.models.rubric import Rubric, RubricStatus
from app.models.rubric_criterion import RubricCriterion
from app.models.evaluation import Evaluation, EvaluationStatus
from app.models.evaluation_score import EvaluationScore
from app.core.security import get_password_hash, normalize_email
from app.utils.datetime import now_utc


async def init_models():
    """Create database tables if they do not exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_data(db: AsyncSession):
    """Seed initial development and demo data."""
    # Check if already seeded
    existing_admin = (
        await db.execute(select(User).where(User.email == "admin@dogfood.local"))
    ).scalar_one_or_none()
    if existing_admin:
        print("Database already contains seed data. Skipping...")
        return

    print("Seeding initial database demo records...")

    # 1. Users
    admin = User(
        name="System Admin",
        email=normalize_email("admin@dogfood.local"),
        password_hash=get_password_hash("Admin1234!"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    organizer = User(
        name="Elena Organizer",
        email=normalize_email("organizer@dogfood.local"),
        password_hash=get_password_hash("Organizer1234!"),
        role=UserRole.ORGANIZER,
        is_active=True,
    )
    judge1 = User(
        name="Dr. Marcus Judge",
        email=normalize_email("judge1@dogfood.local"),
        password_hash=get_password_hash("Judge1234!"),
        role=UserRole.JUDGE,
        is_active=True,
    )
    judge2 = User(
        name="Sarah TechJudge",
        email=normalize_email("judge2@dogfood.local"),
        password_hash=get_password_hash("Judge1234!"),
        role=UserRole.JUDGE,
        is_active=True,
    )
    alice = User(
        name="Alice Coder",
        email=normalize_email("alice@dogfood.local"),
        password_hash=get_password_hash("Participant1234!"),
        role=UserRole.PARTICIPANT,
        is_active=True,
    )
    bob = User(
        name="Bob Builder",
        email=normalize_email("bob@dogfood.local"),
        password_hash=get_password_hash("Participant1234!"),
        role=UserRole.PARTICIPANT,
        is_active=True,
    )
    carol = User(
        name="Carol Designer",
        email=normalize_email("carol@dogfood.local"),
        password_hash=get_password_hash("Participant1234!"),
        role=UserRole.PARTICIPANT,
        is_active=True,
    )

    db.add_all([admin, organizer, judge1, judge2, alice, bob, carol])
    await db.flush()

    # 2. Event
    now = now_utc()
    event = Event(
        name="Global AI & Web Innovation Hackathon 2026",
        description="Build cutting-edge AI and Web3 applications in 48 hours for global impact.",
        start_date=now - timedelta(days=2),
        end_date=now + timedelta(days=5),
        created_by=organizer.id,
        status=EventStatus.ACTIVE,
        is_public=True,
    )
    db.add(event)
    await db.flush()

    # 3. Tracks
    track_ai = Track(
        event_id=event.id,
        name="AI & Machine Learning",
        description="Applications utilizing Large Language Models, Computer Vision, or intelligent agents.",
    )
    track_web3 = Track(
        event_id=event.id,
        name="Web3 & Decentralized Tech",
        description="Smart contract integrations, decentralized identities, and privacy-preserving tools.",
    )
    track_open = Track(
        event_id=event.id,
        name="Open Innovation & Social Good",
        description="Novel software solutions addressing real-world community and sustainability issues.",
    )
    db.add_all([track_ai, track_web3, track_open])
    await db.flush()

    # 4. Prizes
    prize_1 = Prize(
        event_id=event.id,
        name="1st Place Grand Winner",
        description="Top overall ranked project in the hackathon.",
        position=1,
        amount="$10,000 USD",
    )
    prize_2 = Prize(
        event_id=event.id,
        name="2nd Place Runner Up",
        description="Second highest scoring team.",
        position=2,
        amount="$5,000 USD",
    )
    prize_3 = Prize(
        event_id=event.id,
        name="Best Technical Execution",
        description="Awarded for remarkable architecture and engineering precision.",
        position=3,
        amount="$2,500 USD",
    )
    db.add_all([prize_1, prize_2, prize_3])
    await db.flush()

    # 5. Teams & Members
    team_alpha = Team(
        event_id=event.id,
        name="Alpha Innovators",
        invite_code="ALPHA2026",
        created_by=alice.id,
        max_size=4,
    )
    team_beta = Team(
        event_id=event.id,
        name="Beta Builders",
        invite_code="BETA2026",
        created_by=bob.id,
        max_size=4,
    )
    db.add_all([team_alpha, team_beta])
    await db.flush()

    db.add_all([
        TeamMember(team_id=team_alpha.id, user_id=alice.id, role=TeamRole.LEADER),
        TeamMember(team_id=team_alpha.id, user_id=carol.id, role=TeamRole.MEMBER),
        TeamMember(team_id=team_beta.id, user_id=bob.id, role=TeamRole.LEADER),
    ])
    await db.flush()

    # 6. Projects (Submitted)
    proj1 = Project(
        event_id=event.id,
        team_id=team_alpha.id,
        track_id=track_ai.id,
        name="NeuroVision AI Assistant",
        description="An autonomous vision-language copilot for real-time video accessibility and multimodal assistance.",
        repository_url="https://github.com/dogfood-demo/neurovision-ai",
        demo_url="https://neurovision-demo.local",
        status=ProjectStatus.SUBMITTED,
        submitted_at=now - timedelta(hours=10),
    )
    proj2 = Project(
        event_id=event.id,
        team_id=team_beta.id,
        track_id=track_web3.id,
        name="DecentraDocs Vault",
        description="Zero-knowledge encrypted decentralized document collaboration and cryptographic verification platform.",
        repository_url="https://github.com/dogfood-demo/decentradocs",
        demo_url="https://decentradocs-demo.local",
        status=ProjectStatus.SUBMITTED,
        submitted_at=now - timedelta(hours=8),
    )
    db.add_all([proj1, proj2])
    await db.flush()

    # 7. Rubric & Criteria (sum = 100%)
    rubric = Rubric(
        event_id=event.id,
        name="Official Hackathon Rubric 2026",
        status=RubricStatus.ACTIVE,
        version=1,
    )
    db.add(rubric)
    await db.flush()

    c1 = RubricCriterion(
        rubric_id=rubric.id,
        name="Innovation & Originality",
        description="Uniqueness and creativity of the core idea.",
        weight=30.0,
        max_score=10.0,
        ordering=1,
    )
    c2 = RubricCriterion(
        rubric_id=rubric.id,
        name="Technical Execution",
        description="Architecture, code quality, stability, and depth.",
        weight=30.0,
        max_score=10.0,
        ordering=2,
    )
    c3 = RubricCriterion(
        rubric_id=rubric.id,
        name="Impact & Practical Utility",
        description="Potential to solve real problems effectively.",
        weight=20.0,
        max_score=10.0,
        ordering=3,
    )
    c4 = RubricCriterion(
        rubric_id=rubric.id,
        name="Design & Presentation Polish",
        description="User experience, demo clarity, and UI design.",
        weight=20.0,
        max_score=10.0,
        ordering=4,
    )
    db.add_all([c1, c2, c3, c4])
    await db.flush()

    # 8. Judge Assignments
    db.add_all([
        JudgeAssignment(event_id=event.id, judge_id=judge1.id, project_id=proj1.id, assigned_by=organizer.id),
        JudgeAssignment(event_id=event.id, judge_id=judge1.id, project_id=proj2.id, assigned_by=organizer.id),
        JudgeAssignment(event_id=event.id, judge_id=judge2.id, project_id=proj1.id, assigned_by=organizer.id),
        JudgeAssignment(event_id=event.id, judge_id=judge2.id, project_id=proj2.id, assigned_by=organizer.id),
    ])
    await db.flush()

    # 9. Sample Evaluations
    # Judge 1 evaluations
    eval1_1 = Evaluation(
        event_id=event.id,
        judge_id=judge1.id,
        project_id=proj1.id,
        rubric_id=rubric.id,
        status=EvaluationStatus.SUBMITTED,
        submitted_at=now - timedelta(hours=4),
        notes="Brilliant multimodal AI approach. Very strong technical execution.",
    )
    eval1_2 = Evaluation(
        event_id=event.id,
        judge_id=judge1.id,
        project_id=proj2.id,
        rubric_id=rubric.id,
        status=EvaluationStatus.SUBMITTED,
        submitted_at=now - timedelta(hours=3),
        notes="Solid cryptographic architecture, clean demo.",
    )
    # Judge 2 evaluations
    eval2_1 = Evaluation(
        event_id=event.id,
        judge_id=judge2.id,
        project_id=proj1.id,
        rubric_id=rubric.id,
        status=EvaluationStatus.SUBMITTED,
        submitted_at=now - timedelta(hours=2),
        notes="Great UX and latency. Impressive live computer vision pipeline.",
    )
    eval2_2 = Evaluation(
        event_id=event.id,
        judge_id=judge2.id,
        project_id=proj2.id,
        rubric_id=rubric.id,
        status=EvaluationStatus.SUBMITTED,
        submitted_at=now - timedelta(hours=1),
        notes="Good zero knowledge proof demo, UI needs slightly more work.",
    )

    db.add_all([eval1_1, eval1_2, eval2_1, eval2_2])
    await db.flush()

    # Score entries
    db.add_all([
        # Judge 1 on Proj 1 (NeuroVision)
        EvaluationScore(evaluation_id=eval1_1.id, criterion_id=c1.id, score=9.5, comment="Exceptional idea."),
        EvaluationScore(evaluation_id=eval1_1.id, criterion_id=c2.id, score=9.0, comment="Robust implementation."),
        EvaluationScore(evaluation_id=eval1_1.id, criterion_id=c3.id, score=8.5, comment="High real-world impact."),
        EvaluationScore(evaluation_id=eval1_1.id, criterion_id=c4.id, score=9.0, comment="Clean demo."),
        # Judge 1 on Proj 2 (DecentraDocs)
        EvaluationScore(evaluation_id=eval1_2.id, criterion_id=c1.id, score=8.0, comment="Solid concept."),
        EvaluationScore(evaluation_id=eval1_2.id, criterion_id=c2.id, score=8.5, comment="Well built smart contracts."),
        EvaluationScore(evaluation_id=eval1_2.id, criterion_id=c3.id, score=8.0, comment="Good security use cases."),
        EvaluationScore(evaluation_id=eval1_2.id, criterion_id=c4.id, score=7.5, comment="Standard presentation."),
        # Judge 2 on Proj 1 (NeuroVision)
        EvaluationScore(evaluation_id=eval2_1.id, criterion_id=c1.id, score=9.0, comment="Very innovative."),
        EvaluationScore(evaluation_id=eval2_1.id, criterion_id=c2.id, score=9.5, comment="State of the art model pipeline."),
        EvaluationScore(evaluation_id=eval2_1.id, criterion_id=c3.id, score=9.0, comment="Broad utility."),
        EvaluationScore(evaluation_id=eval2_1.id, criterion_id=c4.id, score=9.5, comment="Superb UI."),
        # Judge 2 on Proj 2 (DecentraDocs)
        EvaluationScore(evaluation_id=eval2_2.id, criterion_id=c1.id, score=8.5, comment="Promising decentralization."),
        EvaluationScore(evaluation_id=eval2_2.id, criterion_id=c2.id, score=8.0, comment="Clean crypto primitives."),
        EvaluationScore(evaluation_id=eval2_2.id, criterion_id=c3.id, score=8.0, comment="Addresses privacy."),
        EvaluationScore(evaluation_id=eval2_2.id, criterion_id=c4.id, score=8.0, comment="Good presentation."),
    ])

    await db.commit()
    print("Seed data successfully inserted!")


async def run_seed():
    await init_models()
    async with AsyncSessionLocal() as session:
        await seed_data(session)


if __name__ == "__main__":
    asyncio.run(run_seed())
