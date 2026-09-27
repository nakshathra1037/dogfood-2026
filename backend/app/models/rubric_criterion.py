from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class RubricCriterion(Base):
    __tablename__ = "rubric_criteria"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rubric_id = Column(Integer, ForeignKey("rubrics.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    weight = Column(Float, nullable=False)  # Weight percentage e.g. 25.0
    max_score = Column(Float, default=10.0, nullable=False)
    ordering = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    rubric = relationship("Rubric", back_populates="criteria")
    scores = relationship("EvaluationScore", back_populates="criterion", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<RubricCriterion id={self.id} rubric_id={self.rubric_id} name={self.name} weight={self.weight}>"
