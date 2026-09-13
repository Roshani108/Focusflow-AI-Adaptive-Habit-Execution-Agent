from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.task import TaskResponse


class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 0
    target_date: Optional[datetime] = None
    status: str = "PENDING"  # PENDING, IN_PROGRESS, COMPLETED


class MilestoneCreate(MilestoneBase):
    goal_id: int


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None


class MilestoneResponse(MilestoneBase):
    id: int
    goal_id: int
    created_at: datetime
    updated_at: datetime
    tasks: Optional[List[TaskResponse]] = []

    model_config = ConfigDict(from_attributes=True)
