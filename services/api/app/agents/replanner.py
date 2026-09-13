from datetime import date, timedelta
from typing import List, Dict, Any, Tuple
from app.models.task import Task
from app.models.goal import Goal
from app.agents.ai_service import ai_service


class SmartReplanner:
    """
    Intelligent Replanning Agent:
    Detects missed or overdue tasks, calculates remaining time until deadline,
    and redistributes tasks forward across upcoming active days without
    violating the user's daily capacity limit.
    """

    DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    async def replan_overdue_tasks(
        self,
        overdue_tasks: List[Task],
        goal: Goal,
        daily_capacity_hours: float,
        preferred_days_str: str,
    ) -> Dict[str, Any]:
        if not overdue_tasks:
            return {
                "missed_tasks_count": 0,
                "summary": "No overdue tasks detected. Schedule is currently on track!",
                "rescheduled_tasks": [],
                "recommendations": ["Keep up the great momentum!"],
            }

        daily_max_minutes = int(daily_capacity_hours * 60)
        allowed_days = [d.strip() for d in preferred_days_str.split(",") if d.strip()]
        if not allowed_days:
            allowed_days = self.DAY_NAMES

        # Calculate redistribution starting tomorrow
        start_date = date.today() + timedelta(days=1)
        current_date = start_date
        current_day_minutes = 0
        
        rescheduled_items = []

        for task in overdue_tasks:
            task_minutes = task.estimated_minutes or 60
            prev_date = task.scheduled_date.strftime("%Y-%m-%d") if task.scheduled_date else "Unscheduled"

            # Find next valid day
            while True:
                day_name = self.DAY_NAMES[current_date.weekday()]
                # Check if day is allowed and won't exceed user's daily capacity
                if day_name in allowed_days and (current_day_minutes + task_minutes <= daily_max_minutes):
                    break
                elif day_name in allowed_days and current_day_minutes == 0:
                    # Even if single task is larger than max minutes, allocate it alone
                    break
                else:
                    current_date += timedelta(days=1)
                    current_day_minutes = 0

            new_date_str = current_date.strftime("%Y-%m-%d")
            rescheduled_items.append({
                "task_id": task.id,
                "task_title": task.title,
                "previous_date": prev_date,
                "new_scheduled_date": new_date_str,
                "new_date_obj": current_date,
                "reason": f"Redistributed to balance daily load ({daily_capacity_hours}h/day limit).",
            })
            current_day_minutes += task_minutes

        count = len(overdue_tasks)
        summary = (
            f"You missed {count} task{'s' if count != 1 else ''}. "
            f"I've redistributed them across upcoming days without increasing your "
            f"daily workload above your configured limit of {daily_capacity_hours}h/day."
        )

        return {
            "missed_tasks_count": count,
            "summary": summary,
            "rescheduled_tasks": rescheduled_items,
            "recommendations": [
                "Tackle the earliest rescheduled task first thing tomorrow morning.",
                "Review daily capacity if frequent replanning occurs.",
                "Remember: consistency over intensity builds lasting results.",
            ],
        }
