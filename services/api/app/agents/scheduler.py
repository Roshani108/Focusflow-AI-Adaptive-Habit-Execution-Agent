from datetime import date, timedelta
from typing import Dict, Any, List


class ScheduleGenerator:
    """
    Step 4 in the AI Pipeline:
    Maps tasks to realistic calendar days based on daily workload limits
    and user preferred study days without exceeding daily capacity.
    """

    DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    def generate_schedule(
        self,
        plan_data: Dict[str, Any],
        start_date: date,
        daily_capacity_hours: float,
        preferred_days_str: str,
    ) -> Dict[str, Any]:
        daily_max_minutes = int(daily_capacity_hours * 60)
        allowed_days = [d.strip() for d in preferred_days_str.split(",") if d.strip()]
        if not allowed_days:
            allowed_days = self.DAY_NAMES

        milestones = plan_data.get("milestones", [])
        current_date = start_date
        current_day_allocated_minutes = 0

        for milestone in milestones:
            tasks = milestone.get("tasks", [])
            for task in tasks:
                task_minutes = task.get("estimated_minutes", 60)

                # Find the next available valid day where task fits within capacity
                while True:
                    day_name = self.DAY_NAMES[current_date.weekday()]
                    if day_name in allowed_days and (current_day_allocated_minutes + task_minutes <= daily_max_minutes):
                        # Task fits in current day
                        break
                    elif day_name in allowed_days and current_day_allocated_minutes == 0:
                        # Task alone exceeds daily max minutes, still schedule it as sole task for that day
                        break
                    else:
                        # Advance to next day
                        current_date += timedelta(days=1)
                        current_day_allocated_minutes = 0

                offset = (current_date - start_date).days
                task["scheduled_day_offset"] = offset
                task["scheduled_date"] = current_date.strftime("%Y-%m-%d")
                current_day_allocated_minutes += task_minutes

        return plan_data
