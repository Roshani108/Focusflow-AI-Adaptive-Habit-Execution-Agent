from typing import Dict, Any


class PriorityEngine:
    """
    Step 3 in the AI Pipeline:
    Refines priorities, computes duration boundaries, and normalizes
    task difficulty estimates.
    """

    VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

    def refine(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        milestones = plan_data.get("milestones", [])
        total_minutes = 0

        for milestone in milestones:
            tasks = milestone.get("tasks", [])
            for task in tasks:
                # Normalize priority
                pri = str(task.get("priority", "MEDIUM")).upper()
                if pri not in self.VALID_PRIORITIES:
                    pri = "MEDIUM"
                task["priority"] = pri

                # Bound estimated minutes to realistic focus chunks (15m - 180m)
                est = int(task.get("estimated_minutes", 60))
                est = max(15, min(180, est))
                task["estimated_minutes"] = est
                total_minutes += est

        plan_data["total_estimated_hours"] = round(total_minutes / 60.0, 1)
        return plan_data
