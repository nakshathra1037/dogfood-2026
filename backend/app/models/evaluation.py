import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class EvaluationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    judge_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(Enum(EvaluationStatus, name="evaluation_status_enum"), default=EvaluationStatus.DRAFT, nullable=False, index=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("judge_id", "project_id", name="uq_judge_project_evaluation"),
    )

    # Relationships
    event = relationship("Event", back_populates="evaluations")
    judge = relationship("User", foreign_keys=[judge_id], back_populates="evaluations")
    project = relationship("Project", back_populates="evaluations")
    rubric = relationship("Rubric", back_populates="evaluations")
    scores = relationship("EvaluationScore", back_populates="evaluation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Evaluation id={self.id} judge_id={self.judge_id} project_id={self.project_id} status={self.status}>"
