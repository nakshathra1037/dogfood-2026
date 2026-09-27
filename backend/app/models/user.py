import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base


class UserRole(str, enum.Enum):
    PARTICIPANT = "PARTICIPANT"
    JUDGE = "JUDGE"
    ORGANIZER = "ORGANIZER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role_enum"), default=UserRole.PARTICIPANT, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    created_events = relationship("Event", back_populates="creator", foreign_keys="[Event.created_by]")
    team_memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")
    judge_assignments = relationship("JudgeAssignment", back_populates="judge", foreign_keys="[JudgeAssignment.judge_id]")
    evaluations = relationship("Evaluation", back_populates="judge", foreign_keys="[Evaluation.judge_id]")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"
