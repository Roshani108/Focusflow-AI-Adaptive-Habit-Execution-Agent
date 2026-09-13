from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskResponse
from app.schemas.schedule import DayScheduleGroup
from app.schemas.common import APIResponse

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.get("/today", response_model=APIResponse[DayScheduleGroup])
def get_today_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    tasks_raw = (
        db.query(Task)
        .filter(Task.user_id == current_user.id, func.date(Task.scheduled_date) == today)
        .order_by(Task.order_index.asc())
        .all()
    )
    tasks = [TaskResponse.model_validate(t) for t in tasks_raw]
    total_min = sum(t.estimated_minutes for t in tasks)
    completed_min = sum(t.actual_minutes or t.estimated_minutes for t in tasks if t.status == "COMPLETED")

    group = DayScheduleGroup(
        date=today,
        tasks=tasks,
        total_minutes=total_min,
        completed_minutes=completed_min,
    )
    return APIResponse(success=True, data=group)


@router.get("/calendar", response_model=APIResponse[List[DayScheduleGroup]])
def get_calendar_schedule(
    days: int = Query(14, ge=1, le=60),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_date = date.today()
    result = []

    for i in range(days):
        d = start_date + timedelta(days=i)
        tasks_raw = (
            db.query(Task)
            .filter(Task.user_id == current_user.id, func.date(Task.scheduled_date) == d)
            .order_by(Task.order_index.asc())
            .all()
        )
        tasks = [TaskResponse.model_validate(t) for t in tasks_raw]
        total_min = sum(t.estimated_minutes for t in tasks)
        completed_min = sum(t.actual_minutes or t.estimated_minutes for t in tasks if t.status == "COMPLETED")

        result.append(
            DayScheduleGroup(
                date=d,
                tasks=tasks,
                total_minutes=total_min,
                completed_minutes=completed_min,
            )
        )

    return APIResponse(success=True, data=result)
