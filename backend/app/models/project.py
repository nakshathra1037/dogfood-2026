import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class ProjectStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    track_id = Column(Integer, ForeignKey("tracks.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    repository_url = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    status = Column(Enum(ProjectStatus, name="project_status_enum"), default=ProjectStatus.DRAFT, nullable=False, index=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("event_id", "name", name="uq_project_event_name"),
    )

    # Relationships
    event = relationship("Event", back_populates="projects")
    team = relationship("Team", back_populates="project")
    track = relationship("Track", back_populates="projects")
    judge_assignments = relationship("JudgeAssignment", back_populates="project", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project id={self.id} event_id={self.event_id} team_id={self.team_id} name={self.name} status={self.status}>"
