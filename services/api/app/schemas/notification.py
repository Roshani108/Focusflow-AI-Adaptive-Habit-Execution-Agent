from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "TASK_REMINDER"  # TASK_REMINDER, OVERDUE_TASK, GOAL_DEADLINE, SCHEDULE_CHANGE, AI_RECOMMENDATION
    link: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
