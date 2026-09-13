from typing import Dict, Any, Tuple


class GoalAnalyzer:
    """
    Step 1 in the AI Pipeline:
    Analyzes goal scope, checks feasibility against user constraints,
    and detects missing parameters.
    """

    def analyze(self, goal: str, parameters: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        cleaned_goal = goal.strip()
        deadline_days = parameters.get("deadline_days", 30)
        daily_hours = parameters.get("daily_available_hours", 2.0)
        skill = parameters.get("current_skill", "Intermediate")

        missing_fields = []
        if len(cleaned_goal) < 5:
            missing_fields.append("Specific goal description")
        if deadline_days <= 0:
            missing_fields.append("Valid deadline timeframe")
        if daily_hours <= 0:
            missing_fields.append("Daily available study/work hours")

        total_available_hours = deadline_days * daily_hours * 0.8  # 80% buffer

        # Compute feasibility rating
        feasibility_score = 90.0
        notes = []
        if total_available_hours < 20:
            feasibility_score -= 25.0
            notes.append("Available time is tight for comprehensive mastery; focus will be kept narrow.")
        if deadline_days < 14 and "interview" in cleaned_goal.lower():
            feasibility_score -= 15.0
            notes.append("Short deadline detected: high-frequency high-yield tasks prioritized.")

        analysis = {
            "is_valid": len(missing_fields) == 0,
            "missing_fields": missing_fields,
            "feasibility_score": max(40.0, min(99.0, feasibility_score)),
            "total_available_hours": total_available_hours,
            "clarification_notes": " ".join(notes) if notes else "Goal constraints appear well-balanced.",
        }
        return len(missing_fields) == 0, analysis
