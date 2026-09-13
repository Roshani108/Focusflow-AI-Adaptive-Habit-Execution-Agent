from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), default="Career", nullable=False)
    deadline = Column(DateTime, nullable=False)
    target_hours = Column(Float, default=40.0, nullable=False)
    status = Column(String(32), default="ACTIVE", nullable=False)  # ACTIVE, COMPLETED, ARCHIVED, PAUSED
    current_skill = Column(String(64), default="Intermediate", nullable=False)
    preferred_days = Column(String(255), default="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="goals")
    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan", order_by="Milestone.order_index")
    tasks = relationship("Task", back_populates="goal", cascade="all, delete-orphan")
    ai_plans = relationship("AIPlan", back_populates="goal", cascade="all, delete-orphan")
