import json
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.milestone import Milestone
from app.models.task import Task
from app.models.schedule import Schedule
from app.models.ai_plan import AIPlan
from app.models.activity import ActivityLog
from app.models.notification import Notification
from app.repositories.goal_repo import GoalRepository
from app.repositories.task_repo import TaskRepository
from app.schemas.goal import GoalCreate, GoalUpdate
from app.schemas.ai_plan import (
    AIPlanGenerateRequest,
    AIPlanResponse,
    StructuredPlan,
    AIReplanResponse,
    RescheduledTaskItem,
)
from app.agents.goal_analyzer import GoalAnalyzer
from app.agents.task_decomposer import TaskDecomposer
from app.agents.priority_engine import PriorityEngine
from app.agents.scheduler import ScheduleGenerator
from app.agents.plan_validator import PlanValidator
from app.agents.replanner import SmartReplanner
from app.services.redis_service import redis_service


class GoalService:
    def __init__(self, db: Session):
        self.db = db
        self.goal_repo = GoalRepository(db)
        self.task_repo = TaskRepository(db)
        self.analyzer = GoalAnalyzer()
        self.decomposer = TaskDecomposer()
        self.priority_engine = PriorityEngine()
        self.scheduler = ScheduleGenerator()
        self.validator = PlanValidator()
        self.replanner = SmartReplanner()

    def create_goal(self, user_id: int, req: GoalCreate) -> Goal:
        goal = Goal(
            user_id=user_id,
            title=req.title,
            description=req.description,
            category=req.category,
            deadline=req.deadline,
            target_hours=req.target_hours,
            current_skill=req.current_skill,
            preferred_days=req.preferred_days,
            status="ACTIVE",
        )
        created = self.goal_repo.create(goal)

        # Activity log
        log = ActivityLog(
            user_id=user_id,
            entity_type="GOAL",
            entity_id=created.id,
            action="CREATED",
            details=f"Created goal '{created.title}'",
        )
        self.db.add(log)
        self.db.commit()

        redis_service.invalidate_user_cache(user_id)
        return created

    async def generate_ai_plan(self, user_id: int, goal_id: int, req: AIPlanGenerateRequest) -> AIPlanResponse:
        goal = self.goal_repo.get_by_id_and_user(goal_id, user_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found.")

        # Step 1: Goal Analysis & Missing Info Verification
        params = {
            "deadline_days": req.deadline_days,
            "daily_available_hours": req.daily_available_hours,
            "current_skill": req.current_skill,
            "preferred_days": req.preferred_days,
        }
        is_valid, analysis = self.analyzer.analyze(req.goal, params)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=f"Missing essential parameters: {', '.join(analysis['missing_fields'])}",
            )

        # Step 2: Decomposition
        raw_plan = await self.decomposer.decompose(req.goal, params)

        # Step 3: Priority & Duration Engine
        refined_plan = self.priority_engine.refine(raw_plan)

        # Step 4: Schedule Generation
        scheduled_plan = self.scheduler.generate_schedule(
            refined_plan,
            start_date=date.today(),
            daily_capacity_hours=req.daily_available_hours,
            preferred_days_str=req.preferred_days,
        )

        # Step 5: Plan Validation
        valid, validated_plan, err = self.validator.validate(scheduled_plan)
        if not valid:
            raise HTTPException(status_code=500, detail=f"AI plan validation failed: {err}")

        # Store draft AI Plan record in database
        ai_plan = AIPlan(
            goal_id=goal.id,
            user_id=user_id,
            version=1,
            status="DRAFT",
            prompt_input=json.dumps(req.model_dump()),
            raw_plan_json=json.dumps(validated_plan.model_dump()),
        )
        self.db.add(ai_plan)
        self.db.commit()
        self.db.refresh(ai_plan)

        return AIPlanResponse(
            plan_id=ai_plan.id,
            goal_id=goal.id,
            version=ai_plan.version,
            status=ai_plan.status,
            structured_plan=validated_plan,
            created_at=ai_plan.created_at,
        )

    def approve_ai_plan(self, user_id: int, goal_id: int, plan: StructuredPlan, plan_id: Optional[int] = None) -> Goal:
        goal = self.goal_repo.get_by_id_and_user(goal_id, user_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found.")

        # Update or record AI plan status to APPROVED
        if plan_id:
            ai_plan = self.db.query(AIPlan).filter(AIPlan.id == plan_id, AIPlan.user_id == user_id).first()
            if ai_plan:
                ai_plan.status = "APPROVED"

        # Wipe existing milestones/tasks for this goal to avoid duplicate stale state
        self.db.query(Milestone).filter(Milestone.goal_id == goal_id).delete()
        self.db.commit()

        # Insert milestones & tasks
        today = date.today()
        created_tasks_by_title = {}

        for m_idx, m_item in enumerate(plan.milestones):
            target_date = datetime.utcnow() + timedelta(days=m_item.estimated_days or 7)
            milestone = Milestone(
                goal_id=goal_id,
                title=m_item.title,
                description=m_item.description,
                order_index=m_idx + 1,
                target_date=target_date,
                status="PENDING",
            )
            self.db.add(milestone)
            self.db.commit()
            self.db.refresh(milestone)

            for t_idx, t_item in enumerate(m_item.tasks):
                day_offset = t_item.scheduled_day_offset or (m_idx * 3 + t_idx)
                task_date = datetime.utcnow() + timedelta(days=day_offset)

                task = Task(
                    user_id=user_id,
                    goal_id=goal_id,
                    milestone_id=milestone.id,
                    title=t_item.title,
                    description=t_item.description,
                    priority=t_item.priority,
                    status="TODO",
                    estimated_minutes=t_item.estimated_minutes,
                    actual_minutes=0,
                    scheduled_date=task_date,
                    due_date=task_date,
                    order_index=t_idx + 1,
                    tags=t_item.tags or "",
                    notes=t_item.notes or "",
                )
                self.db.add(task)
                self.db.commit()
                self.db.refresh(task)

                created_tasks_by_title[t_item.title] = task

                # Also insert schedule calendar entry
                sch = Schedule(
                    user_id=user_id,
                    task_id=task.id,
                    scheduled_date=task_date.date(),
                    start_time="09:00",
                    duration_minutes=t_item.estimated_minutes,
                    is_completed=False,
                )
                self.db.add(sch)

        # Handle dependencies if titles matched
        for m_item in plan.milestones:
            for t_item in m_item.tasks:
                if t_item.depends_on_task_title and t_item.depends_on_task_title in created_tasks_by_title:
                    dep_task = created_tasks_by_title[t_item.depends_on_task_title]
                    current_task = created_tasks_by_title.get(t_item.title)
                    if current_task and dep_task:
                        self.task_repo.add_dependency(current_task.id, dep_task.id)

        self.db.commit()

        # In-app notification
        notif = Notification(
            user_id=user_id,
            title="AI Plan Approved & Scheduled",
            message=f"Plan for '{goal.title}' is active. Your daily task schedule is ready!",
            type="SCHEDULE_CHANGE",
            link=f"/goals/{goal.id}",
        )
        self.db.add(notif)
        self.db.commit()

        redis_service.invalidate_user_cache(user_id)
        return self.goal_repo.get_goal_detail(goal_id, user_id)

    async def replan_goal(self, user_id: int, goal_id: int) -> AIReplanResponse:
        goal = self.goal_repo.get_by_id_and_user(goal_id, user_id)
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found.")

        # Fetch overdue tasks
        today = date.today()
        overdue_tasks = (
            self.db.query(Task)
            .filter(
                Task.goal_id == goal_id,
                Task.status.in_(["TODO", "IN_PROGRESS", "OVERDUE"]),
                Task.scheduled_date < datetime.combine(today, datetime.min.time()),
            )
            .all()
        )

        user = goal.user
        daily_cap = user.daily_capacity_hours if user else 3.0
        pref_days = user.preferred_days if user else "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"

        replan_result = await self.replanner.replan_overdue_tasks(
            overdue_tasks=overdue_tasks,
            goal=goal,
            daily_capacity_hours=daily_cap,
            preferred_days_str=pref_days,
        )

        # Apply rescheduled dates to database
        rescheduled_items_response = []
        for item in replan_result["rescheduled_tasks"]:
            task = self.task_repo.get(item["task_id"])
            if task and task.user_id == user_id:
                new_date = item["new_date_obj"]
                task.scheduled_date = datetime.combine(new_date, datetime.min.time())
                task.status = "TODO"  # Reset overdue state
                self.db.commit()

                rescheduled_items_response.append(
                    RescheduledTaskItem(
                        task_id=task.id,
                        task_title=task.title,
                        previous_date=item["previous_date"],
                        new_scheduled_date=item["new_scheduled_date"],
                        reason=item["reason"],
                    )
                )

        # Create revised AIPlan record to track version history
        latest_version = (
            self.db.query(AIPlan.version)
            .filter(AIPlan.goal_id == goal_id)
            .order_by(AIPlan.version.desc())
            .first()
        )
        new_version = (latest_version[0] + 1) if latest_version else 2

        new_plan_record = AIPlan(
            goal_id=goal_id,
            user_id=user_id,
            version=new_version,
            status="APPROVED",
            prompt_input=f"Smart Replanning trigger for {len(overdue_tasks)} overdue tasks",
            raw_plan_json=json.dumps(replan_result, default=str),
        )
        self.db.add(new_plan_record)

        # Notify user
        notif = Notification(
            user_id=user_id,
            title="⚠ Schedule Updated by AI",
            message=replan_result["summary"],
            type="SCHEDULE_CHANGE",
            link=f"/goals/{goal.id}",
        )
        self.db.add(notif)
        self.db.commit()

        redis_service.invalidate_user_cache(user_id)

        return AIReplanResponse(
            goal_id=goal.id,
            missed_tasks_count=replan_result["missed_tasks_count"],
            summary=replan_result["summary"],
            rescheduled_tasks=rescheduled_items_response,
            recommendations=replan_result["recommendations"],
            plan_version=new_version,
        )
