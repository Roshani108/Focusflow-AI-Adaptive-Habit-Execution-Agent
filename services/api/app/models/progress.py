from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, Date, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class DailyProgress(Base):
    __tablename__ = "daily_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    tasks_completed = Column(Integer, default=0, nullable=False)
    tasks_missed = Column(Integer, default=0, nullable=False)
    total_minutes_spent = Column(Integer, default=0, nullable=False)
    focus_score = Column(Float, default=100.0, nullable=False)  # 0 to 100
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_daily_progress"),
    )

    # Relationships
    user = relationship("User", back_populates="daily_progress")
