from typing import List, Optional
from pydantic import BaseModel
from app.schemas.task import TaskResponse
from app.schemas.goal import GoalResponse


class WeeklyProgressPoint(BaseModel):
    day: str  # Mon, Tue, etc.
    date: str  # YYYY-MM-DD
    completed_tasks: int
    total_tasks: int
    focus_minutes: int


class DashboardSummaryResponse(BaseModel):
    today_tasks: List[TaskResponse]
    today_completion_percentage: float
    today_completed_count: int
    today_total_count: int
    current_streak_days: int
    weekly_progress: List[WeeklyProgressPoint]
    active_goals: List[GoalResponse]
    overdue_tasks: List[TaskResponse]
    upcoming_deadlines: List[TaskResponse]
    productivity_trend: str  # "UPWARD", "STEADY", "NEEDS_ATTENTION"
    ai_recommendations: List[str]
