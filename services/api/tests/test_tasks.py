from datetime import datetime, timedelta
from app.models.goal import Goal
from app.models.milestone import Milestone
from app.models.task import Task


def test_task_crud_and_status(client, auth_headers, db_session, test_user):
    # Setup parent goal and milestone
    goal = Goal(
        user_id=test_user.id,
        title="Test Goal",
        deadline=datetime.utcnow() + timedelta(days=10),
        target_hours=10.0,
        preferred_days="Monday,Tuesday",
    )
    db_session.add(goal)
    db_session.commit()

    milestone = Milestone(goal_id=goal.id, title="M1", order_index=1)
    db_session.add(milestone)
    db_session.commit()

    # 1. Create task
    task_payload = {
        "goal_id": goal.id,
        "milestone_id": milestone.id,
        "title": "Study sliding window pattern",
        "description": "Solve Leetcode 209",
        "priority": "HIGH",
        "estimated_minutes": 60,
    }
    create_resp = client.post("/api/tasks", json=task_payload, headers=auth_headers)
    assert create_resp.status_code == 201
    task_id = create_resp.json()["data"]["id"]

    # 2. Mark complete
    complete_resp = client.patch(
        f"/api/tasks/{task_id}/complete",
        params={"actual_minutes": 55},
        headers=auth_headers,
    )
    assert complete_resp.status_code == 200
    assert complete_resp.json()["data"]["status"] == "COMPLETED"
    assert complete_resp.json()["data"]["actual_minutes"] == 55

    # 3. Filter tasks
    list_resp = client.get("/api/tasks?status=COMPLETED", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()["data"]["items"]) == 1
