from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class EvaluationScore(Base):
    __tablename__ = "evaluation_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False, index=True)
    criterion_id = Column(Integer, ForeignKey("rubric_criteria.id", ondelete="RESTRICT"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("evaluation_id", "criterion_id", name="uq_evaluation_criterion"),
    )

    # Relationships
    evaluation = relationship("Evaluation", back_populates="scores")
    criterion = relationship("RubricCriterion", back_populates="scores")

    def __repr__(self):
        return f"<EvaluationScore id={self.id} evaluation_id={self.evaluation_id} criterion_id={self.criterion_id} score={self.score}>"
