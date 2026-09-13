from datetime import datetime, date
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.task import Task
from app.models.task_dependency import TaskDependency
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Session):
        super().__init__(Task, db)

    def get_by_id_and_user(self, task_id: int, user_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    def get_tasks_filtered(
        self,
        user_id: int,
        goal_id: Optional[int] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        scheduled_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Task], int]:
        query = self.db.query(Task).filter(Task.user_id == user_id)

        if goal_id is not None:
            query = query.filter(Task.goal_id == goal_id)
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if scheduled_date:
            query = query.filter(func.date(Task.scheduled_date) == scheduled_date)

        total = query.count()
        tasks = (
            query.order_by(Task.scheduled_date.asc().nulls_last(), Task.order_index.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return tasks, total

    def get_today_tasks(self, user_id: int) -> List[Task]:
        today = date.today()
        return (
            self.db.query(Task)
            .filter(
                Task.user_id == user_id,
                func.date(Task.scheduled_date) == today,
            )
            .order_by(Task.order_index.asc(), Task.priority.desc())
            .all()
        )

    def get_overdue_tasks(self, user_id: int) -> List[Task]:
        today = date.today()
        return (
            self.db.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.status.in_(["TODO", "IN_PROGRESS", "OVERDUE"]),
                func.date(Task.scheduled_date) < today,
            )
            .order_by(Task.scheduled_date.asc())
            .all()
        )

    def get_upcoming_tasks(self, user_id: int, days_ahead: int = 7) -> List[Task]:
        today = date.today()
        return (
            self.db.query(Task)
            .filter(
                Task.user_id == user_id,
                Task.status.in_(["TODO", "IN_PROGRESS"]),
                func.date(Task.scheduled_date) >= today,
            )
            .order_by(Task.scheduled_date.asc())
            .limit(10)
            .all()
        )

    def mark_completed(self, task: Task, actual_minutes: Optional[int] = None) -> Task:
        task.status = "COMPLETED"
        task.completed_at = datetime.utcnow()
        if actual_minutes:
            task.actual_minutes = actual_minutes
        self.db.commit()
        self.db.refresh(task)
        return task

    def add_dependency(self, task_id: int, depends_on_task_id: int) -> None:
        exists = (
            self.db.query(TaskDependency)
            .filter(
                TaskDependency.task_id == task_id,
                TaskDependency.depends_on_task_id == depends_on_task_id,
            )
            .first()
        )
        if not exists:
            dep = TaskDependency(task_id=task_id, depends_on_task_id=depends_on_task_id)
            self.db.add(dep)
            self.db.commit()
