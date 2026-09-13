from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.task import TaskResponse


class ScheduleBase(BaseModel):
    task_id: int
    scheduled_date: date
    start_time: Optional[str] = "09:00"
    duration_minutes: int = 60
    is_completed: bool = False


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleResponse(ScheduleBase):
    id: int
    user_id: int
    created_at: datetime
    task: Optional[TaskResponse] = None

    model_config = ConfigDict(from_attributes=True)


class DayScheduleGroup(BaseModel):
    date: date
    tasks: List[TaskResponse] = []
    total_minutes: int = 0
    completed_minutes: int = 0
