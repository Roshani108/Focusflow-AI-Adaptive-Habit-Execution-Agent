import pytest
from app.agents.goal_analyzer import GoalAnalyzer
from app.agents.priority_engine import PriorityEngine
from app.agents.scheduler import ScheduleGenerator
from app.agents.plan_validator import PlanValidator
from app.agents.mock_provider import MockProvider
from datetime import date


def test_goal_analyzer_missing_inputs():
    analyzer = GoalAnalyzer()
    valid, res = analyzer.analyze("", {"deadline_days": 0, "daily_available_hours": 0})
    assert valid is False
    assert len(res["missing_fields"]) == 3


def test_goal_analyzer_valid_inputs():
    analyzer = GoalAnalyzer()
    valid, res = analyzer.analyze(
        "Pass AWS Solutions Architect Professional exam",
        {"deadline_days": 45, "daily_available_hours": 2.0},
    )
    assert valid is True
    assert res["feasibility_score"] >= 80.0


def test_priority_engine_bounds():
    engine = PriorityEngine()
    dummy_plan = {
        "milestones": [
            {
                "tasks": [
                    {"title": "T1", "priority": "UNKNOWN", "estimated_minutes": 5},
                    {"title": "T2", "priority": "high", "estimated_minutes": 500},
                ]
            }
        ]
    }
    refined = engine.refine(dummy_plan)
    tasks = refined["milestones"][0]["tasks"]
    assert tasks[0]["priority"] == "MEDIUM"
    assert tasks[0]["estimated_minutes"] == 15  # Clamped to min 15m
    assert tasks[1]["priority"] == "HIGH"
    assert tasks[1]["estimated_minutes"] == 180  # Clamped to max 180m


def test_plan_validator():
    validator = PlanValidator()
    # Plan with empty milestones
    valid, _, err = validator.validate({"goal_title": "Test", "duration_weeks": 4, "total_estimated_hours": 20, "milestones": []})
    assert valid is False


@pytest.mark.asyncio
async def test_mock_provider_interview_plan():
    provider = MockProvider()
    plan = await provider.generate_plan(
        "Prepare for software engineering interview",
        {"deadline_days": 30, "daily_available_hours": 2.0},
    )
    assert plan["duration_weeks"] == 4
    assert len(plan["milestones"]) >= 3
    assert "Two-Pointer" in plan["milestones"][0]["tasks"][0]["title"]
