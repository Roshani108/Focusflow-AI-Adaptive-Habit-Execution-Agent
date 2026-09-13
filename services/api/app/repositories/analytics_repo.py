from datetime import date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.task import Task
from app.models.goal import Goal
from app.models.progress import DailyProgress


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_weekly_progress(self, user_id: int) -> List[Dict[str, Any]]:
        today = date.today()
        start_date = today - timedelta(days=6)
        
        # Query task counts grouped by date
        progress = []
        for i in range(7):
            current_day = start_date + timedelta(days=i)
            day_name = current_day.strftime("%a")
            date_str = current_day.strftime("%Y-%m-%d")
            
            # Tasks scheduled or completed on this day
            completed = (
                self.db.query(func.count(Task.id))
                .filter(
                    Task.user_id == user_id,
                    Task.status == "COMPLETED",
                    func.date(Task.completed_at) == current_day,
                )
                .scalar() or 0
            )
            total = (
                self.db.query(func.count(Task.id))
                .filter(
                    Task.user_id == user_id,
                    func.date(Task.scheduled_date) == current_day,
                )
                .scalar() or completed
            )
            minutes = (
                self.db.query(func.sum(Task.actual_minutes))
                .filter(
                    Task.user_id == user_id,
                    func.date(Task.completed_at) == current_day,
                )
                .scalar() or 0
            )
            
            progress.append({
                "day": day_name,
                "date": date_str,
                "completed_tasks": completed,
                "total_tasks": max(total, completed),
                "focus_minutes": int(minutes),
            })
        return progress

    def calculate_streak(self, user_id: int) -> int:
        today = date.today()
        streak = 0
        current = today
        
        while True:
            completed_count = (
                self.db.query(func.count(Task.id))
                .filter(
                    Task.user_id == user_id,
                    Task.status == "COMPLETED",
                    func.date(Task.completed_at) == current,
                )
                .scalar() or 0
            )
            if completed_count > 0:
                streak += 1
                current -= timedelta(days=1)
            else:
                # If today has no completions yet, check if yesterday had completions
                if current == today:
                    current -= timedelta(days=1)
                    continue
                break
        return streak

    def get_workload_distribution(self, user_id: int) -> Dict[str, Dict[str, int]]:
        # Priority distribution
        priority_rows = (
            self.db.query(Task.priority, func.count(Task.id))
            .filter(Task.user_id == user_id)
            .group_by(Task.priority)
            .all()
        )
        priorities = {row[0]: row[1] for row in priority_rows}
        for p in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
            if p not in priorities:
                priorities[p] = 0

        # Category distribution from linked goals
        cat_rows = (
            self.db.query(Goal.category, func.count(Task.id))
            .join(Task, Task.goal_id == Goal.id)
            .filter(Goal.user_id == user_id)
            .group_by(Goal.category)
            .all()
        )
        categories = {row[0]: row[1] for row in cat_rows}

        return {
            "priority_distribution": priorities,
            "category_distribution": categories,
        }

    def get_summary_metrics(self, user_id: int) -> Dict[str, Any]:
        total_tasks = self.db.query(func.count(Task.id)).filter(Task.user_id == user_id).scalar() or 0
        completed_tasks = (
            self.db.query(func.count(Task.id))
            .filter(Task.user_id == user_id, Task.status == "COMPLETED")
            .scalar() or 0
        )
        overdue_tasks = (
            self.db.query(func.count(Task.id))
            .filter(
                Task.user_id == user_id,
                Task.status.in_(["TODO", "IN_PROGRESS", "OVERDUE"]),
                func.date(Task.scheduled_date) < date.today(),
            )
            .scalar() or 0
        )
        total_minutes = (
            self.db.query(func.sum(Task.actual_minutes))
            .filter(Task.user_id == user_id, Task.status == "COMPLETED")
            .scalar() or 0
        )
        
        avg_minutes = (
            self.db.query(func.avg(Task.actual_minutes))
            .filter(Task.user_id == user_id, Task.status == "COMPLETED")
            .scalar() or 45.0
        )

        daily_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0
        missed_freq = round((overdue_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "overdue_tasks": overdue_tasks,
            "total_focus_hours": round(total_minutes / 60.0, 1),
            "average_task_completion_minutes": round(float(avg_minutes), 1),
            "daily_completion_rate": daily_rate,
            "missed_task_frequency": missed_freq,
        }
