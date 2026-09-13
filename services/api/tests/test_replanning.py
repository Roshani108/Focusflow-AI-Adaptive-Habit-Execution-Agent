import pytest
from datetime import datetime, timedelta
from app.models.task import Task
from app.models.goal import Goal
from app.agents.replanner import SmartReplanner


@pytest.mark.asyncio
async def test_smart_replanner_overdue_tasks():
    replanner = SmartReplanner()

    goal = Goal(
        title="Frontend Mastery",
        deadline=datetime.utcnow() + timedelta(days=20),
        target_hours=20.0,
    )

    # 3 simulated overdue tasks
    overdue = [
        Task(
            id=101,
            title="Arrays Deep Dive",
            estimated_minutes=90,
            scheduled_date=datetime.utcnow() - timedelta(days=2),
        ),
        Task(
            id=102,
            title="Trees & LCA",
            estimated_minutes=80,
            scheduled_date=datetime.utcnow() - timedelta(days=1),
        ),
        Task(
            id=103,
            title="Graph DFS",
            estimated_minutes=60,
            scheduled_date=datetime.utcnow() - timedelta(days=1),
        ),
    ]

    res = await replanner.replan_overdue_tasks(
        overdue_tasks=overdue,
        goal=goal,
        daily_capacity_hours=2.0,
        preferred_days_str="Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    )

    assert res["missed_tasks_count"] == 3
    assert "redistributed" in res["summary"].lower()
    assert len(res["rescheduled_tasks"]) == 3
    # Check that day capacity is respected (90 min and 80 min cannot be on the same day when capacity is 120m)
    task1_date = res["rescheduled_tasks"][0]["new_scheduled_date"]
    task2_date = res["rescheduled_tasks"][1]["new_scheduled_date"]
    assert task1_date != task2_date
