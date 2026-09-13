from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.goal import Goal
from app.models.milestone import Milestone
from app.models.task import Task
from app.repositories.base import BaseRepository


class GoalRepository(BaseRepository[Goal]):
    def __init__(self, db: Session):
        super().__init__(Goal, db)

    def get_user_goals(self, user_id: int, status: Optional[str] = None) -> List[dict]:
        query = self.db.query(Goal).filter(Goal.user_id == user_id)
        if status:
            query = query.filter(Goal.status == status)
        
        goals = query.order_by(Goal.created_at.desc()).all()
        results = []
        for goal in goals:
            total_tasks = self.db.query(func.count(Task.id)).filter(Task.goal_id == goal.id).scalar() or 0
            completed_tasks = (
                self.db.query(func.count(Task.id))
                .filter(Task.goal_id == goal.id, Task.status == "COMPLETED")
                .scalar() or 0
            )
            pct = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0
            
            results.append({
                "goal": goal,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "progress_percentage": pct,
            })
        return results

    def get_goal_detail(self, goal_id: int, user_id: int) -> Optional[Goal]:
        return (
            self.db.query(Goal)
            .options(
                joinedload(Goal.milestones).joinedload(Milestone.tasks)
            )
            .filter(Goal.id == goal_id, Goal.user_id == user_id)
            .first()
        )

    def get_by_id_and_user(self, goal_id: int, user_id: int) -> Optional[Goal]:
        return self.db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
