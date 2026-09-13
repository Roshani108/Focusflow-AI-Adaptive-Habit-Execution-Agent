from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.milestone import MilestoneResponse


class GoalBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    category: str = "Career"
    deadline: datetime
    target_hours: float = Field(default=40.0, ge=1.0)
    current_skill: str = "Intermediate"
    preferred_days: str = "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    deadline: Optional[datetime] = None
    target_hours: Optional[float] = None
    status: Optional[str] = None
    current_skill: Optional[str] = None
    preferred_days: Optional[str] = None


class GoalResponse(GoalBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    progress_percentage: Optional[float] = 0.0
    total_tasks: Optional[int] = 0
    completed_tasks: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class GoalDetailResponse(GoalResponse):
    milestones: List[MilestoneResponse] = []
