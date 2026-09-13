from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class TaskDependencyResponse(BaseModel):
    task_id: int
    depends_on_task_id: int

    model_config = ConfigDict(from_attributes=True)


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    status: str = "TODO"  # TODO, IN_PROGRESS, COMPLETED, OVERDUE, SKIPPED
    estimated_minutes: int = Field(default=60, ge=5, le=480)
    actual_minutes: int = 0
    due_date: Optional[datetime] = None
    scheduled_date: Optional[datetime] = None
    order_index: int = 0
    tags: Optional[str] = ""
    notes: Optional[str] = None


class TaskCreate(TaskBase):
    milestone_id: int
    goal_id: int
    depends_on_ids: Optional[List[int]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    estimated_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None
    due_date: Optional[datetime] = None
    scheduled_date: Optional[datetime] = None
    order_index: Optional[int] = None
    tags: Optional[str] = None
    notes: Optional[str] = None
    milestone_id: Optional[int] = None
    depends_on_ids: Optional[List[int]] = None


class TaskStatusUpdate(BaseModel):
    status: str  # TODO, IN_PROGRESS, COMPLETED, OVERDUE, SKIPPED
    actual_minutes: Optional[int] = None


class TaskBatchUpdateItem(BaseModel):
    id: int
    status: Optional[str] = None
    order_index: Optional[int] = None
    scheduled_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    id: int
    user_id: int
    goal_id: int
    milestone_id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    updated_at: datetime
    depends_on_ids: Optional[List[int]] = []

    model_config = ConfigDict(from_attributes=True)
