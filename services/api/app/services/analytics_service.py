from datetime import date
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.task import Task
from app.models.goal import Goal
from app.repositories.task_repo import TaskRepository
from app.repositories.goal_repo import GoalRepository
from app.repositories.analytics_repo import AnalyticsRepository
from app.schemas.dashboard import DashboardSummaryResponse, WeeklyProgressPoint
from app.schemas.analytics import (
    AnalyticsResponse,
    DailyCompletionMetric,
    GoalProgressMetric,
    WorkloadDistribution,
)
from app.schemas.task import TaskResponse
from app.schemas.goal import GoalResponse
from app.services.redis_service import redis_service


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        self.task_repo = TaskRepository(db)
        self.goal_repo = GoalRepository(db)
        self.analytics_repo = AnalyticsRepository(db)

    def get_dashboard_summary(self, user_id: int) -> DashboardSummaryResponse:
        cache_key = f"user:{user_id}:dashboard"
        cached = redis_service.get_json(cache_key)
        if cached:
            return DashboardSummaryResponse(**cached)

        # 1. Today's tasks
        today_tasks_raw = self.task_repo.get_today_tasks(user_id)
        today_tasks = [TaskResponse.model_validate(t) for t in today_tasks_raw]
        today_total = len(today_tasks)
        today_completed = sum(1 for t in today_tasks if t.status == "COMPLETED")
        today_pct = round((today_completed / today_total * 100), 1) if today_total > 0 else 0.0

        # 2. Current streak
        streak = self.analytics_repo.calculate_streak(user_id)

        # 3. Weekly progress
        weekly_raw = self.analytics_repo.get_weekly_progress(user_id)
        weekly = [WeeklyProgressPoint(**w) for w in weekly_raw]

        # 4. Active goals
        active_goals_raw = self.goal_repo.get_user_goals(user_id, status="ACTIVE")
        active_goals = []
        for item in active_goals_raw:
            g = item["goal"]
            active_goals.append(
                GoalResponse(
                    id=g.id,
                    user_id=g.user_id,
                    title=g.title,
                    description=g.description,
                    category=g.category,
                    deadline=g.deadline,
                    target_hours=g.target_hours,
                    status=g.status,
                    current_skill=g.current_skill,
                    preferred_days=g.preferred_days,
                    created_at=g.created_at,
                    updated_at=g.updated_at,
                    progress_percentage=item["progress_percentage"],
                    total_tasks=item["total_tasks"],
                    completed_tasks=item["completed_tasks"],
                )
            )

        # 5. Overdue and upcoming
        overdue_raw = self.task_repo.get_overdue_tasks(user_id)
        overdue = [TaskResponse.model_validate(t) for t in overdue_raw]

        upcoming_raw = self.task_repo.get_upcoming_tasks(user_id, days_ahead=7)
        upcoming = [TaskResponse.model_validate(t) for t in upcoming_raw]

        # 6. Productivity trend
        if today_pct >= 75:
            trend = "UPWARD"
        elif len(overdue) > 2:
            trend = "NEEDS_ATTENTION"
        else:
            trend = "STEADY"

        # 7. Dynamic AI recommendations
        recommendations = []
        if overdue:
            recommendations.append(
                f"You have {len(overdue)} overdue task{'s' if len(overdue) > 1 else ''}. Use Smart Replanning to redistribute workload safely."
            )
        if today_total == 0:
            recommendations.append("No tasks scheduled for today. Review your active goals to generate or assign work.")
        elif today_completed == today_total:
            recommendations.append("All scheduled tasks for today are completed! Great work maintaining your streak.")
        else:
            recommendations.append("Complete your highest-priority task first to maximize cognitive focus.")

        summary = DashboardSummaryResponse(
            today_tasks=today_tasks,
            today_completion_percentage=today_pct,
            today_completed_count=today_completed,
            today_total_count=today_total,
            current_streak_days=streak,
            weekly_progress=weekly,
            active_goals=active_goals,
            overdue_tasks=overdue,
            upcoming_deadlines=upcoming,
            productivity_trend=trend,
            ai_recommendations=recommendations,
        )

        redis_service.set_json(cache_key, summary.model_dump(mode="json"), ttl_seconds=180)
        return summary

    def get_analytics(self, user_id: int) -> AnalyticsResponse:
        cache_key = f"user:{user_id}:analytics"
        cached = redis_service.get_json(cache_key)
        if cached:
            return AnalyticsResponse(**cached)

        metrics = self.analytics_repo.get_summary_metrics(user_id)
        weekly = self.analytics_repo.get_weekly_progress(user_id)
        streak = self.analytics_repo.calculate_streak(user_id)
        dist = self.analytics_repo.get_workload_distribution(user_id)

        # Build daily trend
        daily_trends = []
        for w in weekly:
            completed = w["completed_tasks"]
            total = w["total_tasks"]
            missed = max(0, total - completed)
            rate = round((completed / total * 100), 1) if total > 0 else 0.0
            daily_trends.append(
                DailyCompletionMetric(
                    date=w["date"],
                    completed=completed,
                    missed=missed,
                    rate=rate,
                )
            )

        # Goal breakdown
        goals_data = self.goal_repo.get_user_goals(user_id)
        goal_breakdowns = [
            GoalProgressMetric(
                goal_id=item["goal"].id,
                title=item["goal"].title,
                category=item["goal"].category,
                progress_percentage=item["progress_percentage"],
                total_tasks=item["total_tasks"],
                completed_tasks=item["completed_tasks"],
            )
            for item in goals_data
        ]

        total_completed_week = sum(w["completed_tasks"] for w in weekly)
        total_tasks_week = sum(w["total_tasks"] for w in weekly)
        weekly_rate = round((total_completed_week / total_tasks_week * 100), 1) if total_tasks_week > 0 else 0.0

        analytics = AnalyticsResponse(
            daily_completion_rate=metrics["daily_completion_rate"],
            weekly_completion_rate=weekly_rate,
            average_task_completion_minutes=metrics["average_task_completion_minutes"],
            missed_task_frequency=metrics["missed_task_frequency"],
            productivity_streak_days=streak,
            total_completed_tasks=metrics["completed_tasks"],
            total_focus_hours=metrics["total_focus_hours"],
            daily_trend=daily_trends,
            goal_breakdown=goal_breakdowns,
            workload=WorkloadDistribution(
                priority_distribution=dist["priority_distribution"],
                category_distribution=dist["category_distribution"],
            ),
        )

        redis_service.set_json(cache_key, analytics.model_dump(mode="json"), ttl_seconds=300)
        return analytics
