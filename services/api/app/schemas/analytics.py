from typing import List, Dict
from pydantic import BaseModel


class DailyCompletionMetric(BaseModel):
    date: str
    completed: int
    missed: int
    rate: float


class GoalProgressMetric(BaseModel):
    goal_id: int
    title: str
    category: str
    progress_percentage: float
    total_tasks: int
    completed_tasks: int


class WorkloadDistribution(BaseModel):
    priority_distribution: Dict[str, int]  # LOW: 5, MEDIUM: 10, HIGH: 4, CRITICAL: 2
    category_distribution: Dict[str, int]  # Career: 12, Learning: 8, Health: 4


class AnalyticsResponse(BaseModel):
    daily_completion_rate: float
    weekly_completion_rate: float
    average_task_completion_minutes: float
    missed_task_frequency: float  # percentage of overdue/missed tasks
    productivity_streak_days: int
    total_completed_tasks: int
    total_focus_hours: float
    daily_trend: List[DailyCompletionMetric]
    goal_breakdown: List[GoalProgressMetric]
    workload: WorkloadDistribution
