from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PlanTaskItem(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    estimated_minutes: int = 60
    scheduled_day_offset: int = 0  # Days from start
    tags: Optional[str] = ""
    notes: Optional[str] = ""
    depends_on_task_title: Optional[str] = None


class PlanMilestoneItem(BaseModel):
    title: str
    description: Optional[str] = ""
    order_index: int = 0
    estimated_days: int = 7
    tasks: List[PlanTaskItem] = []


class StructuredPlan(BaseModel):
    goal_title: str
    duration_weeks: int
    total_estimated_hours: float
    feasibility_score: float = 85.0  # 0 to 100
    clarification_notes: Optional[str] = None
    milestones: List[PlanMilestoneItem] = []
    recommendations: List[str] = []


class AIPlanGenerateRequest(BaseModel):
    goal: str = Field(..., min_length=3, max_length=500)
    deadline_days: int = Field(default=30, ge=1, le=365)
    daily_available_hours: float = Field(default=2.0, ge=0.5, le=16.0)
    current_skill: str = "Intermediate"
    preferred_days: str = "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
    category: Optional[str] = "Career"
    additional_context: Optional[str] = None


class AIPlanResponse(BaseModel):
    plan_id: Optional[int] = None
    goal_id: Optional[int] = None
    version: int = 1
    status: str = "DRAFT"
    structured_plan: StructuredPlan
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AIPlanApproveRequest(BaseModel):
    plan_id: Optional[int] = None
    goal_id: int
    modified_plan: Optional[StructuredPlan] = None


class RescheduledTaskItem(BaseModel):
    task_id: int
    task_title: str
    previous_date: Optional[str] = None
    new_scheduled_date: str
    reason: str


class AIReplanResponse(BaseModel):
    goal_id: int
    missed_tasks_count: int
    summary: str
    rescheduled_tasks: List[RescheduledTaskItem] = []
    recommendations: List[str] = []
    plan_version: int
