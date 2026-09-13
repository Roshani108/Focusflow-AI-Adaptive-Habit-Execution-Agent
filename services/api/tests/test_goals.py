from datetime import datetime, timedelta


def test_create_and_fetch_goal(client, auth_headers):
    deadline = (datetime.utcnow() + timedelta(days=30)).isoformat()
    create_payload = {
        "title": "Master React and System Design",
        "description": "Prepare for tier-1 full stack role",
        "category": "Career",
        "deadline": deadline,
        "target_hours": 50.0,
        "current_skill": "Intermediate",
        "preferred_days": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
    }
    response = client.post("/api/goals", json=create_payload, headers=auth_headers)
    assert response.status_code == 201
    created_id = response.json()["data"]["id"]

    # Fetch all goals
    list_response = client.get("/api/goals", headers=auth_headers)
    assert list_response.status_code == 200
    goals = list_response.json()["data"]
    assert len(goals) == 1
    assert goals[0]["title"] == "Master React and System Design"

    # Fetch detail
    detail_response = client.get(f"/api/goals/{created_id}", headers=auth_headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["data"]["id"] == created_id


def test_generate_and_approve_ai_plan(client, auth_headers):
    # 1. Create base goal
    deadline = (datetime.utcnow() + timedelta(days=21)).isoformat()
    goal_resp = client.post(
        "/api/goals",
        json={
            "title": "Prepare for software engineering interview",
            "description": "DSA and System Design",
            "category": "Career",
            "deadline": deadline,
            "target_hours": 30.0,
        },
        headers=auth_headers,
    )
    goal_id = goal_resp.json()["data"]["id"]

    # 2. Generate AI plan
    plan_gen_resp = client.post(
        f"/api/goals/{goal_id}/generate-plan",
        json={
            "goal": "Prepare for software engineering interview",
            "deadline_days": 21,
            "daily_available_hours": 2.0,
            "current_skill": "Intermediate",
        },
        headers=auth_headers,
    )
    assert plan_gen_resp.status_code == 200
    plan_data = plan_gen_resp.json()["data"]
    assert "structured_plan" in plan_data
    assert len(plan_data["structured_plan"]["milestones"]) > 0

    # 3. Approve AI plan
    approve_resp = client.post(
        f"/api/goals/{goal_id}/approve-plan",
        json={
            "goal_id": goal_id,
            "plan_id": plan_data["plan_id"],
            "modified_plan": plan_data["structured_plan"],
        },
        headers=auth_headers,
    )
    assert approve_resp.status_code == 200
    detail = approve_resp.json()["data"]
    assert len(detail["milestones"]) > 0
    assert len(detail["milestones"][0]["tasks"]) > 0
