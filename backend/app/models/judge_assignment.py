from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class JudgeAssignment(Base):
    __tablename__ = "judge_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    judge_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("judge_id", "project_id", name="uq_judge_project_assignment"),
    )

    # Relationships
    event = relationship("Event", back_populates="judge_assignments")
    judge = relationship("User", foreign_keys=[judge_id], back_populates="judge_assignments")
    project = relationship("Project", back_populates="judge_assignments")
    assigner = relationship("User", foreign_keys=[assigned_by])

    def __repr__(self):
        return f"<JudgeAssignment id={self.id} judge_id={self.judge_id} project_id={self.project_id}>"
