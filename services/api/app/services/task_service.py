from datetime import datetime, date
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.task import Task
from app.models.milestone import Milestone
from app.models.progress import DailyProgress
from app.models.activity import ActivityLog
from app.repositories.task_repo import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskBatchUpdateItem
from app.services.redis_service import redis_service


class TaskService:
    def __init__(self, db: Session):
        self.db = db
        self.task_repo = TaskRepository(db)

    def get_task(self, task_id: int, user_id: int) -> Task:
        task = self.task_repo.get_by_id_and_user(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found.")
        return task

    def create_task(self, user_id: int, req: TaskCreate) -> Task:
        # Check milestone ownership
        milestone = self.db.query(Milestone).filter(Milestone.id == req.milestone_id).first()
        if not milestone or milestone.goal.user_id != user_id:
            raise HTTPException(status_code=400, detail="Invalid milestone.")

        task = Task(
            user_id=user_id,
            goal_id=req.goal_id,
            milestone_id=req.milestone_id,
            title=req.title,
            description=req.description,
            priority=req.priority,
            status=req.status,
            estimated_minutes=req.estimated_minutes,
            actual_minutes=req.actual_minutes,
            due_date=req.due_date,
            scheduled_date=req.scheduled_date or datetime.utcnow(),
            order_index=req.order_index,
            tags=req.tags or "",
            notes=req.notes or "",
        )
        created = self.task_repo.create(task)

        # Handle dependencies
        if req.depends_on_ids:
            for dep_id in req.depends_on_ids:
                self.task_repo.add_dependency(created.id, dep_id)

        redis_service.invalidate_user_cache(user_id)
        return created

    def update_task(self, task_id: int, user_id: int, req: TaskUpdate) -> Task:
        task = self.get_task(task_id, user_id)
        update_data = req.model_dump(exclude_unset=True)

        depends_on = update_data.pop("depends_on_ids", None)
        for key, value in update_data.items():
            setattr(task, key, value)

        if depends_on is not None:
            # Recreate dependencies
            from app.models.task_dependency import TaskDependency
            self.db.query(TaskDependency).filter(TaskDependency.task_id == task.id).delete()
            for dep_id in depends_on:
                self.task_repo.add_dependency(task.id, dep_id)

        self.db.commit()
        self.db.refresh(task)
        redis_service.invalidate_user_cache(user_id)
        return task

    def update_task_status(self, task_id: int, user_id: int, req: TaskStatusUpdate) -> Task:
        task = self.get_task(task_id, user_id)
        previous_status = task.status
        task.status = req.status

        if req.status == "COMPLETED":
            task.completed_at = datetime.utcnow()
            if req.actual_minutes:
                task.actual_minutes = req.actual_minutes
            elif not task.actual_minutes:
                task.actual_minutes = task.estimated_minutes

            # Record in DailyProgress
            today = date.today()
            progress = (
                self.db.query(DailyProgress)
                .filter(DailyProgress.user_id == user_id, DailyProgress.date == today)
                .first()
            )
            if not progress:
                progress = DailyProgress(
                    user_id=user_id,
                    date=today,
                    tasks_completed=1,
                    total_minutes_spent=task.actual_minutes,
                    focus_score=100.0,
                )
                self.db.add(progress)
            else:
                progress.tasks_completed += 1
                progress.total_minutes_spent += task.actual_minutes
        elif previous_status == "COMPLETED" and req.status != "COMPLETED":
            task.completed_at = None

        self.db.commit()
        self.db.refresh(task)

        # Audit log
        log = ActivityLog(
            user_id=user_id,
            entity_type="TASK",
            entity_id=task.id,
            action="COMPLETED" if req.status == "COMPLETED" else "UPDATED",
            details=f"Task '{task.title}' status changed to {req.status}",
        )
        self.db.add(log)
        self.db.commit()

        redis_service.invalidate_user_cache(user_id)
        return task

    def delete_task(self, task_id: int, user_id: int) -> None:
        task = self.get_task(task_id, user_id)
        self.task_repo.delete(task)
        redis_service.invalidate_user_cache(user_id)

    def batch_update(self, user_id: int, items: List[TaskBatchUpdateItem]) -> List[Task]:
        updated = []
        for item in items:
            task = self.task_repo.get_by_id_and_user(item.id, user_id)
            if task:
                if item.status:
                    task.status = item.status
                    if item.status == "COMPLETED" and not task.completed_at:
                        task.completed_at = datetime.utcnow()
                if item.order_index is not None:
                    task.order_index = item.order_index
                if item.scheduled_date:
                    task.scheduled_date = item.scheduled_date
                updated.append(task)
        self.db.commit()
        redis_service.invalidate_user_cache(user_id)
        return updated
